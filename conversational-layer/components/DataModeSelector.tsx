'use client'

import { useConversationStore } from '@/lib/store';
import { FlaskConical, Rocket, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DataModeSelectorProps {
  onClose: () => void;
}

export default function DataModeSelector({ onClose }: DataModeSelectorProps) {
  const { setIsTestMode, isTestMode } = useConversationStore();
  const [selectedTestMode, setSelectedTestMode] = useState(isTestMode);

  const handleModeTypeSelect = (isTest: boolean) => {
    setSelectedTestMode(isTest);
    setIsTestMode(isTest);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg border p-8 max-w-2xl w-full mx-4 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6">데이터 모드 선택</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleModeTypeSelect(true)}
            className={cn(
              "p-6 rounded-lg border-2 transition-all",
              "hover:scale-[1.02] hover:shadow-md",
              "flex flex-col items-center text-center gap-3",
              selectedTestMode ? "border-primary bg-primary/10" : "border-border"
            )}
          >
            <div className={cn("p-3 rounded-full bg-muted", selectedTestMode && "bg-primary/20")}>
              <FlaskConical className={cn("w-8 h-8", "text-orange-500")} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">테스트 데이터 모드</h3>
              <p className="text-sm text-muted-foreground mt-1">
                미리 정의된 테스트 데이터로 화면 흐름을 확인합니다
              </p>
            </div>
          </button>
          
          <button
            onClick={() => handleModeTypeSelect(false)}
            className={cn(
              "p-6 rounded-lg border-2 transition-all",
              "hover:scale-[1.02] hover:shadow-md",
              "flex flex-col items-center text-center gap-3",
              !selectedTestMode ? "border-primary bg-primary/10" : "border-border"
            )}
          >
            <div className={cn("p-3 rounded-full bg-muted", !selectedTestMode && "bg-primary/20")}>
              <Rocket className={cn("w-8 h-8", "text-green-500")} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">실제 운영 모드</h3>
              <p className="text-sm text-muted-foreground mt-1">
                실제 서비스와 연결하여 작동합니다
              </p>
            </div>
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            선택한 모드에 따라 다음 단계에서 실행 방식이 결정됩니다
          </p>
        </div>
      </div>
    </div>
  );
}