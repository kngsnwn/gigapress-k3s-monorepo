import { WebSocketMessage, Message, Project, ProgressUpdate } from '@/types';
import { useConversationStore } from './store';
import toast from 'react-hot-toast';

interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
}

class NativeWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private isProcessingQueue = false;
  private sessionId: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private url: string = '';
  private options: WebSocketOptions = {};

  connect(url: string = 'ws://localhost:8087', options?: WebSocketOptions) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    const { reconnectAttempts = 5, reconnectDelay = 1000, timeout = 10000 } = options || {};
    
    this.maxReconnectAttempts = reconnectAttempts;
    this.reconnectDelay = reconnectDelay;
    this.url = url;
    this.options = options || {};

    // Generate session ID if not exists
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }

    // Construct WebSocket URL with session ID
    const wsUrl = `${url}/api/v1/realtime/ws/${this.sessionId}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      toast.error('Failed to connect to server');
      this.scheduleReconnect();
    }
  }

  private generateSessionId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    const store = useConversationStore.getState();

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      store.setIsConnected(true);
      this.reconnectAttempts = 0;
      toast.success('Connected to server');
      
      // Clear any existing reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Start ping interval
      this.startPingInterval();
      
      // Process queued messages
      this.processMessageQueue();
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      store.setIsConnected(false);
      
      // Clear ping interval
      this.stopPingInterval();
      
      if (event.code === 1000) {
        // Normal closure
        toast('Disconnected from server', { icon: 'ℹ️' });
      } else {
        // Abnormal closure, try to reconnect
        toast.error('Connection lost, attempting to reconnect...');
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Don't show error toast here as onclose will be called
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong response
        if (data.type === 'pong') {
          this.handlePong();
          return;
        }
        
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  private startPingInterval() {
    // Send ping every 30 seconds
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private sendPing() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'ping' }));
      
      // Set timeout for pong response
      this.pongTimeout = setTimeout(() => {
        console.warn('No pong received, connection may be lost');
        this.socket?.close();
      }, 5000);
    }
  }

  private handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('Failed to reconnect. Please refresh the page.');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    this.reconnectAttempts++;
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url, this.options);
    }, delay);
  }

  private handleMessage(data: any) {
    const store = useConversationStore.getState();

    try {
      switch (data.type) {
        case 'message':
        case 'chat_response':
          const message: Message = {
            id: data.id || `msg-${Date.now()}`,
            role: data.role || 'assistant',
            content: data.content || data.message,
            timestamp: new Date(data.timestamp || Date.now()),
            status: 'received',
          };
          store.addMessage(message);
          break;

        case 'progress':
          const progress: ProgressUpdate = {
            id: data.id || `progress-${Date.now()}`,
            type: data.progressType || 'info',
            message: data.message,
            progress: data.progress,
            total: data.total,
            timestamp: new Date(data.timestamp || Date.now()),
          };
          store.addProgressUpdate(progress);
          break;

        case 'project_update':
          const project: Project = {
            ...data.project,
            lastModified: new Date(data.project.lastModified || Date.now()),
          };
          if (store.projects.find(p => p.id === project.id)) {
            store.updateProject(project.id, project);
          } else {
            store.addProject(project);
            store.setCurrentProject(project);
          }
          break;

        case 'error':
          const errorMessage = data.message || 'An error occurred';
          toast.error(errorMessage);
          
          // Add error message to chat
          const errorMsg: Message = {
            id: `error-${Date.now()}`,
            role: 'system',
            content: `Error: ${errorMessage}`,
            timestamp: new Date(),
            status: 'error',
          };
          store.addMessage(errorMsg);
          break;

        case 'typing':
          store.setIsTyping(data.isTyping);
          break;

        case 'connected':
          // Handle initial connection confirmation
          console.log('Connection confirmed by server:', data);
          if (data.session_id) {
            this.sessionId = data.session_id;
          }
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Failed to process message');
    }
  }

  private processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.send(JSON.stringify(message));
      }
    }
    
    this.isProcessingQueue = false;
  }

  sendMessage(content: string) {
    const store = useConversationStore.getState();
    
    const message = {
      type: 'chat',
      message: content,
      context: {
        projectId: store.currentProject?.id,
        sessionId: this.sessionId,
      },
      timestamp: new Date().toISOString(),
    };

    if (this.socket?.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to server. Message queued.');
      this.messageQueue.push(message);
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    store.addMessage(userMessage);

    try {
      this.socket.send(JSON.stringify(message));
      
      // Update message status
      setTimeout(() => {
        store.updateMessage(userMessage.id, { status: 'sent' });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      store.updateMessage(userMessage.id, { status: 'error' });
    }
  }

  sendProjectAction(action: string, payload: any) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to server');
      return;
    }

    const message = {
      type: 'project_action',
      action,
      payload,
      context: {
        sessionId: this.sessionId,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send project action:', error);
      toast.error('Failed to send project action');
    }
  }

  getConnectionState() {
    return {
      connected: this.socket?.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      sessionId: this.sessionId,
    };
  }

  disconnect() {
    this.stopPingInterval();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.messageQueue = [];
    this.sessionId = null;
  }
}

export const nativeWebSocketService = new NativeWebSocketService();