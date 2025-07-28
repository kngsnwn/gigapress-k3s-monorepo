'use client'

import { useTheme } from 'next-themes';
import { useConversationStore } from '@/lib/store';
import { demoProjects, demoMessages, demoProgressUpdates } from '@/lib/demoData';
import { 
  Sun, 
  Moon, 
  Settings, 
  HelpCircle, 
  Wifi, 
  WifiOff,
  Sparkles,
  Laptop,
  ToggleLeft,
  ToggleRight,
  Baby,
  GraduationCap,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { LanguageSelector } from '../LanguageSelector';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { 
    isConnected, 
    isDemoMode, 
    setIsDemoMode,
    setCurrentProject,
    addMessage,
    addProgressUpdate,
    clearMessages,
    clearProgress,
    addProject,
    userMode
  } = useConversationStore();
  const { t } = useI18n();

  const toggleMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      // Switch to demo mode
      clearMessages();
      clearProgress();
      
      // Add demo data
      demoProjects.forEach(project => addProject(project));
      demoMessages.forEach(msg => addMessage(msg));
      demoProgressUpdates.forEach(update => addProgressUpdate(update));
      setCurrentProject(demoProjects[0]);
    } else {
      // Switch to real mode
      clearMessages();
      clearProgress();
      setCurrentProject(null);
      
      // Reconnect WebSocket
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  return (
    <header className="palantir-header justify-between">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="palantir-icon-button">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">GigaPress</h1>
          <p className="palantir-text-xs">AI Development Platform</p>
        </div>
      </div>

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

        {/* Mode Toggle */}
        <button
          onClick={toggleMode}
          className="palantir-button px-3 py-1"
          title={isDemoMode ? 'Switch to Real Mode' : 'Switch to Demo Mode'}
        >
          {isDemoMode ? (
            <span className="flex items-center gap-1">
              <Laptop size={12} />
              Demo
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Wifi size={12} className="text-green-500" />
              Live
            </span>
          )}
        </button>

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
            className="palantir-icon-button"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
