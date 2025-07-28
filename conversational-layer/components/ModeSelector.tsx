'use client'

import { useConversationStore } from '@/lib/store';
import { UserMode } from '@/types';
import { Baby, GraduationCap, Shield, X, FlaskConical, Rocket, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { LanguageSelector } from './LanguageSelector';

interface ModeSelectorProps {
  onClose: () => void;
}


export default function ModeSelector({ onClose }: ModeSelectorProps) {
  const { userMode, setUserMode, setIsTestMode, isTestMode } = useConversationStore();
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState<UserMode>(userMode);
  const [selectedTestMode, setSelectedTestMode] = useState(isTestMode);
  const [showModeTypeSelector, setShowModeTypeSelector] = useState(false);

  const modeConfig: Record<UserMode, {
    icon: any;
    title: string;
    description: string;
    color: string;
    services: string[];
  }> = {
    beginner: {
      icon: Baby,
      title: t.modeSelector.beginner,
      description: t.modeSelector.beginnerDesc,
      color: 'text-blue-500',
      services: ['conversational-layer', 'conversational-ai-engine', 'mcp-server', 'domain-schema-service', 'backend-service']
    },
    expert: {
      icon: GraduationCap,
      title: t.modeSelector.expert,
      description: t.modeSelector.expertDesc,
      color: 'text-purple-500',
      services: ['conversational-layer', 'conversational-ai-engine', 'mcp-server', 'domain-schema-service', 'backend-service', 'design-frontend-service', 'infra-version-control-service', 'dynamic-update-engine']
    },
    admin: {
      icon: Shield,
      title: t.modeSelector.manager,
      description: t.modeSelector.managerDesc,
      color: 'text-red-500',
      services: []
    }
  };

  const handleModeSelect = (mode: UserMode) => {
    setSelectedMode(mode);
    setUserMode(mode);
    
    // 모든 모드에서 바로 닫기
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg border p-8 max-w-2xl w-full mx-4 shadow-lg relative">
        <div className="absolute top-4 left-4">
          <LanguageSelector />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6">{t.modeSelector.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(modeConfig).map(([mode, config]) => {
            const Icon = config.icon;
            const isSelected = selectedMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode as UserMode)}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all",
                  "hover:scale-[1.02] hover:shadow-md",
                  "flex flex-col items-center text-center gap-3",
                  isSelected ? "border-primary bg-primary/10" : "border-border"
                )}
              >
                <div className={cn("p-3 rounded-full bg-muted", isSelected && "bg-primary/20")}>
                  <Icon className={cn("w-8 h-8", config.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{config.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
                {mode !== 'admin' && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {config.services.length}개 서비스 실행
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedMode === 'admin' && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-center text-muted-foreground">
              관리자 모드로 전환되었습니다. 서비스 관리 패널에서 개별 서비스를 제어할 수 있습니다.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            현재 모드: <span className="font-semibold">{modeConfig[userMode].title}</span>
          </p>
        </div>
      </div>
    </div>
  );
}