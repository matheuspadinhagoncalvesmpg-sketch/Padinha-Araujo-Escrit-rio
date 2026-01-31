import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { UserRole } from './types';

const supabaseUrl = 'https://bnwyelbfiamcgkjgpvzi.supabase.co';
const supabaseAnonKey = 'sb_publishable_-0tD33KfsGeeWcwMbmkXKA_adrRR_-B';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// REGISTRO DE NOVO USUÁRIO
// =====================================================

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = UserRole.INTERN
) {
  try {
    // 1. Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Inserir usuário no banco
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: passwordHash,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e1b2e&color=fff`
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 3. Salvar sessão no localStorage
    localStorage.setItem('currentUser', JSON.stringify(data));

    return { success: true, user: data };
  } catch (error: any) {
    console.error('Erro ao registrar:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// LOGIN
// =====================================================

export async function login(email: string, password: string) {
  try {
    // 1. Buscar usuário por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { success: false, error: 'Email não encontrado ou erro de conexão.' };
    }

    // 2. Verificar senha
    // Nota: Se o usuário foi criado manualmente no banco sem hash, isso falhará se não tratarmos.
    // Mas assumindo que novos usuários usarão o fluxo de registro:
    if (!user.password) {
         return { success: false, error: 'Usuário sem senha definida. Contate o administrador.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, error: 'Senha incorreta.' };
    }

    // 3. Remover senha do objeto antes de salvar (segurança básica)
    const { password: _, ...userWithoutPassword } = user;

    // 4. Salvar sessão no localStorage
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// LOGOUT
// =====================================================

export function logout() {
  localStorage.removeItem('currentUser');
  // Opcional: Recarregar a página ou deixar o estado do React lidar com isso
}

// =====================================================
// OBTER USUÁRIO ATUAL
// =====================================================

export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}