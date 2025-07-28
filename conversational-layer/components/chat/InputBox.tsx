'use client'

import { useState, useRef, useImperativeHandle, forwardRef, KeyboardEvent } from 'react';
import { websocketService } from '@/lib/websocket';
import { useConversationStore } from '@/lib/store';
import { Send, Paperclip, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';
import { InputBoxRef } from './ChatInterface';

const InputBox = forwardRef<InputBoxRef>((props, ref) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isConnected, isTestMode, addMessage, updateMessage } = useConversationStore();
  const [demoResponseIndex, setDemoResponseIndex] = useState(0);
  const { t } = useI18n();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setInputValue: (text: string) => {
      setInput(text);
      // Focus textarea after setting value
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }), []);

  const handleSend = () => {
    if (!input || !input.trim()) return;
    
    if (!isTestMode && !isConnected) {
      toast.error('Not connected to server. Please wait...');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
      status: 'sending' as const
    };

    if (isTestMode) {
      addMessage(userMessage);
      
      // Simulate message being sent
      setTimeout(() => {
        updateMessage(userMessage.id, { status: 'sent' });
        
        // Simulate AI response
        const demoResponses = [
          '입력하신 내용을 바탕으로 프로젝트를 구성하겠습니다.',
          '필요한 서비스를 확인하고 설정을 진행하겠습니다.',
          '프로젝트 구조를 생성하고 있습니다...',
          '코드 생성이 완료되었습니다. 추가 요구사항이 있으신가요?'
        ];
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `[테스트 모드] ${demoResponses[demoResponseIndex % demoResponses.length]}`,
          timestamp: new Date(),
          status: 'sent' as const
        };
        
        addMessage(aiMessage);
        setDemoResponseIndex(prev => prev + 1);
      }, 1000);
    } else {
      websocketService.sendMessage(input.trim());
    }
    
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast(isRecording ? 'Recording stopped' : 'Recording started');
  };

  return (
    <div className="relative flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          className={cn(
            'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 pr-12',
            'text-sm ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[44px] max-h-[200px]'
          )}
          rows={1}
          disabled={!isTestMode && !isConnected}
        />
        
        {/* Attachment button */}
        <button
          className="absolute right-2 bottom-2 p-1.5 rounded hover:bg-accent transition-colors"
          onClick={() => toast('File attachment coming soon!')}
          disabled={!isTestMode && !isConnected}
        >
          <Paperclip size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Voice input button */}
      <button
        className={cn(
          'p-2.5 rounded-lg transition-colors',
          isRecording
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-secondary hover:bg-secondary/80'
        )}
        onClick={toggleRecording}
        disabled={!isTestMode && !isConnected}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
      </button>

      {/* Send button */}
      <button
        className={cn(
          'p-2.5 rounded-lg transition-colors',
          input && input.trim() && isConnected
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-muted-foreground'
        )}
        onClick={handleSend}
        disabled={!input || !input.trim() || (!isTestMode && !isConnected)}
      >
        <Send size={20} />
      </button>
    </div>
  );
});

InputBox.displayName = 'InputBox';

export default InputBox;
