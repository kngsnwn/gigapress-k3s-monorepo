'use client'

import { useEffect, useState } from 'react';
import { aiService } from '@/lib/aiService';
import { Brain, Key, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import APIKeySetup from './APIKeySetup';

export default function AIStatus() {
  const [provider, setProvider] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const currentProvider = aiService.getAvailableProvider();
        const hasKey = aiService.isAPIKeyConfigured();
        
        setProvider(currentProvider);
        setHasApiKey(hasKey);
      } catch (error) {
        console.error('Failed to check AI status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAIStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
        <Brain size={12} className="animate-spin" />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          AI 상태 확인 중...
        </span>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (hasApiKey && provider === 'openai') {
      return {
        icon: CheckCircle,
        text: 'OpenAI 연결됨',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-600 dark:text-green-400'
      };
    } else if (hasApiKey && provider === 'anthropic') {
      return {
        icon: CheckCircle,
        text: 'Claude 연결됨',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        iconClass: 'text-blue-600 dark:text-blue-400'
      };
    } else if (provider === 'local') {
      return {
        icon: AlertCircle,
        text: 'API 키 없음',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300',
        iconClass: 'text-amber-600 dark:text-amber-400'
      };
    } else {
      return {
        icon: AlertCircle,
        text: 'AI 서비스 오류',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-300',
        iconClass: 'text-red-600 dark:text-red-400'
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleSetupClose = () => {
    setShowSetup(false);
    // API 키 설정 후 상태 재확인
    const checkAIStatus = async () => {
      try {
        aiService.reinitialize();
        const currentProvider = aiService.getAvailableProvider();
        const hasKey = aiService.isAPIKeyConfigured();
        
        setProvider(currentProvider);
        setHasApiKey(hasKey);
      } catch (error) {
        console.error('Failed to recheck AI status:', error);
      }
    };
    checkAIStatus();
  };

  return (
    <>
      <button 
        onClick={() => setShowSetup(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors hover:opacity-80',
          config.bgClass
        )}
        title={hasApiKey ? 'AI 서비스 연결됨' : 'API 키 설정하기'}
      >
        <Icon size={12} className={config.iconClass} />
        <span className={config.textClass}>
          {config.text}
        </span>
        {!hasApiKey && (
          <Settings size={10} className="text-amber-500" />
        )}
      </button>

      {showSetup && (
        <APIKeySetup onClose={handleSetupClose} />
      )}
    </>
  );
}