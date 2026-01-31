import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Case, Contact, User, UserRole, CaseStatus, EventType } from '../types';
import { Card, Badge, Button, Modal } from './ui/LayoutComponents';
import { 
    FileText, User as UserIcon, Phone, Mail, Building, Trash2, 
    Inbox, Users, ChevronRight, Briefcase, Paperclip, Upload, Download, File, Plus
} from 'lucide-react';
import EventFormModal from './EventFormModal';
import CaseFormModal from './CaseFormModal';
import ContactFormModal from './ContactFormModal';

// Case Detail Modal Component
const CaseDetailModal: React.FC<{ caseItem: Case; onClose: () => void }> = ({ caseItem, onClose }) => {
    const { addCaseDocument, canEdit, events } = useApp();
    const [activeTab, setActiveTab] = useState<'TASKS' | 'GED'>('TASKS');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            addCaseDocument(caseItem.id, e.target.files[0]);
        }
    };

    const linkedEvents = events.filter(e => e.caseId === caseItem.id);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header mimicking Legal One */}
                <div className="bg-white border-b border-slate-200 p-6 pb-2">
                    <div className="flex items-center text-sm text-slate-500 mb-2">
                         <span className="hover:underline cursor-pointer">Painel</span>
                         <ChevronRight size={14} className="mx-1"/>
                         <span className="hover:underline cursor-pointer">Processos</span>
                         <ChevronRight size={14} className="mx-1"/>
                         <span className="font-bold text-[#0e1b2e]">{caseItem.number}</span>
                    </div>

                    <h2 className="text-2xl font-serif text-[#0e1b2e] mb-2 flex items-center gap-2">
                        Visualizando recurso: {caseItem.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mt-4 text-sm">
                        <div>
                            <span className="font-bold text-slate-800">Título: </span>
                            <span className="text-slate-600">{caseItem.title}</span>
                        </div>
                         <div>
                            <span className="font-bold text-slate-800">Status: </span>
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                            <span className="text-slate-600">{caseItem.status}</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800">Número: </span>
                            <span className="text-slate-600 font-mono">{caseItem.number}</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800">Ação: </span>
                            <span className="text-slate-600">Recurso Ordinário</span>
                        </div>
                        <div className="md:col-span-2">
                             <span className="font-bold text-slate-800">Partes: </span>
                             <span className="text-slate-600 text-blue-700 uppercase">{caseItem.partes || "CLIENTE (AUTOR) X EMPRESA (RÉU)"}</span>
                        </div>
                        <div className="md:col-span-2">
                             <span className="font-bold text-slate-800">Responsável principal: </span>
                             <span className="text-blue-700 uppercase font-bold">PADINHA & ARAUJO ADVOGADOS</span>
                        </div>
                        <div className="md:col-span-2">
                             <span className="font-bold text-slate-800">Órgão: </span>
                             <span className="text-slate-600">{caseItem.court || "Tribunal de Justiça"}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-slate-200">
                        <button className="pb-2 border-b-2 border-transparent text-slate-500 hover:text-[#0e1b2e]">Pendências do Workflow</button>
                        <button className="pb-2 border-b-2 border-transparent text-slate-500 hover:text-[#0e1b2e]">Andamentos</button>
                        
                        <button 
                            onClick={() => setActiveTab('TASKS')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'TASKS' ? 'border-[#0e1b2e] font-bold text-[#0e1b2e]' : 'border-transparent text-slate-500 hover:text-[#0e1b2e]'}`}
                        >
                            Compromissos e tarefas <span className="text-xs bg-slate-200 px-1.5 rounded-full">{linkedEvents.length}</span>
                        </button>
                        
                        <button className="pb-2 border-b-2 border-transparent text-slate-500 hover:text-[#0e1b2e]">Envolvidos</button>
                        
                        <button 
                            onClick={() => setActiveTab('GED')}
                            className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'GED' ? 'border-[#0e1b2e] font-bold text-[#0e1b2e]' : 'border-transparent text-slate-500 hover:text-[#0e1b2e]'}`}
                        >
                            GED <span className="text-xs bg-slate-200 px-1.5 rounded-full">{caseItem.documents?.length || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 bg-[#f8f9fa] flex-1 overflow-auto">
                     
                     {activeTab === 'TASKS' && (
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-700">Agenda do Processo</h3>
                                {canEdit() && (
                                    <Button variant="primary" onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2">
                                        <Plus size={16}/> Nova Tarefa
                                    </Button>
                                )}
                            </div>

                            {linkedEvents.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded p-12 text-center">
                                    <Inbox size={48} className="mx-auto text-slate-300 mb-4"/>
                                    <p className="text-slate-500">Nenhuma tarefa ou compromisso vinculado a este processo.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {linkedEvents.map(event => (
                                        <div key={event.id} className="bg-white p-3 rounded border border-slate-200 flex justify-between items-center hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3">
                                                 <div className={`w-1 h-10 rounded-full ${event.type === EventType.APPOINTMENT ? 'bg-blue-600' : 'bg-teal-600'}`}></div>
                                                 <div>
                                                     <p className="font-bold text-slate-800">{event.title}</p>
                                                     <div className="text-xs text-slate-500 flex items-center gap-2">
                                                         <span>{new Date(event.date).toLocaleDateString()} {event.time}</span>
                                                         <span className={`px-1.5 py-0.5 rounded text-[10px] ${event.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                             {event.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                                                         </span>
                                                     </div>
                                                 </div>
                                            </div>
                                            {event.assignedToIds.length > 0 && (
                                                <div className="hidden sm:flex -space-x-1">
                                                    {event.assignedToIds.map(uid => (
                                                        <div key={uid} className="w-6 h-6 rounded-full bg-slate-300 ring-2 ring-white flex items-center justify-center text-[10px] overflow-hidden">
                                                             {uid.substring(0,2)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>
                     )}

                     {activeTab === 'GED' && (
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-700">Documentos do Processo</h3>
                                {canEdit() && (
                                    <>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={handleFileUpload}
                                        />
                                        <Button variant="primary" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                                            <Upload size={16}/> Anexar Arquivo
                                        </Button>
                                    </>
                                )}
                            </div>

                            {(!caseItem.documents || caseItem.documents.length === 0) ? (
                                <div className="bg-white border border-slate-200 rounded p-12 text-center border-dashed">
                                    <Paperclip size={48} className="mx-auto text-slate-300 mb-4"/>
                                    <p className="text-slate-500">Nenhum documento anexado a este processo.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                                            <tr>
                                                <th className="px-6 py-3">Nome</th>
                                                <th className="px-6 py-3">Data Upload</th>
                                                <th className="px-6 py-3">Enviado Por</th>
                                                <th className="px-6 py-3">Tamanho</th>
                                                <th className="px-6 py-3 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {caseItem.documents.map(doc => (
                                                <tr key={doc.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-50 p-2 rounded text-blue-600">
                                                                <File size={16} />
                                                            </div>
                                                            <span className="font-medium text-slate-900">{doc.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-slate-600">{doc.uploadedBy}</td>
                                                    <td className="px-6 py-4 text-slate-600">{doc.size}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-blue-600 hover:text-blue-800 p-1" title="Baixar">
                                                            <Download size={16}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                         </div>
                     )}

                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </div>

            <EventFormModal 
                isOpen={isEventModalOpen} 
                onClose={() => setIsEventModalOpen(false)} 
                initialCaseId={caseItem.id}
            />
        </div>
    )
}

export const CaseList: React.FC = () => {
  const { cases, canCreate, canDelete } = useApp();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-serif font-bold text-[#0e1b2e]">Processos</h2>
            <p className="text-sm text-slate-500">Gerenciamento da carteira de processos do escritório</p>
        </div>
        {canCreate() && <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Novo Processo</Button>}
      </div>
      
      {/* Search Bar mimicking Legal One */}
      <div className="bg-white p-4 rounded border border-slate-200 mb-4 flex gap-2">
         <input className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Pesquisar por número, título ou parte..." />
         <Button variant="primary">Pesquisar</Button>
      </div>
      
      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
                <FileText size={32} className="text-slate-400"/>
            </div>
            <p className="text-slate-500 font-medium">Nenhum processo cadastrado</p>
            {canCreate() && <p className="text-slate-400 text-sm mt-1">Clique em "Novo Processo" para começar.</p>}
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                    <tr>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Número / Título</th>
                        <th className="px-6 py-3">Tribunal</th>
                        <th className="px-6 py-3">Data Abertura</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {cases.map(c => (
                        <tr key={c.id} className="hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => setSelectedCase(c)}>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                    ${c.status === CaseStatus.CLOSED ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-[#0e1b2e]">{c.number}</div>
                                <div className="text-slate-500 truncate max-w-xs">{c.title}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{c.court || "TJ-SP"}</td>
                            <td className="px-6 py-4 text-slate-600">{new Date(c.openDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                                {canDelete() && (
                                    <button className="text-slate-400 hover:text-red-600 p-1" onClick={(e) => { e.stopPropagation(); /* delete logic */ }}>
                                        <Trash2 size={16}/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {selectedCase && (
          <CaseDetailModal caseItem={selectedCase} onClose={() => setSelectedCase(null)} />
      )}

      <CaseFormModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export const ContactList: React.FC = () => {
    const { contacts, canCreate } = useApp();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#0e1b2e]">Contatos</h2>
                <p className="text-sm text-slate-500">Diretório de clientes e partes contrárias</p>
            </div>
          {canCreate() && <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Novo Contato</Button>}
        </div>

        {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 border-dashed">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                    <Users size={32} className="text-slate-400"/>
                </div>
                <p className="text-slate-500 font-medium">Nenhum contato encontrado</p>
                {canCreate() && <p className="text-slate-400 text-sm mt-1">Adicione clientes ou partes contrárias.</p>}
            </div>
        ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {contacts.map((contact) => (
                    <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                            {contact.type === 'CLIENT' ? <UserIcon size={16}/> : <Building size={16}/>}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{contact.name}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.type === 'CLIENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {contact.type === 'CLIENT' ? 'Cliente' : 'Parte Contrária'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center"><Mail size={14} className="mr-1"/> {contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center"><Phone size={14} className="mr-1"/> {contact.phone}</div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        <ContactFormModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
        />
      </div>
    );
  };

  export const UserList: React.FC = () => {
    const { users, currentUser } = useApp();
  
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#0e1b2e]">Equipe</h2>
                <p className="text-sm text-slate-500">Usuários com acesso ao sistema</p>
            </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="p-6 flex items-center space-x-4">
               <img className="w-16 h-16 rounded-full" src={u.avatar} alt={u.name} />
               <div>
                 <h3 className="font-bold text-lg text-slate-900">{u.name}</h3>
                 <p className="text-sm text-slate-500 mb-2">{u.email}</p>
                 <Badge variant={u.role === UserRole.ADMIN ? 'danger' : u.role === UserRole.LAWYER ? 'info' : 'default'}>
                    {u.role}
                 </Badge>
               </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };
