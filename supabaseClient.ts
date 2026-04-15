import { createClient } from '@supabase/supabase-js';
import { UserRole } from './types';

// Use environment variables defined in Hostinger/Vite, fallback to hardcoded if missing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bnwyelbfiamcgkjgpvzi.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-0tD33KfsGeeWcwMbmkXKA_adrRR_-B';

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
    // 1. Registrar no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e1b2e&color=fff`
        }
      }
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Erro ao criar usuário no Auth.');
    }

    // 2. Inserir usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id, // Use the Auth user ID
          name,
          email,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e1b2e&color=fff`
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Erro ao inserir na tabela users:', userError);
      // Even if inserting into users table fails (e.g. due to RLS), we return the auth user
      // The AppContext might need to handle this gracefully
      const fallbackUser = {
        id: authData.user.id,
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e1b2e&color=fff`
      };
      localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser };
    }

    // 3. Salvar sessão no localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));

    return { success: true, user: userData };
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
    // 1. Login no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao fazer login.' };
    }

    // 2. Buscar usuário na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    let finalUser = user;

    if (userError || !user) {
      console.warn('Usuário não encontrado na tabela users, usando dados do Auth.');
      finalUser = {
        id: authData.user.id,
        name: authData.user.user_metadata?.name || email.split('@')[0],
        email: authData.user.email,
        role: authData.user.user_metadata?.role || UserRole.INTERN,
        avatar: authData.user.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=0e1b2e&color=fff`
      };
    }

    // 3. Salvar sessão no localStorage
    localStorage.setItem('currentUser', JSON.stringify(finalUser));

    return { success: true, user: finalUser };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// LOGOUT
// =====================================================

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('currentUser');
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