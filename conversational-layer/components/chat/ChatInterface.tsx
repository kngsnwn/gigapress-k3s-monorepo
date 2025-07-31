'use client'

import { useRef, useCallback } from 'react';
import { useConversationStore } from '@/lib/store';
import MessageList from './MessageList';
import InputBox from './InputBox';
import ProgressTracker from '../project/ProgressTracker';
import ConnectionStatus from './ConnectionStatus';
import RetryButton from './RetryButton';
import AIStatus from './AIStatus';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export interface InputBoxRef {
  setInputValue: (text: string) => void;
}

export default function ChatInterface() {
  const { isTyping, progressUpdates, isDemoMode, connectionStatus } = useConversationStore();
  const { t } = useI18n();
  const inputBoxRef = useRef<InputBoxRef>(null);

  const handleSendExample = useCallback((text: string) => {
    if (inputBoxRef.current) {
      inputBoxRef.current.setInputValue(text);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header with Connection Status */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">ChatGPT</h1>
          {isDemoMode && (
            <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm rounded-full border border-yellow-200 dark:border-yellow-700">
              Test Mode - {t.chat.testMode}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AIStatus />
          <RetryButton />
          <ConnectionStatus />
        </div>
      </div>
      
      {/* Progress Tracker */}
      {progressUpdates.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 px-6 py-3">
          <ProgressTracker />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList onSendExample={handleSendExample} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                AI
              </div>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce-1"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce-2"></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{t.chat.typing}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <InputBox ref={inputBoxRef} />
    </div>
  );
}
