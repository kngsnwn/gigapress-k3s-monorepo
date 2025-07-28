'use client'

import { useState } from 'react';
import { X, Settings, Palette, Globe, Zap, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useConversationStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { userMode } = useConversationStore();
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'toolbar', label: 'Toolbar', icon: Settings },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="palantir-card w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="palantir-section-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </div>
          <button
            onClick={onClose}
            className="palantir-icon-button"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-border">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left rounded-sm text-sm transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'hover:bg-accent'
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Theme</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            'palantir-button px-4 py-2',
                            theme === 'light' && 'bg-primary text-primary-foreground'
                          )}
                        >
                          Light
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            'palantir-button px-4 py-2',
                            theme === 'dark' && 'bg-primary text-primary-foreground'
                          )}
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={cn(
                            'palantir-button px-4 py-2',
                            theme === 'system' && 'bg-primary text-primary-foreground'
                          )}
                        >
                          System
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'toolbar' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Toolbar Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="palantir-card p-4">
                      <h4 className="font-medium mb-2">Palantir Toolbar Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Customize your toolbar appearance and behavior
                      </p>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Show language selector</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Show theme toggle</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Show help button</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Show settings button</span>
                        </label>
                      </div>
                    </div>

                    <div className="palantir-card p-4">
                      <h4 className="font-medium mb-2">Toolbar Position</h4>
                      <div className="flex gap-2">
                        <button className="palantir-button px-3 py-2 bg-primary text-primary-foreground">
                          Right
                        </button>
                        <button className="palantir-button px-3 py-2">
                          Left
                        </button>
                        <button className="palantir-button px-3 py-2">
                          Top
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Language Settings</h3>
                  <div className="palantir-card p-4">
                    <p className="text-sm text-muted-foreground">
                      Language settings will be configured here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
                  <div className="palantir-card p-4">
                    <p className="text-sm text-muted-foreground">
                      Performance optimization options will be configured here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                  <div className="palantir-card p-4">
                    <p className="text-sm text-muted-foreground">
                      Security and privacy settings will be configured here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="palantir-button px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="palantir-button px-4 py-2 bg-primary text-primary-foreground"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}