import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Button, Input, Select } from './ui/LayoutComponents';
import { Shield } from 'lucide-react';

export default function Auth() {
  const { login, register, isLoading } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
        login(email, password);
    } else {
        register(name, email, password, role);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
       <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full border border-slate-200">
          
          {/* Header */}
          <div className="bg-[#0e1b2e] p-8 text-center">
             <div className="w-16 h-16 bg-white rounded mx-auto flex items-center justify-center text-[#0e1b2e] font-serif font-bold text-3xl shadow mb-4">
                P<span className="text-sm align-top mt-1">&</span>A
             </div>
             <h2 className="text-2xl font-serif text-white">Padinha & Araújo</h2>
             <p className="text-slate-400 text-sm tracking-wider uppercase">Manager System</p>
          </div>

          {/* Body */}
          <div className="p-8">
             <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                {isLogin ? 'Acessar o Sistema' : 'Criar Nova Conta'}
             </h3>

             <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <Input 
                        label="Nome Completo" 
                        placeholder="Ex: Dr. João Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                
                <Input 
                    label="E-mail Profissional" 
                    type="email" 
                    placeholder="nome@padinhaaraujo.adv.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <Input 
                    label="Senha" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {!isLogin && (
                    <Select label="Cargo" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                        <option value={UserRole.ADMIN}>Administrador (Sócio)</option>
                        <option value={UserRole.LAWYER}>Advogado</option>
                        <option value={UserRole.INTERN}>Estagiário</option>
                    </Select>
                )}

                <Button variant="primary" type="submit" className="w-full py-3 mt-4" disabled={isLoading}>
                    {isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                </Button>
             </form>

             <div className="mt-6 text-center pt-6 border-t border-slate-100">
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-[#0e1b2e] hover:underline font-medium"
                    disabled={isLoading}
                >
                    {isLogin ? 'Não tem acesso? Cadastre-se' : 'Já possui conta? Fazer login'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
