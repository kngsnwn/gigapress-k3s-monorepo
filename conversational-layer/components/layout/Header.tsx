'use client'

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useConversationStore } from '@/lib/store';
import { demoProjects, demoMessages, demoProgressUpdates } from '@/lib/demoData';
import { websocketService } from '@/lib/websocket';
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
  Shield,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { LanguageSelector } from '../LanguageSelector';
import SettingsModal from '../ui/SettingsModal';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    userMode,
    projects,
    clearProjects
  } = useConversationStore();
  const { t } = useI18n();

  const toggleMode = async () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      // Switch to demo mode
      console.log('Switching to demo mode');
      websocketService.disconnect();
      clearMessages();
      clearProgress();
      
      // Add demo data
      demoProjects.forEach(project => addProject(project));
      demoMessages.forEach(msg => addMessage(msg));
      demoProgressUpdates.forEach(update => addProgressUpdate(update));
      setCurrentProject(demoProjects[0]);
    } else {
      // Switch to real mode
      console.log('Switching to real mode');
      clearMessages();
      clearProgress();
      setCurrentProject(null);
      
      // Reconnect WebSocket properly
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8087';
      websocketService.reconnect(wsUrl);
    }
  };

  const resetToHome = () => {
    // Clear all data and reset to initial state
    clearMessages();
    clearProgress();
    clearProjects();
    
    // If in demo mode, reload demo data
    if (isDemoMode) {
      // Add demo data back
      demoProjects.forEach(project => addProject(project));
      setCurrentProject(demoProjects[0]);
    }
  };

  return (
    <header className="palantir-header">
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
            onClick={() => setIsSettingsOpen(true)}
            className="palantir-icon-button"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </header>
  );
}
