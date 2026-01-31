// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  INTERN = 'INTERN',
}

export enum EventType {
  TASK = 'TASK',
  APPOINTMENT = 'APPOINTMENT',
}

export enum EventStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum ContactType {
  CLIENT = 'CLIENT',
  OPPOSING_PARTY = 'OPPOSING_PARTY',
}

export enum CaseStatus {
  OPEN = 'Ativo',
  IN_COURT = 'Em Juízo',
  CLOSED = 'Baixado',
  ARCHIVED = 'Arquivado',
  SUSPENDED = 'Suspenso'
}

// Interfaces
export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  password?: string; // Mock password for demo
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  notes?: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string; // MIME type or extension
  size: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string; // Mock URL
}

export interface Case {
  id: string;
  number: string;
  title: string;
  clientId: string;
  status: CaseStatus;
  description: string;
  openDate: string;
  court?: string; // Tribunal
  partes?: string; // Ex: "Empresa X (Réu) x Cliente Y (Autor)"
  responsibleId?: string;
  documents: CaseDocument[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  description?: string;
  status: EventStatus;
  caseId?: string;
  assignedToIds: string[]; // List of user IDs
  chatMessages: ChatMessage[];
}

// Props types for navigation
export type ViewName = 'DASHBOARD' | 'AGENDA' | 'CASES' | 'CONTACTS' | 'USERS';
