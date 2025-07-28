# GigaPress Light - 프로젝트 가이드

## 📋 프로젝트 개요
GigaPress Light는 GigaPress의 경량화 버전으로, 핵심 기능에 집중한 자연어 기반 소프트웨어 프로젝트 생성 시스템입니다.

## 🏗️ 시스템 아키텍처

### 포함된 서비스 (4개 핵심 서비스)
1. **Backend Service** (포트 8080) - Java + Spring Boot
   - 핵심 비즈니스 로직 처리
   - REST API 제공
   - 프로젝트 관리 및 조정

2. **Domain Schema Service** (포트 8081) - Java + Spring Data JPA
   - 도메인 모델 정의 및 관리
   - 데이터베이스 스키마 생성
   - 엔티티 관계 관리

3. **Conversational AI Engine** (포트 8000) - Python + FastAPI + LangChain
   - 자연어 처리 및 이해
   - AI 기반 프로젝트 생성 로직
   - 대화형 인터페이스 백엔드

4. **Conversational Layer** (포트 3000) - Next.js + TypeScript
   - 사용자 인터페이스
   - 실시간 대화형 상호작용
   - 프로젝트 진행 상황 시각화

### 인프라 구성
- **PostgreSQL**: 주 데이터베이스 (포트 5432)
- **Neo4j**: 그래프 DB - 의존성 추적 (포트 7474, 7687)
- **Kafka + Zookeeper**: 이벤트 스트리밍 (포트 9092, 2181)
- **Redis**: 캐싱 레이어 (포트 6379)

## 🚀 빠른 시작

### Prerequisites
- Docker & Docker Compose
- Java 17+ (선택사항)
- Python 3.9+ (선택사항)
- Node.js 18+ (선택사항)

### 실행 방법

1. **전체 시스템 시작**
   ```bash
   docker-compose up -d
   ```

2. **인프라만 시작 (개발용)**
   ```bash
   ./start-infrastructure.sh
   ```

3. **상태 확인**
   ```bash
   ./check-infrastructure.sh
   ```

4. **시스템 중지**
   ```bash
   ./stop-infrastructure.sh
   ```

## 📊 서비스 상호작용

```
사용자 → Conversational Layer (UI)
         ↓
      Conversational AI Engine
         ↓
    Backend Service ←→ Domain Schema Service
         ↓
    PostgreSQL / Neo4j / Redis
         ↓
      Kafka (이벤트 스트리밍)
```

## 🔧 개발 가이드

### 로컬 개발 환경 설정

1. **인프라 서비스만 실행**
   ```bash
   docker-compose up -d postgres neo4j kafka zookeeper redis
   ```

2. **각 서비스 개별 실행**
   ```bash
   # Backend Service
   cd services/backend-service
   ./gradlew bootRun

   # Domain Schema Service  
   cd services/domain-schema-service
   ./gradlew bootRun

   # Conversational AI Engine
   cd services/conversational-ai-engine
   python -m app.main

   # Conversational Layer
   cd services/conversational-layer
   npm run dev
   ```

## 📝 주요 API 엔드포인트

### Backend Service (8080)
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/{id}` - 프로젝트 상세 정보

### Domain Schema Service (8081)
- `POST /api/schemas` - 스키마 생성
- `GET /api/schemas/{projectId}` - 프로젝트 스키마 조회

### Conversational AI Engine (8000)
- `POST /api/conversation` - 대화 처리
- `WebSocket /ws` - 실시간 대화

## 🧪 테스트

### 통합 테스트 시나리오
1. 프론트엔드 접속: http://localhost:3000
2. 새 프로젝트 생성 대화 시작
3. 자연어로 프로젝트 요구사항 입력
4. 생성된 프로젝트 구조 확인

## 🐳 Docker 이미지 빌드

```bash
# 모든 서비스 이미지 빌드
docker-compose build

# 특정 서비스만 빌드
docker-compose build backend-service
```

## 📌 주의사항

1. **메모리 요구사항**: 최소 8GB RAM 권장
2. **포트 충돌**: 사용 포트 확인 필요 (3000, 8000, 8080, 8081, 5432, 6379, 7474, 7687, 9092)
3. **초기 구동 시간**: 전체 시스템 준비까지 약 2-3분 소요

## 🔍 문제 해결

### 서비스가 시작되지 않을 때
1. Docker 로그 확인: `docker-compose logs [service-name]`
2. 포트 사용 확인: `netstat -an | grep [port]`
3. 볼륨 초기화: `docker-compose down -v`

### 연결 오류 발생 시
1. 네트워크 확인: `docker network ls`
2. 서비스 상태 확인: `docker-compose ps`
3. 헬스체크 확인: `./check-infrastructure.sh`