'use client'

import { useConversationStore } from '@/lib/store';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionStatus() {
  const { connectionStatus, lastError, retryCount } = useConversationStore();

  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Connected',
      className: 'text-green-500',
      bgClassName: 'bg-green-500/10',
      animate: false,
    },
    connecting: {
      icon: Loader2,
      text: 'Connecting...',
      className: 'text-yellow-500',
      bgClassName: 'bg-yellow-500/10',
      animate: true,
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      className: 'text-gray-500',
      bgClassName: 'bg-gray-500/10',
      animate: false,
    },
    error: {
      icon: AlertCircle,
      text: 'Connection Error',
      className: 'text-red-500',
      bgClassName: 'bg-red-500/10',
      animate: false,
    },
  };

  const config = statusConfig[connectionStatus];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
        config.bgClassName
      )}>
        <Icon 
          size={16} 
          className={cn(
            config.className,
            config.animate && 'animate-spin'
          )}
        />
        <span className={config.className}>{config.text}</span>
        {retryCount > 0 && connectionStatus === 'connecting' && (
          <span className="text-xs opacity-70">(Retry {retryCount})</span>
        )}
      </div>
      
      {lastError && connectionStatus === 'error' && (
        <div className="absolute top-full mt-2 right-0 z-10 w-64 p-3 bg-card border rounded-lg shadow-lg">
          <p className="text-sm text-muted-foreground">{lastError}</p>
        </div>
      )}
    </div>
  );
}