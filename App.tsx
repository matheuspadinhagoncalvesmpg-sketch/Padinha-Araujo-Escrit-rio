import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ViewName, UserRole } from './types';
import Agenda from './components/Agenda';
import { CaseList, ContactList, UserList } from './components/Lists';
import Auth from './components/Auth';
import { 
  LayoutDashboard, Calendar, FileText, Users, Contact as ContactIcon, 
  Menu, X, LogOut, Shield
} from 'lucide-react';
import { Button } from './components/ui/LayoutComponents';

const SidebarItem = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick 
}: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors text-sm font-medium
      ${active 
        ? 'bg-[#1e2e45] text-white shadow-sm border-l-4 border-white' 
        : 'text-slate-400 hover:bg-[#1e2e45] hover:text-white border-l-4 border-transparent'
      }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const DashboardStats = () => {
    const { cases, events, contacts, currentUser } = useApp();
    
    // Simple stats for dashboard
    const pendingTasks = events.filter(e => e.status !== 'COMPLETED').length;
    const activeCases = cases.length;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tarefas Pendentes</p>
                        <p className="text-3xl font-serif text-[#0e1b2e] mt-1">{pendingTasks}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-full text-[#0e1b2e]">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Processos Ativos</p>
                        <p className="text-3xl font-serif text-[#0e1b2e] mt-1">{activeCases}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-full text-[#0e1b2e]">
                        <FileText size={24} />
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total de Contatos</p>
                        <p className="text-3xl font-serif text-[#0e1b2e] mt-1">{contacts.length}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-full text-[#0e1b2e]">
                        <Users size={24} />
                    </div>
                </div>
            </div>
            
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-4 flex items-start space-x-3 shadow-sm">
                <Shield className="text-[#0e1b2e] mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-[#0e1b2e] text-sm">Controle de Acesso Ativo</h4>
                    <p className="text-sm text-slate-600 mt-1">
                        Você está logado como <strong>{currentUser?.name}</strong> ({currentUser?.role}).
                    </p>
                </div>
            </div>
        </div>
    )
}

const MainLayout = () => {
  const [currentView, setCurrentView] = useState<ViewName>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, canViewAll, logout, isAuthenticated } = useApp();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!isAuthenticated || !currentUser) {
      return <Auth />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-[#0e1b2e] flex-col text-slate-300 shadow-xl z-10">
        <div className="h-24 flex items-center px-6 border-b border-[#1e2e45]">
            <div className="w-10 h-10 bg-white rounded-sm mr-3 flex items-center justify-center text-[#0e1b2e] font-serif font-bold text-xl shadow">P<span className="text-xs align-top mt-1">&</span>A</div>
            <div className="flex flex-col">
                <span className="font-serif text-white text-lg leading-tight">Padinha & Araújo</span>
                <span className="text-xs text-slate-400 tracking-wider">MANAGER</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Mesa de Trabalho" 
            active={currentView === 'DASHBOARD'} 
            onClick={() => setCurrentView('DASHBOARD')} 
          />
          <SidebarItem 
            icon={Calendar} 
            label="Compromissos e Tarefas" 
            active={currentView === 'AGENDA'} 
            onClick={() => setCurrentView('AGENDA')} 
          />
          {canViewAll() && (
            <SidebarItem 
              icon={FileText} 
              label="Processos" 
              active={currentView === 'CASES'} 
              onClick={() => setCurrentView('CASES')} 
            />
          )}
          <SidebarItem 
            icon={ContactIcon} 
            label="Contatos" 
            active={currentView === 'CONTACTS'} 
            onClick={() => setCurrentView('CONTACTS')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Equipe" 
            active={currentView === 'USERS'} 
            onClick={() => setCurrentView('USERS')} 
          />
        </div>

        <div className="p-4 border-t border-[#1e2e45] bg-[#0b1626]">
             <div className="flex items-center space-x-3 mb-4">
                <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full border border-slate-600"/>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role === UserRole.ADMIN ? 'Sócio Administrador' : currentUser.role}</p>
                </div>
             </div>
             <button 
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 text-sm text-slate-400 hover:text-white py-2 rounded hover:bg-[#1e2e45] transition-colors"
             >
                <LogOut size={16} />
                <span>Sair do Sistema</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-[#0e1b2e] flex items-center justify-between px-4 z-20 shadow">
           <div className="flex items-center">
             <div className="w-8 h-8 bg-white rounded-sm mr-2 flex items-center justify-center text-[#0e1b2e] font-serif font-bold">PA</div>
             <span className="font-serif text-white text-lg">Padinha & Araújo</span>
           </div>
           <button onClick={toggleMobileMenu} className="text-white p-2">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
             <div className="md:hidden absolute inset-0 bg-[#0e1b2e] z-30 pt-20 px-4 space-y-2">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'DASHBOARD'} onClick={() => { setCurrentView('DASHBOARD'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={Calendar} label="Agenda" active={currentView === 'AGENDA'} onClick={() => { setCurrentView('AGENDA'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={FileText} label="Processos" active={currentView === 'CASES'} onClick={() => { setCurrentView('CASES'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={ContactIcon} label="Contatos" active={currentView === 'CONTACTS'} onClick={() => { setCurrentView('CONTACTS'); setIsMobileMenuOpen(false); }} />
                <div className="pt-8 border-t border-slate-700 mt-4 px-4">
                     <button onClick={logout} className="text-white flex items-center gap-2"><LogOut size={16}/> Sair</button>
                </div>
             </div>
        )}

        {/* View Area */}
        <main className="flex-1 overflow-auto bg-[#f8f9fa]">
            <div className="h-full">
                {currentView === 'DASHBOARD' && (
                    <div className="p-4 md:p-10">
                        <h1 className="text-3xl font-serif text-[#0e1b2e] mb-2">Mesa de Trabalho</h1>
                        <p className="text-slate-500 mb-8">Bem-vindo ao sistema de gestão Padinha & Araújo.</p>
                        <DashboardStats />
                        <div className="h-[600px] border-t border-slate-200 pt-6">
                            <Agenda /> 
                        </div>
                    </div>
                )}
                
                {currentView === 'AGENDA' && (
                    <div className="h-full flex flex-col p-4 md:p-6">
                         <Agenda />
                    </div>
                )}
                
                {currentView === 'CASES' && (canViewAll() ? <CaseList /> : <div className="text-center p-10 text-slate-500">Acesso restrito</div>)}
                
                {currentView === 'CONTACTS' && (
                    <div className="p-4 md:p-10">
                        <ContactList />
                    </div>
                )}
                
                {currentView === 'USERS' && (
                    <div className="p-4 md:p-10">
                        <UserList />
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

// Wrapper to use hook
const AppContent = () => {
    return <MainLayout />
}

export default App;
