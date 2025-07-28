export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'generating' | 'updating' | 'completed' | 'error';
  version: string;
  lastModified: Date;
  description?: string;
  architecture?: {
    frontend?: any;
    backend?: any;
    database?: any;
    infrastructure?: any;
    vcs?: any;
  };
}

export interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: 'message' | 'progress' | 'project_update' | 'error';
  payload: any;
}

export type UserMode = 'beginner' | 'expert' | 'admin';

export interface Service {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  description: string;
  required: boolean;
  modes: UserMode[];
  endpoint?: string;
}
