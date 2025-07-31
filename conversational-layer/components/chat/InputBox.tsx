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
  const { isConnected, isDemoMode, addMessage, updateMessage, setIsTyping, messages } = useConversationStore();
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleSend = async () => {
    if (!input || !input.trim() || isGenerating) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
      status: 'sent' as const
    };

    // 사용자 메시지 추가
    addMessage(userMessage);
    
    // 입력 필드 초기화
    const currentInput = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (isDemoMode) {
      // 데모 모드에서는 백엔드 AI 서비스를 직접 호출
      try {
        setIsGenerating(true);
        setIsTyping(true);

        // AI 응답을 위한 빈 메시지 생성
        const aiMessageId = (Date.now() + 1).toString();
        const initialAiMessage = {
          id: aiMessageId,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          status: 'sending' as const
        };
        
        addMessage(initialAiMessage);
        setIsTyping(false);

        // 백엔드 AI 서비스 호출
        const aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8087';
        const response = await fetch(`${aiEngineUrl}/conversation/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput,
            session_id: `demo-session-${Date.now()}`,
            context: {}
          })
        });

        if (!response.ok) {
          throw new Error(`AI 서비스 오류: ${response.status} ${response.statusText}`);
        }

        const aiResponse = await response.json();
        
        // 최종 메시지 상태 업데이트
        updateMessage(aiMessageId, { 
          content: aiResponse.response || 'AI 응답을 받지 못했습니다.',
          status: 'sent'
        });

      } catch (error) {
        setIsTyping(false);
        console.error('AI response error:', error);
        
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `죄송합니다. AI 응답을 생성하는 중 오류가 발생했습니다. 

${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}

백엔드 AI 엔진 서비스가 실행 중인지 확인해주세요.
잠시 후 다시 시도해주세요.`,
          timestamp: new Date(),
          status: 'sent' as const
        };
        
        addMessage(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    } else {
      // 운영 모드에서는 웹소켓 사용
      if (!isConnected) {
        toast.error('서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      websocketService.sendMessage(currentInput);
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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input || ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.placeholder}
              className={cn(
                'w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800 px-4 py-3 pr-12',
                'text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'min-h-[52px] max-h-[200px] text-base shadow-sm'
              )}
              rows={1}
              disabled={(!isDemoMode && !isConnected) || isGenerating}
            />
            
            {/* Attachment button */}
            <button
              className="absolute right-3 bottom-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toast('File attachment coming soon!')}
              disabled={(!isDemoMode && !isConnected) || isGenerating}
            >
              <Paperclip size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Send button */}
          <button
            className={cn(
              'p-3 rounded-xl transition-all duration-200 shadow-sm',
              input && input.trim() && (isDemoMode || isConnected) && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            )}
            onClick={handleSend}
            disabled={!input || !input.trim() || (!isDemoMode && !isConnected) || isGenerating}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

InputBox.displayName = 'InputBox';

export default InputBox;
