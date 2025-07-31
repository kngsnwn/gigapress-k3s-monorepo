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
  const isDemoMode = useConversationStore((state) => state.isDemoMode);
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
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-950">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            AI
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{t.chat.welcomeTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t.chat.startConversation}
          </p>
          {!isDemoMode && (
            <div className="grid grid-cols-1 gap-3 text-sm mt-8">
              <button 
                className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                onClick={() => onSendExample?.(t.chat.example1)}
              >
                {t.chat.example1}
              </button>
              <button 
                className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                onClick={() => onSendExample?.(t.chat.example2)}
              >
                {t.chat.example2}
              </button>
              <button 
                className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
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
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border bg-white dark:bg-gray-950">
      <div className="">
        {messages.map((message, index) => {
          // Enable typing animation for the latest AI message
          const isLatestAIMessage = 
            message.role === 'assistant' && 
            index === messages.length - 1 &&
            message.status === 'sent';
          
          // Alternate background for assistant messages
          const isAlternate = message.role === 'assistant' && index % 2 === 1;
            
          return (
            <MessageItem 
              key={message.id} 
              message={message} 
              enableTypingAnimation={isLatestAIMessage}
              isAlternate={isAlternate}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
