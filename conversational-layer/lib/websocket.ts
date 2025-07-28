import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, Message, Project, ProgressUpdate } from '@/types';
import { useConversationStore } from './store';
import toast from 'react-hot-toast';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private isManuallyDisconnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect(url: string = 'http://localhost:8088') {
    // If already connected to the same URL, don't reconnect
    if (this.socket?.connected && this.socket.io.uri === url) {
      return;
    }

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Disconnect existing connection first
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isManuallyDisconnected = false;
    console.log('Connecting to WebSocket:', url);
    
    this.socket = io(url, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: false, // Disable automatic reconnection
      timeout: 10000,
      upgrade: true,
      rememberUpgrade: false,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    const store = useConversationStore.getState();

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      store.setIsConnected(true);
      this.reconnectAttempts = 0;
      toast.success('Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      store.setIsConnected(false);
      
      if (!this.isManuallyDisconnected) {
        toast.error('Disconnected from server');
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      store.setIsConnected(false);
      
      if (!this.isManuallyDisconnected) {
        this.attemptReconnect();
      }
    });

    // Handle incoming messages
    this.socket.on('message', (data: WebSocketMessage) => {
      this.handleMessage(data);
    });

    // Handle typing indicator
    this.socket.on('typing', (isTyping: boolean) => {
      store.setIsTyping(isTyping);
    });
  }

  private attemptReconnect() {
    if (this.isManuallyDisconnected || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        toast.error('Unable to connect to server. Please try switching to demo mode or check your connection.');
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 10000);
    
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isManuallyDisconnected && this.socket && !this.socket.connected) {
        console.log('Attempting to reconnect...');
        this.socket.connect();
      }
    }, delay);
  }

  private handleMessage(data: WebSocketMessage) {
    const store = useConversationStore.getState();

    switch (data.type) {
      case 'message':
        const message: Message = {
          ...data.payload,
          timestamp: new Date(data.payload.timestamp),
        };
        store.addMessage(message);
        break;

      case 'progress':
        const progress: ProgressUpdate = {
          ...data.payload,
          timestamp: new Date(data.payload.timestamp),
        };
        store.addProgressUpdate(progress);
        break;

      case 'project_update':
        const project: Project = {
          ...data.payload,
          lastModified: new Date(data.payload.lastModified),
        };
        if (store.projects.find(p => p.id === project.id)) {
          store.updateProject(project.id, project);
        } else {
          store.addProject(project);
        }
        break;

      case 'error':
        toast.error(data.payload.message || 'An error occurred');
        break;
    }
  }

  sendMessage(content: string) {
    if (!this.socket?.connected) {
      toast.error('Not connected to server');
      return;
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    const store = useConversationStore.getState();
    store.addMessage(message);

    this.socket.emit('message', {
      type: 'user_message',
      payload: {
        content,
        projectId: store.currentProject?.id,
      },
    });

    // Update message status
    setTimeout(() => {
      store.updateMessage(message.id, { status: 'sent' });
    }, 100);
  }

  sendProjectAction(action: string, payload: any) {
    if (!this.socket?.connected) {
      toast.error('Not connected to server');
      return;
    }

    this.socket.emit('project_action', {
      action,
      payload,
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.isManuallyDisconnected = true;
      
      // Clear reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      
      const store = useConversationStore.getState();
      store.setIsConnected(false);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  reconnect(url?: string) {
    console.log('Manual reconnect requested');
    this.isManuallyDisconnected = false;
    this.reconnectAttempts = 0;
    
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.disconnect();
    setTimeout(() => {
      this.connect(url);
    }, 1000);
  }
}

export const websocketService = new WebSocketService();
