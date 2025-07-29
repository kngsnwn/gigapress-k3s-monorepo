'use client'

import { useState, useEffect } from 'react';
import { useConversationStore } from '@/lib/store';
import ProjectStatus from './ProjectStatus';
import { ChevronLeft, ChevronRight, Plus, FolderOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProjects } from '@/lib/demoData';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { projects, currentProject, setCurrentProject, isTestMode, addProject, clearMessages, setCurrentProjectMessages } = useConversationStore();
  const { t } = useI18n();

  const createNewProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: `New Chat ${projects.length + 1}`,
      type: 'conversation',
      status: 'idle' as const,
      version: '1.0.0',
      lastModified: new Date(),
      description: 'New conversation project'
    };
    
    addProject(newProject);
    setCurrentProject(newProject);
    setCurrentProjectMessages(newProject.id); // Switch to new project's messages
    onClose();
  };

  useEffect(() => {
    // Load demo projects in test mode
    if (isTestMode && projects.length === 0) {
      demoProjects.forEach((project) => {
        addProject(project);
      });
    }
  }, [isTestMode, projects.length, addProject]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-50 flex flex-col shadow-lg"
          >
            {/* Header */}
            <div className="palantir-section-header">
              <div className="flex items-center justify-between">
                <span>Projects</span>
                <div className="flex items-center gap-1">
                  <button onClick={createNewProject} className="palantir-icon-button">
                    <Plus size={12} />
                  </button>
                  <button onClick={onClose} className="palantir-icon-button">
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {projects.length === 0 ? (
                <div className="p-4 text-center palantir-text-sm">
                  No projects yet
                </div>
              ) : (
                <div className="px-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setCurrentProject(project);
                        setCurrentProjectMessages(project.id);
                        onClose();
                      }}
                      className={cn(
                        'palantir-list-item w-full text-left block',
                        currentProject?.id === project.id && 'active'
                      )}
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="palantir-text-xs mt-1">
                        {project.type} • {project.status}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Status */}
            {currentProject && (
              <div className="border-t border-border flex-shrink-0">
                <ProjectStatus />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
