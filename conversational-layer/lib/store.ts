import { create } from 'zustand';
import { Message, Project, ProgressUpdate, UserMode, Service } from '@/types';

interface ConversationStore {
  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
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
  setIsConnected: (connected: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setIsDemoMode: (demo: boolean) => void;
  setIsTestMode: (testMode: boolean) => void;
  setUserMode: (mode: UserMode) => void;
  
  // Services
  services: Service[];
  setServices: (services: Service[]) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
  
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
  isDemoMode: true,
  isTestMode: true,
  userMode: 'beginner' as UserMode,
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setIsDemoMode: (demo) => set({ isDemoMode: demo }),
  setIsTestMode: (testMode) => set({ isTestMode: testMode }),
  setUserMode: (mode) => set({ userMode: mode }),
  
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
