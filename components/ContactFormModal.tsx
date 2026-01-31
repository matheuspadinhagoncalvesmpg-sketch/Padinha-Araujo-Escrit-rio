import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Input, Select, Button } from './ui/LayoutComponents';
import { Contact, ContactType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactFormModal({ isOpen, onClose }: Props) {
  const { addContact } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>(ContactType.CLIENT);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      type,
      email,
      phone,
      notes
    };
    addContact(newContact);
    onClose();
    // Reset form
    setName('');
    setType(ContactType.CLIENT);
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Contato">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome Completo / Razão Social" value={name} onChange={e => setName(e.target.value)} required />
        
        <Select label="Tipo de Contato" value={type} onChange={e => setType(e.target.value as ContactType)}>
            <option value={ContactType.CLIENT}>Cliente</option>
            <option value={ContactType.OPPOSING_PARTY}>Parte Contrária</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea 
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] outline-none" 
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
            ></textarea>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="submit" variant="primary">Salvar Contato</Button>
        </div>
      </form>
    </Modal>
  );
}
