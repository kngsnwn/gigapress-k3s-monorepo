'use client'

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useConversationStore } from '@/lib/store';
import { 
  Sun, 
  Moon, 
  Settings, 
  HelpCircle, 
  Wifi, 
  WifiOff,
  Sparkles,
  Laptop,
  Baby,
  GraduationCap,
  Shield,
  Home,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { LanguageSelector } from '../LanguageSelector';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { 
    isConnected, 
    isDemoMode,
    userMode
  } = useConversationStore();
  const { t } = useI18n();


  const resetToHome = () => {
    router.push('/');
  };

  return (
    <header className="palantir-header">
      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className="palantir-icon-button mr-2"
        title="프로젝트 메뉴"
      >
        <Menu size={16} />
      </button>

      {/* Logo and Title */}
      <button 
        onClick={resetToHome}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        title="홈으로 가기"
      >
        <div className="palantir-icon-button">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">GigaPress</h1>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* User Mode Badge */}
        <div className="palantir-badge">
          {userMode === 'beginner' && (
            <>
              <Baby size={12} className="text-blue-500 mr-1" />
              Novice
            </>
          )}
          {userMode === 'expert' && (
            <>
              <GraduationCap size={12} className="text-purple-500 mr-1" />
              Expert
            </>
          )}
          {userMode === 'admin' && (
            <>
              <Shield size={12} className="text-red-500 mr-1" />
              Admin
            </>
          )}
        </div>

        {/* Mode Selection Button */}
        <button
          onClick={() => router.push('/mode-selection')}
          className="palantir-button px-3 py-1"
          title="환경 선택"
        >
          <span className="flex items-center gap-1">
            <Settings size={12} />
            환경 선택
          </span>
        </button>

        {/* Current Mode Display */}
        <div className="palantir-badge">
          {isDemoMode ? (
            <span className="flex items-center gap-1">
              <Laptop size={12} className="text-blue-500" />
              테스트
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Wifi size={12} className="text-green-500" />
              운영
            </span>
          )}
        </div>

        {/* Connection Status (only show in real mode) */}
        {!isDemoMode && (
          <div
            className={cn(
              'palantir-badge',
              isConnected
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {isConnected ? <Wifi size={10} className="mr-1" /> : <WifiOff size={10} className="mr-1" />}
            {isConnected ? 'Online' : 'Offline'}
          </div>
        )}

        {/* Toolbar with actions */}
        <div className="palantir-toolbar">
          <button
            onClick={resetToHome}
            className="palantir-icon-button"
            title="홈으로 가기"
          >
            <Home size={14} />
          </button>

          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="palantir-icon-button"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            className="palantir-icon-button"
            title="Help"
          >
            <HelpCircle size={14} />
          </button>

          <button
            onClick={() => router.push('/mode-selection')}
            className="palantir-icon-button"
            title="환경 선택"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

    </header>
  );
}
