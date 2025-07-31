'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { websocketService } from '@/lib/websocket';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import ChatInterface from '@/components/chat/ChatInterface';
import ChatInterfaceMobile from '@/components/chat/ChatInterfaceMobile';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import Header from '@/components/layout/Header';
import Loading from '@/components/ui/Loading';
import ModeSelector from '@/components/ModeSelector';
import DataModeSelector from '@/components/DataModeSelector';
import ServicePanel from '@/components/admin/ServicePanel';
import { fadeIn } from '@/lib/animations';
import { useConversationStore } from '@/lib/store';
import { loadTestData } from '@/lib/testDataLoader';
import { I18nProvider } from '@/lib/i18n';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const isMobile = useIsMobile();
  const isConnected = useConversationStore((state) => state.isConnected);
  const isDemoMode = useConversationStore((state) => state.isDemoMode);
  const isTestMode = useConversationStore((state) => state.isTestMode);
  const userMode = useConversationStore((state) => state.userMode);
  const [showDataModeSelector, setShowDataModeSelector] = useState(true);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Only connect to WebSocket if not in test mode and not showing mode selector
    if (!isTestMode && !showModeSelector) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8087';
      websocketService.connect(wsUrl);
    }

    // In test mode, load demo data
    if (isTestMode && !showModeSelector && !showDataModeSelector) {
      loadTestData();
    }

    // Cleanup on unmount
    return () => {
      if (!isTestMode) {
        websocketService.disconnect();
      }
    };
  }, [isTestMode, showModeSelector, showDataModeSelector]);

  // Show data mode selector first
  if (showDataModeSelector) {
    return (
      <ClientOnly>
        <I18nProvider>
          <DataModeSelector onClose={() => {
            setShowDataModeSelector(false);
            setShowModeSelector(true);
          }} />
        </I18nProvider>
      </ClientOnly>
    );
  }

  // Show mode selector second
  if (showModeSelector) {
    return (
      <ClientOnly>
        <I18nProvider>
          <ModeSelector onClose={() => setShowModeSelector(false)} />
        </I18nProvider>
      </ClientOnly>
    );
  }

  // Show loading screen while connecting (only in real mode)
  if (!isTestMode && !isConnected && !isMobile && !showDataModeSelector && !showModeSelector) {
    return (
      <ClientOnly>
        <I18nProvider>
          <div className="flex h-screen items-center justify-center">
            <Loading size="lg" text="Connecting to GigaPress..." />
          </div>
        </I18nProvider>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <I18nProvider>
        <motion.div
          {...fadeIn}
          className="flex h-screen bg-background"
        >
        {/* Desktop Layout */}
        {!isMobile && (
          <>
            {/* Sidebar */}
            <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Header onMenuClick={() => setIsSidebarOpen(true)} />
              <main className="flex-1 overflow-hidden">
                {userMode === 'admin' ? (
                  <div className="h-full flex">
                    <div className="flex-1 min-w-0 overflow-y-auto p-6 xl:flex-[2] lg:flex-[3] md:flex-[1]">
                      <ServicePanel />
                    </div>
                    <div className="w-1/2 min-w-0 border-l xl:w-2/5 lg:w-1/2 md:w-1/2">
                      <ChatInterface />
                    </div>
                  </div>
                ) : (
                  <ChatInterface />
                )}
              </main>
            </div>
          </>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <>
            <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex flex-col h-full">
              <Header onMenuClick={() => setIsSidebarOpen(true)} />
              <main className="flex-1 overflow-hidden">
                <ChatInterfaceMobile />
              </main>
            </div>
          </>
        )}
      </motion.div>
    </I18nProvider>
    </ClientOnly>
  );
}
