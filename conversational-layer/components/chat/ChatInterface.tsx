'use client'

import { useRef, useCallback } from 'react';
import { useConversationStore } from '@/lib/store';
import MessageList from './MessageList';
import InputBox from './InputBox';
import ProgressTracker from '../project/ProgressTracker';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export interface InputBoxRef {
  setInputValue: (text: string) => void;
}

export default function ChatInterface() {
  const { isTyping, progressUpdates, isTestMode } = useConversationStore();
  const { t } = useI18n();
  const inputBoxRef = useRef<InputBoxRef>(null);

  const handleSendExample = useCallback((text: string) => {
    if (inputBoxRef.current) {
      inputBoxRef.current.setInputValue(text);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Test Mode Indicator */}
      {isTestMode && (
        <div className="palantir-badge mx-4 mt-2 text-center">
          Test Mode Active - {t.chat.testMode}
        </div>
      )}
      
      {/* Progress Tracker */}
      {progressUpdates.length > 0 && (
        <div className="palantir-section mx-4 mt-2">
          <ProgressTracker />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList onSendExample={handleSendExample} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 palantir-text-sm">
          <span className="animate-pulse">Processing...</span> {t.chat.typing}
        </div>
      )}

      {/* Input Area */}
      <div className="palantir-section mx-4 mb-4">
        <InputBox ref={inputBoxRef} />
      </div>
    </div>
  );
}
