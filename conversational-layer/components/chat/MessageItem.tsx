'use client'

import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { User, Bot, AlertCircle, Clock, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TypingAnimation from './TypingAnimation';
import RetryButton from './RetryButton';
import ClientTimeStamp from './ClientTimeStamp';

interface MessageItemProps {
  message: Message;
  enableTypingAnimation?: boolean;
  isAlternate?: boolean;
}

export default function MessageItem({ message, enableTypingAnimation = false, isAlternate = false }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';
  const shouldAnimate = enableTypingAnimation && !isUser && message.status !== 'error';

  const getStatusIcon = () => {
    if (!isUser) return null;
    switch (message.status) {
      case 'sending':
        return <Clock size={12} className="text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check size={12} className="text-green-500" />;
      case 'error':
        return <X size={12} className="text-red-500" />;
      default:
        return <Check size={12} className="text-green-500" />;
    }
  };

  return (
    <div
      className={cn(
        'w-full py-6 px-4 border-b border-gray-100 dark:border-gray-800',
        !isUser && isAlternate && 'bg-gray-50 dark:bg-gray-900/50',
        'group animate-in slide-in-from-bottom-2 duration-300'
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm',
              isUser 
                ? 'bg-blue-600' 
                : message.role === 'system'
                ? 'bg-gray-600'
                : 'bg-green-600'
            )}
          >
            {isUser ? (
              'U'
            ) : message.role === 'system' ? (
              'S'
            ) : (
              'AI'
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isError && (
              <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Error</span>
              </div>
            )}
            
            {shouldAnimate ? (
              <TypingAnimation 
                text={message.content} 
                speed={15}
                isUser={isUser}
              />
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className || !match;
                    return !isInline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={cn(
                        className,
                        'bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm'
                      )} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed text-gray-900 dark:text-gray-100">
                      {children}
                    </p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {/* Timestamp and Status */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <ClientTimeStamp date={message.timestamp} />
            {getStatusIcon()}
            {(isError || isSending) && (
              <RetryButton messageId={message.id} className="ml-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
