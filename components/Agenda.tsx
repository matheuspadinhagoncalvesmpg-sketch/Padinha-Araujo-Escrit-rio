import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, EventType, EventStatus, UserRole } from '../types';
import { Card, Badge, Modal, Button, Input } from './ui/LayoutComponents';
import { ChevronLeft, ChevronRight, Clock, MessageSquare, Plus, CheckCircle, Search, Filter, X } from 'lucide-react';
import EventDetailsModal from './EventDetailsModal';
import EventFormModal from './EventFormModal';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Agenda() {
  const { events, currentUser, updateEventDate, canCreate, users, canViewAll } = useApp();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(start.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    if (currentUser?.role !== UserRole.ADMIN) return; 
    e.dataTransfer.setData('eventId', eventId);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (currentUser?.role !== UserRole.ADMIN) return;
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      updateEventDate(eventId, dateStr);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const visibleEvents = events.filter(e => {
    // 1. Permission Access Check
    let hasAccess = false;
    if (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.LAWYER) {
        hasAccess = true;
    } else if (currentUser?.role === UserRole.INTERN) {
        hasAccess = e.assignedToIds.includes(currentUser.id);
    }
    
    if (!hasAccess) return false;

    // 2. User Filter (for those who can view all)
    if (filterUserId && !e.assignedToIds.includes(filterUserId)) {
        return false;
    }

    // 3. Status Filter
    if (filterStatus !== 'ALL') {
        if (filterStatus === 'PENDING' && e.status === EventStatus.COMPLETED) return false;
        if (filterStatus === 'COMPLETED' && e.status !== EventStatus.COMPLETED) return false;
    }

    // 4. Search Term
    if (searchTerm) {
        return e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header / Filter Bar */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-[#0e1b2e] flex items-center gap-2">
                Compromissos e Tarefas
                <Search size={18} className="text-slate-400" />
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#0e1b2e] font-medium cursor-pointer hover:underline">
                Mesa de trabalho
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-center">
             <div className="flex-1 relative w-full">
                <input 
                    type="text" 
                    placeholder="Pesquisar em compromissos e tarefas..."
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-[#0e1b2e] outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             {canViewAll() && (
                 <div className="w-full md:w-auto">
                    <select 
                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white"
                        value={filterUserId}
                        onChange={(e) => setFilterUserId(e.target.value)}
                    >
                        <option value="">Todos os Membros</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                 </div>
             )}

             <div className="flex gap-2 w-full md:w-auto">
                 <select 
                    className="flex-1 md:w-auto border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                 >
                     <option value="ALL">Todos os status</option>
                     <option value="PENDING">Pendentes</option>
                     <option value="COMPLETED">Concluídos</option>
                 </select>
             </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
             <div className="flex items-center gap-2">
                 <span className="text-sm font-bold text-slate-700">Agendas exibidas:</span>
                 {filterUserId ? (
                     <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                        <span className="text-xs text-slate-700 font-medium">
                            {users.find(u => u.id === filterUserId)?.name}
                        </span>
                        <button onClick={() => setFilterUserId('')} className="text-slate-400 hover:text-red-500">
                            <X size={12}/>
                        </button>
                     </div>
                 ) : (
                     <div className="bg-[#0e1b2e] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-white" title="Todos">
                        {canViewAll() ? 'ALL' : currentUser?.name.substring(0,2).toUpperCase()}
                     </div>
                 )}
             </div>
             <div className="flex items-center gap-2">
                 <div className="flex border border-slate-300 rounded-sm overflow-hidden">
                     <button className="px-3 py-1 text-xs bg-slate-50 hover:bg-slate-100 border-r">Hoje</button>
                     <button className="px-3 py-1 text-xs bg-slate-50 hover:bg-slate-100 border-r">Dia</button>
                     <button className="px-3 py-1 text-xs bg-slate-50 hover:bg-slate-100 border-r">Semana</button>
                     <button className="px-3 py-1 text-xs bg-white font-bold text-[#0e1b2e]">Mês</button>
                 </div>
                 {canCreate() && (
                    <Button className="rounded-sm py-1 px-3 text-xs flex items-center gap-1" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={14} /> Adicionar
                    </Button>
                 )}
             </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center p-2 bg-slate-50 border-b border-slate-200">
          <Button variant="ghost" onClick={handlePrevWeek} className="p-1"><ChevronLeft size={16}/></Button>
          <span className="mx-4 text-sm font-bold text-slate-700">
            {weekDates[0].toLocaleDateString('pt-BR')} - {weekDates[6].toLocaleDateString('pt-BR')}
          </span>
          <Button variant="ghost" onClick={handleNextWeek} className="p-1"><ChevronRight size={16}/></Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white">
        <div className="flex h-full min-w-[1000px]">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayEvents = visibleEvents.filter(e => e.date === dateStr);

            return (
              <div 
                key={dateStr}
                className={`flex-1 flex flex-col border-r border-slate-200 last:border-r-0 min-w-[140px] ${isToday ? 'bg-slate-50' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <div className="p-2 text-right border-b border-slate-100">
                  <span className="text-xs text-slate-400 mr-2">{DAYS[date.getDay()]}</span>
                  <span className={`text-sm font-bold ${isToday ? 'text-[#0e1b2e]' : 'text-slate-600'}`}>
                    {date.getDate()}
                  </span>
                </div>

                <div className="flex-1 p-2 overflow-y-auto space-y-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      draggable={currentUser?.role === UserRole.ADMIN}
                      onDragStart={(e) => handleDragStart(e, event.id)}
                      onClick={() => setSelectedEvent(event)}
                      className={`
                        bg-white p-2 rounded shadow-sm border border-slate-200 cursor-pointer group hover:shadow-md transition-all
                        relative pl-3
                        ${event.status === EventStatus.COMPLETED ? 'opacity-60' : ''}
                      `}
                    >
                      {/* Left Border Color Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${
                          event.type === EventType.APPOINTMENT ? 'bg-blue-600' : 'bg-teal-600'
                      }`}></div>

                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                            {event.type === EventType.APPOINTMENT ? 'Compromisso' : 'Tarefa'}
                        </p>
                        {event.time && <span className="text-[10px] font-bold text-slate-700">{event.time}</span>}
                      </div>
                      
                      <p className="text-xs font-bold text-[#0e1b2e] leading-snug mt-1 mb-1 line-clamp-3">
                        {event.title}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                         <div className="flex -space-x-1">
                            {event.assignedToIds.slice(0, 3).map(uid => {
                                const user = users.find(u => u.id === uid);
                                if (!user) return null;
                                return (
                                    <div key={uid} className="w-4 h-4 rounded-full bg-slate-300 ring-1 ring-white flex items-center justify-center text-[8px] overflow-hidden">
                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : user.name[0]}
                                    </div>
                                );
                            })}
                         </div>
                         {event.chatMessages.length > 0 && (
                             <MessageSquare size={12} className="text-slate-400"/>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal 
            event={selectedEvent} 
            isOpen={!!selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
        />
      )}

      {/* New Create Event Modal */}
      <EventFormModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
