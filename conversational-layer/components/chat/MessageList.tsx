'use client'

import { useEffect, useRef } from 'react';
import { useConversationStore } from '@/lib/store';
import MessageItem from './MessageItem';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface MessageListProps {
  onSendExample?: (text: string) => void;
}

export default function MessageList({ onSendExample }: MessageListProps) {
  const messages = useConversationStore((state) => state.messages);
  const isTestMode = useConversationStore((state) => state.isTestMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold">{t.chat.welcomeTitle}</h2>
          <p className="text-muted-foreground">
            {t.chat.startConversation}
          </p>
          {!isTestMode && (
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button 
                className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                onClick={() => onSendExample?.(t.chat.example1)}
              >
                {t.chat.example1}
              </button>
              <button 
                className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                onClick={() => onSendExample?.(t.chat.example2)}
              >
                {t.chat.example2}
              </button>
              <button 
                className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                onClick={() => onSendExample?.(t.chat.example3)}
              >
                {t.chat.example3}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {messages.map((message, index) => {
          // Enable typing animation for the latest AI message
          const isLatestAIMessage = 
            message.role === 'assistant' && 
            index === messages.length - 1 &&
            message.status === 'sent';
            
          return (
            <MessageItem 
              key={message.id} 
              message={message} 
              enableTypingAnimation={isLatestAIMessage}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
