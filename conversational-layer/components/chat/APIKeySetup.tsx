'use client'

import { useState } from 'react';
import { Key, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface APIKeySetupProps {
  onClose: () => void;
}

export default function APIKeySetup({ onClose }: APIKeySetupProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다!');
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      // 브라우저의 localStorage에 임시 저장 (개발용)
      localStorage.setItem('temp_openai_key', apiKey.trim());
      toast.success('API 키가 저장되었습니다. 페이지를 새로고침해주세요.');
      onClose();
    } else {
      toast.error('API 키를 입력해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI API 키 설정
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                실제 AI 응답을 받으려면 API 키가 필요합니다
              </p>
            </div>
          </div>

          {/* OpenAI API 키 설정 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                OpenAI API 키 설정
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      OpenAI Platform에서 API 키를 생성하세요:
                    </p>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      OpenAI API Keys 페이지로 이동
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      생성된 API 키를 아래에 입력하세요:
                    </p>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      환경변수 파일(.env.local)에 설정하는 것을 권장합니다:
                    </p>
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <code className="text-green-400">
                          NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
                        </code>
                        <button
                          onClick={() => copyToClipboard('NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here')}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors',
                  apiKey.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                )}
              >
                임시 저장 및 테스트
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                취소
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
              ⚠️ 임시 저장은 브라우저에만 저장되며, 실제 운영에서는 환경변수 설정을 권장합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}