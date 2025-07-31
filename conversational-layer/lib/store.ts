import { create } from 'zustand';
import { Message, Project, ProgressUpdate, UserMode, Service } from '@/types';

interface ConversationStore {
  // Messages - now project-specific
  projectMessages: Record<string, Message[]>;
  messages: Message[];
  addMessage: (message: Message, projectId?: string) => void;
  updateMessage: (id: string, updates: Partial<Message>, projectId?: string) => void;
  clearMessages: (projectId?: string) => void;
  getMessagesForProject: (projectId: string) => Message[];
  setCurrentProjectMessages: (projectId: string | null) => void;
  
  // Projects
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
  clearProjects: () => void;
  
  // Progress
  progressUpdates: ProgressUpdate[];
  addProgressUpdate: (update: ProgressUpdate) => void;
  clearProgress: () => void;
  
  // UI State
  isConnected: boolean;
  isTyping: boolean;
  isDemoMode: boolean;
  isTestMode: boolean;
  userMode: UserMode;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastError: string | null;
  pendingMessageId: string | null;
  retryCount: number;
  setIsConnected: (connected: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setIsDemoMode: (demo: boolean) => void;
  setIsTestMode: (testMode: boolean) => void;
  setUserMode: (mode: UserMode) => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void;
  setLastError: (error: string | null) => void;
  setPendingMessageId: (id: string | null) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  resetUIState: () => void;
  
  // Services
  services: Service[];
  setServices: (services: Service[]) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Messages - now project-specific
  projectMessages: {},
  messages: [],
  addMessage: (message, projectId) => {
    const currentProjectId = projectId || get().currentProject?.id;
    if (!currentProjectId) {
      set((state) => ({ messages: [...state.messages, message] }));
      return;
    }
    
    set((state) => {
      const updatedProjectMessages = { ...state.projectMessages };
      if (!updatedProjectMessages[currentProjectId]) {
        updatedProjectMessages[currentProjectId] = [];
      }
      updatedProjectMessages[currentProjectId] = [...updatedProjectMessages[currentProjectId], message];
      
      // Update current messages if this is the active project
      const messages = state.currentProject?.id === currentProjectId 
        ? updatedProjectMessages[currentProjectId] 
        : state.messages;
      
      return { 
        projectMessages: updatedProjectMessages,
        messages 
      };
    });
  },
  updateMessage: (id, updates, projectId) => {
    const currentProjectId = projectId || get().currentProject?.id;
    if (!currentProjectId) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      }));
      return;
    }
    
    set((state) => {
      const updatedProjectMessages = { ...state.projectMessages };
      if (updatedProjectMessages[currentProjectId]) {
        updatedProjectMessages[currentProjectId] = updatedProjectMessages[currentProjectId].map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        );
      }
      
      // Update current messages if this is the active project
      const messages = state.currentProject?.id === currentProjectId 
        ? updatedProjectMessages[currentProjectId] || []
        : state.messages;
      
      return { 
        projectMessages: updatedProjectMessages,
        messages 
      };
    });
  },
  clearMessages: (projectId) => {
    const currentProjectId = projectId || get().currentProject?.id;
    if (!currentProjectId) {
      set({ messages: [] });
      return;
    }
    
    set((state) => {
      const updatedProjectMessages = { ...state.projectMessages };
      updatedProjectMessages[currentProjectId] = [];
      
      // Update current messages if this is the active project
      const messages = state.currentProject?.id === currentProjectId 
        ? []
        : state.messages;
      
      return { 
        projectMessages: updatedProjectMessages,
        messages 
      };
    });
  },
  getMessagesForProject: (projectId) => {
    const state = get();
    return state.projectMessages[projectId] || [];
  },
  setCurrentProjectMessages: (projectId) => {
    set((state) => ({
      messages: projectId ? (state.projectMessages[projectId] || []) : []
    }));
  },
  
  // Projects
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
  addProject: (project) =>
    set((state) => {
      if (state.projects.find((p) => p.id === project.id)) {
        return state;
      }
      return { projects: [...state.projects, project] };
    }),
  clearProjects: () => set({ projects: [], currentProject: null }),
  
  // Progress
  progressUpdates: [],
  addProgressUpdate: (update) =>
    set((state) => ({
      progressUpdates: [...state.progressUpdates, update],
    })),
  clearProgress: () => set({ progressUpdates: [] }),
  
  // UI State
  isConnected: false,
  isTyping: false,
  isDemoMode: false,
  isTestMode: false,
  userMode: 'beginner' as UserMode,
  connectionStatus: 'disconnected',
  lastError: null,
  pendingMessageId: null,
  retryCount: 0,
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setIsDemoMode: (demo) => set({ isDemoMode: demo }),
  setIsTestMode: (testMode) => set({ isTestMode: testMode }),
  setUserMode: (mode) => set({ userMode: mode }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setLastError: (error) => set({ lastError: error }),
  setPendingMessageId: (id) => set({ pendingMessageId: id }),
  incrementRetryCount: () => set((state) => ({ retryCount: state.retryCount + 1 })),
  resetRetryCount: () => set({ retryCount: 0 }),
  resetUIState: () => set({ 
    isTyping: false, 
    pendingMessageId: null, 
    lastError: null,
    retryCount: 0
  }),
  
  // Services
  services: [],
  setServices: (services) => set({ services }),
  updateService: (id, updates) =>
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? { ...service, ...updates } : service
      ),
    })),
}));
