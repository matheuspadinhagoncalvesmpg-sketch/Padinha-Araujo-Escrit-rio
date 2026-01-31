import { User, UserRole, Contact, ContactType, Case, CaseStatus, CalendarEvent, EventType, EventStatus } from './types';

// Users - Kept generic users for role testing
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Administrador',
    role: UserRole.ADMIN,
    email: 'admin@padinhaaraujo.adv.br',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0e1b2e&color=fff',
  },
  {
    id: 'u2',
    name: 'Advogado',
    role: UserRole.LAWYER,
    email: 'advogado@padinhaaraujo.adv.br',
    avatar: 'https://ui-avatars.com/api/?name=Advogado&background=334155&color=fff',
  },
  {
    id: 'u3',
    name: 'Estagiário',
    role: UserRole.INTERN,
    email: 'estagiario@padinhaaraujo.adv.br',
    avatar: 'https://ui-avatars.com/api/?name=Estagiario&background=475569&color=fff',
  },
];

// Contacts - Cleared
export const MOCK_CONTACTS: Contact[] = [];

// Cases - Cleared
export const MOCK_CASES: Case[] = [];

// Events - Cleared
export const MOCK_EVENTS: CalendarEvent[] = [];
