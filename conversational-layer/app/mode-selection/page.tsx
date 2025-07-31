'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/lib/store';
import { websocketService } from '@/lib/websocket';
import { demoProjects, demoMessages, demoProgressUpdates } from '@/lib/demoData';
import { 
  Laptop, 
  Wifi, 
  TestTube, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModeSelectionPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'test' | 'production' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    setIsDemoMode,
    setCurrentProject,
    addMessage,
    addProgressUpdate,
    clearMessages,
    clearProgress,
    addProject,
    clearProjects,
    resetUIState
  } = useConversationStore();

  const handleModeSelection = async (mode: 'test' | 'production') => {
    setIsLoading(true);
    
    try {
      // Reset UI state first to clear any lingering typing indicators
      resetUIState();
      
      if (mode === 'test') {
        // Switch to test mode
        setIsDemoMode(true);
        websocketService.disconnect();
        clearMessages();
        clearProgress();
        clearProjects();
        
        // Add demo data
        demoProjects.forEach(project => addProject(project));
        demoMessages.forEach(msg => addMessage(msg));
        demoProgressUpdates.forEach(update => addProgressUpdate(update));
        setCurrentProject(demoProjects[0]);
      } else {
        // Switch to production mode
        setIsDemoMode(false);
        clearMessages();
        clearProgress();
        clearProjects();
        setCurrentProject(null);
        
        // Connect to production WebSocket
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8087';
        websocketService.reconnect(wsUrl);
      }
      
      // Navigate to main page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to switch mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              환경 선택
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              작업할 환경을 선택하세요. 테스트 환경에서는 안전하게 기능을 체험할 수 있습니다.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Test Mode */}
            <div
              className={cn(
                "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl",
                selectedMode === 'test' 
                  ? "border-blue-500 ring-4 ring-blue-500/20" 
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              )}
              onClick={() => setSelectedMode('test')}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <TestTube className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        테스트 환경
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        Demo Mode
                      </p>
                    </div>
                  </div>
                  {selectedMode === 'test' && (
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      실제 서비스에 영향을 주지 않는 안전한 환경
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      미리 준비된 샘플 데이터로 기능 체험
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      빠른 응답으로 즉시 결과 확인 가능
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 처음 사용하시거나 기능을 체험해보고 싶다면 테스트 환경을 선택하세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Production Mode */}
            <div
              className={cn(
                "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl",
                selectedMode === 'production' 
                  ? "border-green-500 ring-4 ring-green-500/20" 
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300"
              )}
              onClick={() => setSelectedMode('production')}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        운영 환경
                      </h3>
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        Production Mode
                      </p>
                    </div>
                  </div>
                  {selectedMode === 'production' && (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      실제 AI 엔진과 연결된 완전한 기능
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      실시간 코드 생성 및 프로젝트 생성
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      모든 고급 기능 사용 가능
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      실제 서버 연결이 필요하며, 생성된 결과는 실제로 저장됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {selectedMode && (
            <div className="text-center">
              <button
                onClick={() => handleModeSelection(selectedMode)}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300",
                  selectedMode === 'test' 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    설정 중...
                  </>
                ) : (
                  <>
                    {selectedMode === 'test' ? (
                      <>
                        <Laptop className="w-5 h-5" />
                        테스트 환경으로 시작
                      </>
                    ) : (
                      <>
                        <Wifi className="w-5 h-5" />
                        운영 환경으로 시작
                      </>
                    )}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}