export type Language = 'ko' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
  };
  
  // Mode Selector
  modeSelector: {
    title: string;
    selectMode: string;
    beginner: string;
    expert: string;
    manager: string;
    beginnerDesc: string;
    expertDesc: string;
    managerDesc: string;
  };
  
  // Chat Interface
  chat: {
    placeholder: string;
    send: string;
    typing: string;
    thinking: string;
    noMessages: string;
    startConversation: string;
    newChat: string;
    clearChat: string;
    testMode: string;
    welcomeTitle: string;
    example1: string;
    example2: string;
    example3: string;
  };
  
  // Project Sidebar
  project: {
    title: string;
    newProject: string;
    projectName: string;
    description: string;
    status: string;
    active: string;
    completed: string;
    archived: string;
    noProjects: string;
    createFirst: string;
  };
  
  // Progress Tracker
  progress: {
    title: string;
    overallProgress: string;
    tasks: string;
    completed: string;
    remaining: string;
    estimatedTime: string;
    hours: string;
    minutes: string;
    noTasks: string;
  };
  
  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    notifications: string;
    enabled: string;
    disabled: string;
  };
}