'use client'

import { useState, useEffect } from 'react';
import { useConversationStore } from '@/lib/store';
import ProjectStatus from './ProjectStatus';
import { ChevronLeft, ChevronRight, Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProjects } from '@/lib/demoData';
import { useI18n } from '@/lib/i18n';

export default function ProjectSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { projects, currentProject, setCurrentProject, isTestMode, addProject } = useConversationStore();
  const { t } = useI18n();

  useEffect(() => {
    // Load demo projects in test mode
    if (isTestMode && projects.length === 0) {
      demoProjects.forEach((project) => {
        addProject(project);
      });
    }
  }, [isTestMode, projects.length, addProject]);

  return (
    <div
      className={cn(
        'palantir-sidebar flex flex-col transition-all duration-300 relative',
        isCollapsed ? 'w-12' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-3 z-10 palantir-icon-button bg-background border border-border"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Header */}
      {!isCollapsed && (
        <div className="palantir-section-header">
          <div className="flex items-center justify-between">
            <span>Projects</span>
            <button className="palantir-icon-button">
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
      
      {isCollapsed && (
        <div className="p-3 flex justify-center border-b border-border">
          <FolderOpen size={16} />
        </div>
      )}

      {/* Projects List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="p-4 text-center palantir-text-sm">
              No projects yet
            </div>
          ) : (
            <div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className={cn(
                    'palantir-list-item w-full text-left',
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
      )}

      {/* Project Status */}
      {!isCollapsed && currentProject && (
        <div className="border-t border-border">
          <ProjectStatus />
        </div>
      )}
    </div>
  );
}
