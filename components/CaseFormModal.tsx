import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Input, Select, Button } from './ui/LayoutComponents';
import { Case, CaseStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseFormModal({ isOpen, onClose }: Props) {
  const { addCase, contacts } = useApp();
  
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<CaseStatus>(CaseStatus.OPEN);
  const [court, setCourt] = useState('');
  const [partes, setPartes] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: Case = {
      id: Date.now().toString(),
      number,
      title,
      clientId,
      status,
      court,
      partes,
      description,
      openDate: new Date().toISOString(),
      documents: []
    };
    addCase(newCase);
    onClose();
    // Reset
    setNumber('');
    setTitle('');
    setClientId('');
    setStatus(CaseStatus.OPEN);
    setCourt('');
    setPartes('');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Processo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <Input label="Número do Processo" value={number} onChange={e => setNumber(e.target.value)} required placeholder="0000000-00.0000.0.00.0000" />
            <Input label="Tribunal / Órgão" value={court} onChange={e => setCourt(e.target.value)} placeholder="Ex: TJ-SP, TRT-2" />
        </div>

        <Input label="Título Interno" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Ação de Cobrança - Empresa X" />
        
        <Select label="Cliente Principal" value={clientId} onChange={e => setClientId(e.target.value)} required>
            <option value="">-- Selecione o Cliente --</option>
            {contacts.map(c => (
                <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'CLIENT' ? 'Cliente' : 'Parte Contr.'})
                </option>
            ))}
        </Select>

        <Input label="Partes (Resumo)" value={partes} onChange={e => setPartes(e.target.value)} placeholder="Ex: JOÃO SILVA X BANCO Y" />

        <Select label="Status Inicial" value={status} onChange={e => setStatus(e.target.value as CaseStatus)}>
            {Object.values(CaseStatus).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </Select>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Objeto</label>
            <textarea 
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] outline-none" 
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
            ></textarea>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="submit" variant="primary">Cadastrar Processo</Button>
        </div>
      </form>
    </Modal>
  );
}
