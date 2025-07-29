'use client'

import { Message } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { User, Bot, AlertCircle, Clock, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TypingAnimation from './TypingAnimation';
import RetryButton from './RetryButton';

interface MessageItemProps {
  message: Message;
  enableTypingAnimation?: boolean;
}

export default function MessageItem({ message, enableTypingAnimation = false }: MessageItemProps) {
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
        'flex gap-3 group animate-in slide-in-from-bottom-2 duration-300',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 space-y-1', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 max-w-[80%] prose prose-sm dark:prose-invert',
            isUser
              ? 'bg-primary text-primary-foreground prose-invert'
              : 'bg-secondary',
            isError && 'bg-destructive text-destructive-foreground'
          )}
        >
          {isError && (
            <div className="flex items-center gap-2 mb-2">
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
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        {/* Timestamp and Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{formatDate(message.timestamp)}</span>
          {getStatusIcon()}
          {(isError || isSending) && (
            <RetryButton messageId={message.id} className="ml-2" />
          )}
        </div>
      </div>
    </div>
  );
}
