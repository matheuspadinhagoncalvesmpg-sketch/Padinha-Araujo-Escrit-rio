import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Contact, Case, CalendarEvent, ChatMessage, UserRole, 
  EventStatus, CaseDocument, CaseStatus, EventType
} from '../types';
import { supabase, login as apiLogin, registerUser as apiRegister, logout as apiLogout, getCurrentUser } from '../supabaseClient';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  contacts: Contact[];
  cases: Case[];
  events: CalendarEvent[];
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;

  // Data Actions
  switchUser: (userId: string) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  updateEventDate: (eventId: string, newDate: string) => void;
  deleteEvent: (eventId: string) => void;
  addCase: (caseItem: Case) => void;
  addContact: (contact: Contact) => void;
  addChatMessage: (eventId: string, text: string) => void;
  addCaseDocument: (caseId: string, file: File) => void;
  
  // Permission Helpers
  canCreate: () => boolean;
  canEdit: (itemOwnerId?: string) => boolean; 
  canDelete: () => boolean;
  canViewAll: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initial Data Fetching ---
  const fetchData = async () => {
    try {
        // 1. Fetch Users
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) {
            setUsers(usersData.map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                role: p.role,
                avatar: p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=0e1b2e&color=fff`
            })));
        }

        // 2. Fetch Contacts
        const { data: contactsData } = await supabase.from('contacts').select('*');
        if (contactsData) setContacts(contactsData);

        // 3. Fetch Cases & Documents
        const { data: casesData } = await supabase.from('cases').select(`
            *,
            case_documents (*)
        `);
        
        if (casesData) {
            const mappedCases = casesData.map((c: any) => ({
                id: c.id,
                number: c.number,
                title: c.title,
                clientId: c.client_id,
                status: c.status,
                description: c.description,
                openDate: c.open_date,
                court: c.court,
                partes: c.partes,
                documents: c.case_documents ? c.case_documents.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    type: d.type,
                    size: d.size,
                    uploadDate: d.upload_date,
                    uploadedBy: d.uploaded_by,
                    url: d.url
                })) : []
            }));
            setCases(mappedCases);
        }

        // 4. Fetch Events (calendar_events) & Join Assignments/Chats
        const { data: eventsData, error } = await supabase.from('calendar_events').select(`
            *,
            event_assignments (user_id),
            chat_messages (*)
        `);
        
        if (error) console.error("Error fetching events:", error);

        if (eventsData) {
             const mappedEvents = eventsData.map((e: any) => ({
                id: e.id,
                title: e.title,
                type: e.type,
                date: e.event_date,
                time: e.event_time ? e.event_time.slice(0, 5) : '',
                description: e.description,
                status: e.status,
                caseId: e.case_id,
                assignedToIds: e.event_assignments ? e.event_assignments.map((ea: any) => ea.user_id) : [], 
                chatMessages: e.chat_messages ? e.chat_messages.map((m: any) => ({
                    id: m.id,
                    userId: m.user_id,
                    text: m.text,
                    timestamp: m.timestamp
                })) : []
             }));
             setEvents(mappedEvents);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  // --- Auth Check on Mount ---
  useEffect(() => {
    const checkUser = async () => {
        const storedUser = getCurrentUser();
        if (storedUser) {
            const userObj: User = {
                id: storedUser.id,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
                avatar: storedUser.avatar
            };
            setCurrentUser(userObj);
            setIsAuthenticated(true);
            await fetchData();
        }
        setIsLoading(false);
    };

    checkUser();
  }, []);

  // --- Auth Actions ---

  const login = async (email: string, password: string) => { 
    setIsLoading(true);
    const result = await apiLogin(email, password);
    
    if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        await fetchData();
    } else {
        alert("Erro ao logar: " + result.error);
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
      setIsLoading(true);
      const result = await apiRegister(name, email, password, role);

      if (result.success && result.user) {
          alert("Usuário registrado com sucesso!");
          setCurrentUser(result.user);
          setIsAuthenticated(true);
          await fetchData();
      } else {
          alert("Erro ao registrar: " + result.error);
      }
      setIsLoading(false);
  };

  const logout = () => {
      apiLogout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEvents([]);
      setCases([]);
      setContacts([]);
  };

  // --- Data Actions ---

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const addEvent = async (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);

    const { data: eventData, error: eventError } = await supabase.from('calendar_events').insert([{
        title: event.title,
        type: event.type,
        event_date: event.date,
        event_time: event.time,
        description: event.description,
        status: event.status,
        case_id: event.caseId
    }]).select().single();

    if (eventError) {
        console.error(eventError);
        setEvents(prev => prev.filter(e => e.id !== event.id));
        return;
    }

    if (eventData) {
        if (event.assignedToIds.length > 0) {
            const assignments = event.assignedToIds.map(uid => ({
                event_id: eventData.id,
                user_id: uid
            }));
            await supabase.from('event_assignments').insert(assignments);
        }

        const { data: refreshedEvent } = await supabase.from('calendar_events').select(`
            *,
            event_assignments (user_id),
            chat_messages (*)
        `).eq('id', eventData.id).single();

        if (refreshedEvent) {
             const mapped: CalendarEvent = {
                id: refreshedEvent.id,
                title: refreshedEvent.title,
                type: refreshedEvent.type,
                date: refreshedEvent.event_date,
                time: refreshedEvent.event_time?.slice(0,5),
                description: refreshedEvent.description,
                status: refreshedEvent.status,
                caseId: refreshedEvent.case_id,
                assignedToIds: refreshedEvent.event_assignments ? refreshedEvent.event_assignments.map((ea: any) => ea.user_id) : [],
                chatMessages: []
             };
             setEvents(prev => prev.map(e => e.id === event.id ? mapped : e));
        }
    }
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    
    await supabase.from('calendar_events').update({
        title: updatedEvent.title,
        type: updatedEvent.type,
        event_date: updatedEvent.date,
        event_time: updatedEvent.time,
        description: updatedEvent.description,
        status: updatedEvent.status,
        case_id: updatedEvent.caseId
    }).eq('id', updatedEvent.id);

    await supabase.from('event_assignments').delete().eq('event_id', updatedEvent.id);
    if (updatedEvent.assignedToIds.length > 0) {
        const assignments = updatedEvent.assignedToIds.map(uid => ({
            event_id: updatedEvent.id,
            user_id: uid
        }));
        await supabase.from('event_assignments').insert(assignments);
    }
  };

  const updateEventDate = async (eventId: string, newDate: string) => {
    if (currentUser?.role !== UserRole.ADMIN) return; 
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, date: newDate } : e));
    await supabase.from('calendar_events').update({ event_date: newDate }).eq('id', eventId);
  };

  const deleteEvent = async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    await supabase.from('calendar_events').delete().eq('id', eventId);
  };

  const addCase = async (caseItem: Case) => {
    const newCase = { ...caseItem, documents: [] };
    setCases([...cases, newCase]);

    const { data, error } = await supabase.from('cases').insert([{
        number: caseItem.number,
        title: caseItem.title,
        client_id: caseItem.clientId,
        status: caseItem.status,
        court: caseItem.court,
        partes: caseItem.partes,
        description: caseItem.description,
        open_date: caseItem.openDate
    }]).select().single();

    if (error) console.error(error);
    if (data) setCases(prev => prev.map(c => c.id === caseItem.id ? { ...c, id: data.id } : c));
  };

  const addContact = async (contact: Contact) => {
    setContacts([...contacts, contact]);
    
    const { data } = await supabase.from('contacts').insert([{
        name: contact.name,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes
    }]).select().single();
    
    if (data) setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, id: data.id } : c));
  };

  const addChatMessage = async (eventId: string, text: string) => {
    if (!currentUser) return;
    const tempId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: tempId,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return { ...e, chatMessages: [...e.chatMessages, newMessage] };
      }
      return e;
    }));

    const { data } = await supabase.from('chat_messages').insert([{
        event_id: eventId,
        user_id: currentUser.id, 
        text: text,
        timestamp: newMessage.timestamp
    }]).select().single();

    if (data) {
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return { 
                    ...e, 
                    chatMessages: e.chatMessages.map(m => m.id === tempId ? { ...m, id: data.id } : m)
                };
            }
            return e;
        }));
    }
  };

  const addCaseDocument = async (caseId: string, file: File) => {
    if (!currentUser) return;
    
    const newDoc: CaseDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'application/pdf',
        size: (file.size / 1024).toFixed(2) + ' KB',
        uploadDate: new Date().toISOString(),
        uploadedBy: currentUser.name,
        url: '#' 
    };

    setCases(prev => prev.map(c => {
        if (c.id === caseId) {
            return { ...c, documents: [...(c.documents || []), newDoc] };
        }
        return c;
    }));

    await supabase.from('case_documents').insert([{
        case_id: caseId,
        name: newDoc.name,
        type: newDoc.type,
        size: newDoc.size,
        upload_date: newDoc.uploadDate,
        uploaded_by: currentUser.id, 
        url: newDoc.url
    }]);
  };

  // --- Permissions ---
  const canCreate = () => {
    if (!currentUser) return false;
    return currentUser.role === UserRole.ADMIN;
  };

  const canEdit = (itemOwnerId?: string) => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.ADMIN) return true;
    return false;
  };

  const canDelete = () => currentUser?.role === UserRole.ADMIN;
  const canViewAll = () => currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.LAWYER;

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      contacts,
      cases,
      events,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      switchUser,
      addEvent,
      updateEvent,
      updateEventDate,
      deleteEvent,
      addCase,
      addContact,
      addChatMessage,
      addCaseDocument,
      canCreate,
      canEdit,
      canDelete,
      canViewAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
