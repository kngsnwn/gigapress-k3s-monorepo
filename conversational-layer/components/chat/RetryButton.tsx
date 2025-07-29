'use client'

import { useConversationStore } from '@/lib/store';
import { websocketService } from '@/lib/websocket';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  messageId?: string;
  className?: string;
}

export default function RetryButton({ messageId, className }: RetryButtonProps) {
  const { connectionStatus, pendingMessageId, messages } = useConversationStore();
  
  const handleRetry = () => {
    if (messageId) {
      // Retry specific message
      const message = messages.find(m => m.id === messageId);
      if (message && message.role === 'user') {
        websocketService.sendMessage(message.content);
      }
    } else {
      // Retry connection
      websocketService.reconnect();
    }
  };

  const isRetrying = connectionStatus === 'connecting' || pendingMessageId === messageId;
  const showButton = connectionStatus === 'error' || connectionStatus === 'disconnected' || 
                    (messageId && messages.find(m => m.id === messageId)?.status === 'error');

  if (!showButton) return null;

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border',
        'hover:bg-accent transition-colors disabled:opacity-50',
        'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <RefreshCw 
        size={14} 
        className={cn(isRetrying && 'animate-spin')} 
      />
      {isRetrying ? 'Retrying...' : 'Retry'}
    </button>
  );
}