import { Project, Message, ProgressUpdate, Service } from '@/types';

export const demoProjects: Project[] = [
  {
    id: 'demo-1',
    name: '이커머스 플랫폼',
    type: 'Full Stack',
    status: 'completed',
    version: '1.0.0',
    lastModified: new Date(Date.now() - 86400000),
    description: '마이크로서비스 아키텍처 기반의 현대적인 이커머스 플랫폼',
    architecture: {
      frontend: {
        framework: 'Next.js 14',
        libraries: ['React', 'Tailwind CSS', 'Framer Motion', 'Redux Toolkit']
      },
      backend: {
        framework: 'Node.js + Express',
        language: 'TypeScript',
        services: ['인증 서비스', '상품 서비스', '주문 서비스', '결제 서비스']
      },
      database: {
        type: 'PostgreSQL + Redis',
        orm: 'Prisma'
      },
      infrastructure: {
        hosting: 'AWS ECS',
        ci_cd: 'GitHub Actions',
        monitoring: 'DataDog'
      },
      vcs: {
        type: 'Git',
        platform: 'GitHub'
      }
    }
  },
  {
    id: 'demo-2',
    name: '실시간 분석 대시보드',
    type: 'Frontend',
    status: 'generating',
    version: '0.8.0',
    lastModified: new Date(Date.now() - 3600000),
    description: '실시간 데이터 시각화를 위한 인터랙티브 대시보드',
    architecture: {
      frontend: {
        framework: 'React + Vite',
        libraries: ['D3.js', 'Chart.js', 'Material-UI', 'Socket.io-client']
      },
      backend: {
        framework: 'FastAPI',
        language: 'Python',
        services: ['WebSocket 서버', '데이터 처리 엔진']
      }
    }
  },
  {
    id: 'demo-3',
    name: '소셜 미디어 플랫폼',
    type: 'Full Stack',
    status: 'updating',
    version: '2.3.1',
    lastModified: new Date(Date.now() - 7200000),
    description: '실시간 채팅과 피드 기능을 갖춘 소셜 플랫폼',
    architecture: {
      frontend: {
        framework: 'React Native',
        libraries: ['Expo', 'React Navigation', 'Reanimated']
      },
      backend: {
        framework: 'NestJS',
        language: 'TypeScript',
        services: ['사용자 서비스', '피드 서비스', '채팅 서비스', '알림 서비스']
      },
      database: {
        type: 'MongoDB + Redis',
        orm: 'Mongoose'
      }
    }
  },
  {
    id: 'demo-4',
    name: 'AI 챗봇 서비스',
    type: 'Backend',
    status: 'idle',
    version: '0.5.0',
    lastModified: new Date(Date.now() - 172800000),
    description: 'GPT 기반 고객 상담 챗봇 서비스',
    architecture: {
      backend: {
        framework: 'Django',
        language: 'Python',
        services: ['챗봇 엔진', 'NLP 처리기', '학습 데이터 관리']
      },
      database: {
        type: 'PostgreSQL',
        orm: 'Django ORM'
      }
    }
  }
];

export const demoMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: '이커머스 플랫폼을 마이크로서비스로 만들어줘',
    timestamp: new Date(Date.now() - 60000),
    status: 'sent'
  },
  {
    id: '2',
    role: 'assistant',
    content: '네, 마이크로서비스 아키텍처 기반의 현대적인 이커머스 플랫폼을 구성해드리겠습니다. 프로젝트 구조를 설정하고 있습니다.',
    timestamp: new Date(Date.now() - 58000),
    status: 'sent'
  },
  {
    id: '3',
    role: 'assistant',
    content: '다음 서비스들을 구성했습니다:\n- 인증 서비스 (JWT 기반)\n- 상품 관리 서비스\n- 주문 처리 서비스\n- 결제 연동 서비스\n\n각 서비스는 독립적으로 배포 가능하며, API Gateway를 통해 통합됩니다.',
    timestamp: new Date(Date.now() - 55000),
    status: 'sent'
  },
  {
    id: '4',
    role: 'user',
    content: '실시간 분석 대시보드도 추가해줘',
    timestamp: new Date(Date.now() - 30000),
    status: 'sent'
  },
  {
    id: '5',
    role: 'assistant',
    content: '실시간 분석 대시보드를 추가하겠습니다. WebSocket을 통한 실시간 데이터 스트리밍과 D3.js를 활용한 인터랙티브 시각화를 구현합니다.',
    timestamp: new Date(Date.now() - 28000),
    status: 'sent'
  },
  {
    id: '6',
    role: 'user',
    content: '모바일 앱도 필요해',
    timestamp: new Date(Date.now() - 15000),
    status: 'sent'
  },
  {
    id: '7',
    role: 'assistant',
    content: 'React Native를 사용하여 iOS와 Android를 모두 지원하는 모바일 앱을 생성하겠습니다. 기존 백엔드 API와 완벽하게 통합되도록 설정합니다.',
    timestamp: new Date(Date.now() - 13000),
    status: 'sent'
  },
  {
    id: '8',
    role: 'assistant',
    content: '모바일 앱 주요 기능:\n- 사용자 인증 및 프로필 관리\n- 상품 검색 및 필터링\n- 장바구니 및 위시리스트\n- 실시간 주문 추적\n- 푸시 알림\n\n현재 UI 컴포넌트를 생성 중입니다...',
    timestamp: new Date(Date.now() - 10000),
    status: 'sent'
  }
];

export const demoProgressUpdates: ProgressUpdate[] = [
  {
    step: '프로젝트 구조 초기화',
    progress: 100,
    message: '프로젝트 기본 구조 생성 완료',
    timestamp: new Date(Date.now() - 59000)
  },
  {
    step: '프론트엔드 설정',
    progress: 100,
    message: 'Next.js 14 애플리케이션 구성 완료',
    timestamp: new Date(Date.now() - 57000)
  },
  {
    step: '백엔드 서비스 생성',
    progress: 100,
    message: '마이크로서비스 아키텍처 구현 완료',
    timestamp: new Date(Date.now() - 54000)
  },
  {
    step: '데이터베이스 구성',
    progress: 100,
    message: 'PostgreSQL 및 Redis 설정 완료',
    timestamp: new Date(Date.now() - 52000)
  },
  {
    step: 'API Gateway 설정',
    progress: 100,
    message: 'Kong API Gateway 구성 완료',
    timestamp: new Date(Date.now() - 50000)
  },
  {
    step: '실시간 대시보드 구축',
    progress: 85,
    message: 'WebSocket 연결 및 차트 컴포넌트 구현 중',
    timestamp: new Date(Date.now() - 25000)
  },
  {
    step: '모바일 앱 생성',
    progress: 45,
    message: 'React Native 프로젝트 설정 및 기본 화면 구성 중',
    timestamp: new Date(Date.now() - 8000)
  }
];

export const demoServices: Service[] = [
  {
    id: 'conversational-layer',
    name: 'Conversational Layer',
    port: 3000,
    status: 'running',
    description: '사용자 인터페이스 및 대화 관리',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:3000'
  },
  {
    id: 'conversational-ai-engine',
    name: 'AI Engine',
    port: 8001,
    status: 'running',
    description: 'AI 기반 코드 생성 엔진',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8001'
  },
  {
    id: 'mcp-server',
    name: 'MCP Server',
    port: 8002,
    status: 'running',
    description: '모델 컨텍스트 프로토콜 서버',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8002'
  },
  {
    id: 'domain-schema-service',
    name: 'Domain Schema Service',
    port: 8003,
    status: 'running',
    description: '도메인 스키마 관리',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8003'
  },
  {
    id: 'backend-service',
    name: 'Backend Service',
    port: 8004,
    status: 'running',
    description: '백엔드 코드 생성 서비스',
    required: true,
    modes: ['beginner', 'expert', 'admin'],
    endpoint: 'http://localhost:8004'
  },
  {
    id: 'design-frontend-service',
    name: 'Design Frontend Service',
    port: 8005,
    status: 'stopped',
    description: '프론트엔드 디자인 및 코드 생성',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8005'
  },
  {
    id: 'infra-version-control-service',
    name: 'Infra & Version Control',
    port: 8006,
    status: 'stopped',
    description: '인프라 및 버전 관리',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8006'
  },
  {
    id: 'dynamic-update-engine',
    name: 'Dynamic Update Engine',
    port: 8007,
    status: 'stopped',
    description: '실시간 코드 업데이트 엔진',
    required: false,
    modes: ['expert', 'admin'],
    endpoint: 'http://localhost:8007'
  }
];