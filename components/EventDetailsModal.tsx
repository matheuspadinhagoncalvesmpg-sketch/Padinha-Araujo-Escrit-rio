import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, EventType, EventStatus, UserRole } from '../types';
import { Modal, Button, Badge } from './ui/LayoutComponents';
import { Send, Clock, Calendar, CheckCircle, User as UserIcon, MessageSquare } from 'lucide-react';

interface Props {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: Props) {
  const { users, cases, currentUser, addChatMessage, updateEvent, canEdit } = useApp();
  const [message, setMessage] = useState('');

  const assignedUsers = users.filter(u => event.assignedToIds.includes(u.id));
  const relatedCase = cases.find(c => c.id === event.caseId);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    addChatMessage(event.id, message);
    setMessage('');
  };

  const toggleStatus = () => {
    if (!canEdit()) return;
    const newStatus = event.status === EventStatus.COMPLETED ? EventStatus.PENDING : EventStatus.COMPLETED;
    updateEvent({ ...event, status: newStatus });
  };

  const changeCase = (newCaseId: string) => {
    updateEvent({ ...event, caseId: newCaseId || undefined });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Evento">
      <div className="space-y-6">
        
        {/* Header Info */}
        <div className="flex justify-between items-start">
           <div>
              <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
              <div className="flex items-center space-x-2 mt-1 text-sm text-slate-500">
                <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(event.date).toLocaleDateString()}</span>
                {event.time && <span className="flex items-center"><Clock size={14} className="mr-1"/> {event.time}</span>}
              </div>
           </div>
           <Badge variant={event.status === EventStatus.COMPLETED ? 'success' : event.type === EventType.APPOINTMENT ? 'info' : 'warning'}>
              {event.status === EventStatus.COMPLETED ? 'Concluído' : event.type === EventType.APPOINTMENT ? 'Compromisso' : 'Tarefa'}
           </Badge>
        </div>

        {/* Action Button for Status */}
        {canEdit() && (
             <Button variant={event.status === EventStatus.COMPLETED ? 'outline' : 'primary'} onClick={toggleStatus} className="w-full justify-center">
                {event.status === EventStatus.COMPLETED ? 'Reabrir Item' : 'Marcar como Concluído'}
             </Button>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Processo Relacionado</p>
                {canEdit() ? (
                    <select 
                        className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 focus:ring-[#0e1b2e] focus:border-[#0e1b2e] outline-none"
                        value={event.caseId || ''}
                        onChange={(e) => changeCase(e.target.value)}
                    >
                        <option value="">-- Sem vínculo --</option>
                        {cases.map(c => (
                            <option key={c.id} value={c.id}>{c.number} - {c.title}</option>
                        ))}
                    </select>
                ) : (
                    relatedCase ? (
                        <p className="font-medium text-blue-700 truncate">{relatedCase.title}</p>
                    ) : (
                        <p className="text-slate-400 italic">Nenhum processo vinculado</p>
                    )
                )}
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Responsáveis</p>
                <div className="flex flex-wrap gap-1">
                    {assignedUsers.map(u => (
                        <span key={u.id} className="flex items-center text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm text-xs">
                           <img src={u.avatar} className="w-4 h-4 rounded-full mr-1"/> {u.name.split(' ')[0]}
                        </span>
                    ))}
                    {assignedUsers.length === 0 && <span className="text-slate-400 italic">Nenhum</span>}
                </div>
            </div>
        </div>
        
        {/* Description */}
        <div>
            <p className="text-sm font-semibold text-slate-700">Descrição</p>
            <p className="text-slate-600 text-sm mt-1">{event.description || "Sem descrição."}</p>
        </div>

        {/* Chat Section */}
        <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center">
                <MessageSquare size={16} className="mr-2"/> Chat & Observações
            </h4>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 h-48 overflow-y-auto mb-3 space-y-3 scrollbar-thin">
                {event.chatMessages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 mt-16">Nenhuma mensagem ainda.</p>
                ) : (
                    event.chatMessages.map(msg => {
                        const isMe = msg.userId === currentUser?.id;
                        const user = users.find(u => u.id === msg.userId);
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-2 text-sm ${isMe ? 'bg-[#0e1b2e] text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'text-slate-300' : 'text-slate-500'}`}>
                                        <span className="text-xs font-bold">{user?.name}</span>
                                        <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] outline-none"
                    placeholder="Digite uma mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="primary" onClick={handleSendMessage} className="px-3">
                    <Send size={16} />
                </Button>
            </div>
        </div>

      </div>
    </Modal>
  );
}
