import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Input, Select, Button } from './ui/LayoutComponents';
import { EventType, EventStatus, CalendarEvent } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string;
}

export default function EventFormModal({ isOpen, onClose, initialCaseId }: Props) {
  const { cases, users, addEvent, currentUser } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(EventType.TASK);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [caseId, setCaseId] = useState(initialCaseId || '');
  const [assignedTo, setAssignedTo] = useState<string[]>(currentUser ? [currentUser.id] : []);

  useEffect(() => {
    if (isOpen) {
        setCaseId(initialCaseId || '');
    }
  }, [isOpen, initialCaseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      type,
      date,
      time,
      description,
      status: EventStatus.PENDING,
      caseId: caseId || undefined,
      assignedToIds: assignedTo,
      chatMessages: []
    };
    addEvent(newEvent);
    onClose();
    // Reset fundamental fields
    setTitle('');
    setDescription('');
    if (!initialCaseId) setCaseId('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Item da Agenda">
       <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Título" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            placeholder="Ex: Audiência Trabalhista"
          />
          
          <div className="grid grid-cols-2 gap-4">
              <Select label="Tipo" value={type} onChange={e => setType(e.target.value as EventType)}>
                  <option value={EventType.TASK}>Tarefa</option>
                  <option value={EventType.APPOINTMENT}>Compromisso</option>
              </Select>
              <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              <Input label="Hora" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>

          <Select label="Vincular a Processo (Opcional)" value={caseId} onChange={e => setCaseId(e.target.value)}>
              <option value="">-- Selecione um processo --</option>
              {cases.map(c => (
                  <option key={c.id} value={c.id}>
                      {c.number} - {c.title}
                  </option>
              ))}
          </Select>
          
          <div className="border border-slate-200 rounded p-3 bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-2">Responsáveis</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {users.map(u => (
                      <label key={u.id} className="inline-flex items-center space-x-2 text-sm bg-white border border-slate-300 rounded px-2 py-1 cursor-pointer hover:bg-slate-100 transition-colors">
                          <input 
                            type="checkbox" 
                            className="rounded text-[#0e1b2e] focus:ring-[#0e1b2e]"
                            checked={assignedTo.includes(u.id)}
                            onChange={e => {
                                if(e.target.checked) setAssignedTo([...assignedTo, u.id]);
                                else setAssignedTo(assignedTo.filter(id => id !== u.id));
                            }}
                          />
                          <span className="truncate max-w-[120px]">{u.name}</span>
                      </label>
                  ))}
              </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea 
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] outline-none" 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
              ></textarea>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button type="submit" variant="primary">Salvar Item</Button>
          </div>
       </form>
    </Modal>
  )
}
