'use client'

import { useParams, useRouter } from 'next/navigation';
import { useConversationStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { demoProjects } from '@/lib/demoData';
import GigaPressArchitecture from '@/components/project/GigaPressArchitecture';
import {
  ArrowLeft,
  Activity,
  Server,
  Brain,
  RefreshCw,
  Network,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  icon: any;
  color: string;
}

export default function ProjectProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, isTestMode, addProject } = useConversationStore();
  const [activeFlow, setActiveFlow] = useState<string[]>([]);
  
  useEffect(() => {
    if (isTestMode && projects.length === 0) {
      demoProjects.forEach((project) => {
        addProject(project);
      });
    }
  }, [isTestMode, projects.length, addProject]);
  
  const project = projects.find(p => p.id === params.id);

  const services: ServiceStatus[] = [
    {
      name: 'Conversational AI Engine',
      status: isTestMode ? 'completed' : 'idle',
      progress: isTestMode ? 100 : 0,
      message: isTestMode ? 'Natural language processing completed' : 'Waiting for input',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      name: 'MCP Server',
      status: isTestMode ? 'running' : 'idle',
      progress: isTestMode ? 65 : 0,
      message: isTestMode ? 'Processing model context protocol' : 'Server ready',
      icon: Network,
      color: 'text-blue-500'
    },
    {
      name: 'Domain Schema Service',
      status: isTestMode ? 'running' : 'idle',
      progress: isTestMode ? 45 : 0,
      message: isTestMode ? 'Generating domain models' : 'Schema service initialized',
      icon: Server,
      color: 'text-green-500'
    },
    {
      name: 'Backend Service',
      status: isTestMode ? 'running' : 'idle',
      progress: isTestMode ? 30 : 0,
      message: isTestMode ? 'Creating API endpoints' : 'Backend ready',
      icon: Server,
      color: 'text-orange-500'
    },
    {
      name: 'Frontend Service',
      status: isTestMode ? 'idle' : 'idle',
      progress: 0,
      message: 'Waiting for backend completion',
      icon: Activity,
      color: 'text-cyan-500'
    },
    {
      name: 'Dynamic Update Engine',
      status: isTestMode ? 'idle' : 'idle',
      progress: 0,
      message: 'Real-time updates ready',
      icon: RefreshCw,
      color: 'text-pink-500'
    }
  ];

  useEffect(() => {
    if (isTestMode) {
      // Simulate data flow animation
      const flowSequence = [
        ['ai-engine', 'mcp-server'],
        ['mcp-server', 'domain-schema'],
        ['domain-schema', 'backend'],
        ['backend', 'frontend'],
        ['frontend', 'dynamic-update']
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < flowSequence.length) {
          setActiveFlow(flowSequence[index]);
          index++;
        } else {
          index = 0;
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isTestMode]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'running':
        return <Loader2 size={16} className="animate-spin text-primary" />;
      case 'error':
        return <AlertCircle size={16} className="text-destructive" />;
      default:
        return <Info size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/project/${params.id}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to project</span>
          </button>
          
          <div className="flex-1" />
          
          <h1 className="text-2xl font-bold font-mono">[PROJECT PROGRESS]</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Architecture Visualization */}
          <div className="lg:col-span-2">
            <div className="palantir-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-mono">[GIGAPRESS ARCHITECTURE]</h2>
              <GigaPressArchitecture activeFlow={activeFlow} />
            </div>
          </div>

          {/* Service Status */}
          <div className="space-y-4">
            <div className="palantir-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-mono">[SERVICE STATUS]</h2>
              <div className="space-y-3">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={service.color} />
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                        {getStatusIcon(service.status)}
                      </div>
                      <div className="ml-6">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{service.message}</span>
                          <span>{service.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              service.status === 'completed' ? 'bg-green-500' :
                              service.status === 'running' ? 'bg-primary' :
                              service.status === 'error' ? 'bg-destructive' :
                              'bg-muted'
                            )}
                            style={{ width: `${service.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Flow Status */}
            <div className="palantir-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-mono">[DATA FLOW STATUS]</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="text-sm">Active Flow:</span>
                  <span className="text-sm font-mono text-primary">
                    {activeFlow.length > 0 ? activeFlow.join(' → ') : 'Idle'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• User Input → AI Engine</p>
                  <p>• AI Engine → MCP Server</p>
                  <p>• MCP → Domain Schema</p>
                  <p>• Schema → Backend Generation</p>
                  <p>• Backend → Frontend Generation</p>
                  <p>• All Services → Dynamic Updates</p>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="palantir-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-mono">[PROJECT INFO]</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{project.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{project.version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}