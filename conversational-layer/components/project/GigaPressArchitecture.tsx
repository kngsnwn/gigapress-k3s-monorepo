'use client'

import { useEffect, useState } from 'react';
import { 
  Brain, 
  Server, 
  Network, 
  RefreshCw, 
  Activity, 
  Database, 
  Cpu,
  MessageSquare,
  Code,
  Layout,
  GitBranch,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GigaPressArchitectureProps {
  activeFlow: string[];
}

interface ServiceNode {
  id: string;
  name: string;
  description: string;
  icon: any;
  position: { x: number; y: number };
  color: string;
  type: 'input' | 'core' | 'generator' | 'output';
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  type: 'data' | 'control' | 'feedback';
}

export default function GigaPressArchitecture({ activeFlow }: GigaPressArchitectureProps) {
  const [animatedDots, setAnimatedDots] = useState<{ id: string; from: string; to: string; progress: number }[]>([]);

  const services: ServiceNode[] = [
    // Input Layer
    {
      id: 'user-input',
      name: 'User Input',
      description: 'Natural language requirements',
      icon: MessageSquare,
      position: { x: 10, y: 50 },
      color: 'text-blue-500',
      type: 'input'
    },
    
    // Core Processing Layer
    {
      id: 'ai-engine',
      name: 'AI Engine',
      description: 'Conversational AI processing',
      icon: Brain,
      position: { x: 30, y: 30 },
      color: 'text-purple-500',
      type: 'core'
    },
    {
      id: 'mcp-server',
      name: 'MCP Server',
      description: 'Model Context Protocol',
      icon: Network,
      position: { x: 50, y: 20 },
      color: 'text-cyan-500',
      type: 'core'
    },
    
    // Generator Layer
    {
      id: 'backend',
      name: 'Backend Service',
      description: 'API & business logic generation',
      icon: Server,
      position: { x: 70, y: 35 },
      color: 'text-orange-500',
      type: 'generator'
    },
    {
      id: 'frontend',
      name: 'Frontend Service',
      description: 'UI component generation',
      icon: Layout,
      position: { x: 70, y: 65 },
      color: 'text-pink-500',
      type: 'generator'
    },
    {
      id: 'infra',
      name: 'Infrastructure',
      description: 'DevOps & deployment config',
      icon: Cloud,
      position: { x: 30, y: 70 },
      color: 'text-indigo-500',
      type: 'generator'
    },
    {
      id: 'version-control',
      name: 'Version Control',
      description: 'Git integration service',
      icon: GitBranch,
      position: { x: 50, y: 80 },
      color: 'text-gray-500',
      type: 'generator'
    },
    
    // Output Layer
    {
      id: 'dynamic-update',
      name: 'Dynamic Update',
      description: 'Real-time code updates',
      icon: RefreshCw,
      position: { x: 90, y: 50 },
      color: 'text-red-500',
      type: 'output'
    }
  ];

  const connections: Connection[] = [
    // Main flow
    { from: 'user-input', to: 'ai-engine', type: 'data' },
    { from: 'ai-engine', to: 'mcp-server', type: 'data' },
    { from: 'mcp-server', to: 'backend', type: 'data' },
    { from: 'mcp-server', to: 'frontend', type: 'data' },
    { from: 'backend', to: 'dynamic-update', type: 'data' },
    { from: 'frontend', to: 'dynamic-update', type: 'data' },
    
    // Infrastructure flow
    { from: 'ai-engine', to: 'infra', type: 'control' },
    { from: 'infra', to: 'version-control', type: 'control' },
    { from: 'version-control', to: 'dynamic-update', type: 'control' },
    
    // Feedback loops
    { from: 'dynamic-update', to: 'ai-engine', type: 'feedback', label: 'Status feedback' },
    { from: 'mcp-server', to: 'ai-engine', type: 'feedback', label: 'Context update' }
  ];

  useEffect(() => {
    if (activeFlow.length > 0) {
      const connection = connections.find(
        c => activeFlow.includes(c.from) && activeFlow.includes(c.to)
      );
      
      if (connection) {
        const newDot = {
          id: `${connection.from}-${connection.to}-${Date.now()}`,
          from: connection.from,
          to: connection.to,
          progress: 0
        };
        
        setAnimatedDots(prev => [...prev, newDot]);
        
        const animationInterval = setInterval(() => {
          setAnimatedDots(prev => 
            prev.map(dot => 
              dot.id === newDot.id 
                ? { ...dot, progress: Math.min(dot.progress + 2, 100) }
                : dot
            )
          );
        }, 20);
        
        setTimeout(() => {
          clearInterval(animationInterval);
          setAnimatedDots(prev => prev.filter(dot => dot.id !== newDot.id));
        }, 2000);
      }
    }
  }, [activeFlow]);

  const getNodePosition = (nodeId: string) => {
    const node = services.find(s => s.id === nodeId);
    return node ? node.position : { x: 50, y: 50 };
  };

  const calculatePath = (from: { x: number; y: number }, to: { x: number; y: number }, type: string) => {
    if (type === 'feedback') {
      // Curved path for feedback loops
      const midX = (from.x + to.x) / 2;
      const midY = Math.max(from.y, to.y) + 20;
      return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
    }
    // Straight path for normal connections
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  const calculateDotPosition = (from: string, to: string, progress: number) => {
    const fromPos = getNodePosition(from);
    const toPos = getNodePosition(to);
    
    return {
      x: fromPos.x + (toPos.x - fromPos.x) * (progress / 100),
      y: fromPos.y + (toPos.y - fromPos.y) * (progress / 100),
    };
  };

  return (
    <div className="relative w-full h-[600px] bg-card rounded-lg overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 data-stream opacity-5" />
      
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              className="fill-muted-foreground"
            />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              className="fill-primary"
            />
          </marker>
        </defs>
        
        {connections.map((connection) => {
          const from = getNodePosition(connection.from);
          const to = getNodePosition(connection.to);
          const isActive = activeFlow.includes(connection.from) && activeFlow.includes(connection.to);
          const path = calculatePath(from, to, connection.type);
          
          return (
            <g key={`${connection.from}-${connection.to}`}>
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  'transition-all duration-500',
                  isActive ? 'text-primary' : 'text-muted-foreground/30',
                  connection.type === 'feedback' && 'stroke-dasharray-4'
                )}
                markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
              {connection.label && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 5}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {connection.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Animated dots */}
        {animatedDots.map(dot => {
          const pos = calculateDotPosition(dot.from, dot.to, dot.progress);
          return (
            <circle
              key={dot.id}
              cx={`${pos.x}%`}
              cy={`${pos.y}%`}
              r="5"
              className="fill-primary"
            >
              <animate
                attributeName="r"
                values="4;8;4"
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>

      {/* Service Nodes */}
      {services.map(service => {
        const Icon = service.icon;
        const isActive = activeFlow.includes(service.id);
        
        return (
          <div
            key={service.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${service.position.x}%`, top: `${service.position.y}%` }}
          >
            <div className="relative group">
              {/* Glow effect for active nodes */}
              {isActive && (
                <div className={cn(
                  'absolute inset-0 rounded-lg blur-xl opacity-40',
                  service.color.replace('text-', 'bg-')
                )} />
              )}
              
              <div className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg',
                'palantir-card transition-all duration-300',
                'hover:scale-105 hover:shadow-lg cursor-pointer',
                isActive && 'border-primary shadow-md'
              )}>
                <div className={cn(
                  'p-3 rounded-full',
                  'bg-background border-2 transition-colors',
                  isActive ? 'border-primary' : 'border-border'
                )}>
                  <Icon size={24} className={service.color} />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold">{service.name}</h4>
                  <p className="text-xs text-muted-foreground max-w-[120px]">
                    {service.description}
                  </p>
                </div>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <p className="text-xs font-mono">{service.id}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-6 text-xs text-muted-foreground z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-muted-foreground/30" />
          <span>Data Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-muted-foreground/30 border-dashed border-t-2" />
          <span>Feedback</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}