'use client'

import { useEffect, useState } from 'react';
import { useConversationStore } from '@/lib/store';
import { Service } from '@/types';
import { Play, Square, RefreshCw, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoServices } from '@/lib/demoData';

const initialServices: Service[] = [
  {
    id: 'conversational-layer',
    name: 'Conversational Layer',
    port: 8080,
    status: 'running',
    description: '사용자 인터페이스 및 프론트엔드',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8080'
  },
  {
    id: 'conversational-ai-engine',
    name: 'Conversational AI Engine',
    port: 8087,
    status: 'stopped',
    description: '자연어 처리 및 AI 대화 엔진',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8087'
  },
  {
    id: 'mcp-server',
    name: 'MCP Server',
    port: 8082,
    status: 'stopped',
    description: '도구 API 조정 및 오케스트레이션',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8082'
  },
  {
    id: 'domain-schema-service',
    name: 'Domain Schema Service',
    port: 8083,
    status: 'stopped',
    description: '도메인 모델 및 스키마 관리',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8083'
  },
  {
    id: 'backend-service',
    name: 'Backend Service',
    port: 8084,
    status: 'stopped',
    description: 'API 엔드포인트 생성 서비스',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8084'
  },
  {
    id: 'design-frontend-service',
    name: 'Design Frontend Service',
    port: 8085,
    status: 'stopped',
    description: 'UI/UX 컴포넌트 생성',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8085'
  },
  {
    id: 'infra-version-control-service',
    name: 'Infra Version Control Service',
    port: 8086,
    status: 'stopped',
    description: '인프라 및 버전 관리',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8086'
  },
  {
    id: 'dynamic-update-engine',
    name: 'Dynamic Update Engine',
    port: 8081,
    status: 'stopped',
    description: '의존성 관리 및 변경 전파',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8081'
  }
];

export default function ServicePanel() {
  const { services, setServices, updateService, userMode, isTestMode } = useConversationStore();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (services.length === 0) {
      setServices(isTestMode ? demoServices : initialServices);
    }
  }, [services, setServices, isTestMode]);

  const handleServiceControl = async (serviceId: string, action: 'start' | 'stop') => {
    setIsLoading({ ...isLoading, [serviceId]: true });
    updateService(serviceId, { status: action === 'start' ? 'starting' : 'stopping' });

    if (isTestMode) {
      // Simulate service control in test mode
      setTimeout(() => {
        updateService(serviceId, { status: action === 'start' ? 'running' : 'stopped' });
        setIsLoading({ ...isLoading, [serviceId]: false });
      }, 1500);
    } else {
      try {
        const response = await fetch('/api/services/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId, action })
        });

        if (response.ok) {
          const result = await response.json();
          updateService(serviceId, { status: result.status });
        } else {
          updateService(serviceId, { status: 'error' });
        }
      } catch (error) {
        console.error('Service control error:', error);
        updateService(serviceId, { status: 'error' });
      } finally {
        setIsLoading({ ...isLoading, [serviceId]: false });
      }
    }
  };

  const checkServiceHealth = async (service: Service) => {
    if (isTestMode) {
      // Simulate health check in test mode
      const randomStatuses: Service['status'][] = ['running', 'stopped', 'error'];
      const randomStatus = randomStatuses[Math.floor(Math.random() * randomStatuses.length)];
      setTimeout(() => {
        updateService(service.id, { status: randomStatus });
      }, 500);
    } else {
      try {
        console.log(`Checking health for service: ${service.name}`);
        const response = await fetch(`/api/services/health/${service.id}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const health = await response.json();
          console.log(`Health check result for ${service.name}:`, health);
          updateService(service.id, { status: health.status });
        } else {
          console.warn(`Health check failed for ${service.name}: ${response.status}`);
          updateService(service.id, { status: 'stopped' });
        }
      } catch (error) {
        console.error(`Health check error for ${service.name}:`, error);
        updateService(service.id, { status: 'stopped' });
      }
    }
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stopped':
        return <Square className="w-5 h-5 text-gray-500" />;
      case 'starting':
      case 'stopping':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: Service['status']) => {
    switch (status) {
      case 'running':
        return '실행 중';
      case 'stopped':
        return '중지됨';
      case 'starting':
        return '시작 중...';
      case 'stopping':
        return '중지 중...';
      case 'error':
        return '오류';
    }
  };

  if (userMode !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Server className="w-5 h-5" />
          서비스 관리 패널
        </h2>
        <button
          onClick={() => services.forEach(s => checkServiceHealth(s))}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          전체 상태 확인
        </button>
      </div>

      <div className="grid gap-4">
        {services.map(service => (
          <div
            key={service.id}
            className={cn(
              "p-4 rounded-lg border bg-card",
              service.status === 'error' && "border-red-500/50",
              service.status === 'running' && "border-green-500/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description} • 포트 {service.port}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {service.modes.map(mode => (
                      <span
                        key={mode}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted"
                      >
                        {mode === 'beginner' ? '초보자' : mode === 'expert' ? '전문가' : '관리자'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-sm font-medium",
                  service.status === 'running' && "text-green-500",
                  service.status === 'stopped' && "text-gray-500",
                  service.status === 'error' && "text-red-500"
                )}>
                  {getStatusText(service.status)}
                </span>
                
                {service.status === 'running' ? (
                  <button
                    onClick={() => handleServiceControl(service.id, 'stop')}
                    disabled={isLoading[service.id] || service.required}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      service.required 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    )}
                  >
                    <Square className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleServiceControl(service.id, 'start')}
                    disabled={isLoading[service.id]}
                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}