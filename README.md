# GigaPress Light

GigaPress Light는 자연어 기반 소프트웨어 프로젝트 자동 생성 시스템인 GigaPress의 경량화 버전입니다.

## 개요

이 프로젝트는 AI를 활용하여 사용자의 자연어 요구사항을 분석하고, 자동으로 소프트웨어 프로젝트를 생성합니다. 경량화 버전은 핵심 기능에 집중하여 더 빠르고 효율적인 개발 환경을 제공합니다.

## 포함된 서비스

### 핵심 서비스
1. **Conversational Layer** (포트 8080)
   - Next.js 기반 웹 인터페이스
   - 실시간 채팅 인터페이스
   - 프로젝트 생성 진행상황 시각화

2. **Conversational AI Engine** (포트 8087)
   - FastAPI 기반 AI 엔진
   - Claude API를 통한 자연어 처리
   - LangChain을 활용한 대화 관리
   - WebSocket을 통한 실시간 통신

3. **Domain Schema Service** (포트 8083)
   - Spring Boot 기반 도메인 모델링 서비스
   - 데이터베이스 스키마 자동 설계
   - JPA 엔티티 생성

4. **Backend Service** (포트 8084)
   - Spring Boot 기반 백엔드 생성 서비스
   - REST API 자동 생성
   - 비즈니스 로직 구현

### 인프라 서비스
- **PostgreSQL**: 메인 데이터베이스
- **Neo4j**: 의존성 그래프 관리
- **Redis**: 캐싱 및 세션 관리
- **Kafka**: 이벤트 스트리밍

## 시작하기

### 필요 사항
- Docker 및 Docker Compose
- Java 17+ (로컬 개발용)
- Node.js 18+ (로컬 개발용)
- Python 3.9+ (로컬 개발용)

### 설치 및 실행

1. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정
# 특히 ANTHROPIC_API_KEY를 설정해주세요
```

2. Docker Compose로 전체 시스템 실행
```bash
docker-compose up -d
```

3. 서비스 상태 확인
```bash
docker-compose ps
```

4. 웹 인터페이스 접속
```
http://localhost:8080
```

### 개별 서비스 개발

각 서비스는 독립적으로 개발할 수 있습니다:

```bash
# Backend Service
cd backend-service
./gradlew bootRun

# Domain Schema Service
cd domain-schema-service
./gradlew bootRun

# Conversational AI Engine
cd conversational-ai-engine
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Conversational Layer
cd conversational-layer
npm install
npm run dev
```

## 프로젝트 구조

```
gigapress-light/
├── backend-service/           # REST API 및 비즈니스 로직 생성
├── conversational-ai-engine/  # AI 기반 자연어 처리
├── conversational-layer/      # 웹 UI
├── domain-schema-service/     # 도메인 모델 및 DB 스키마 생성
├── docker/                    # Docker 관련 설정
├── common/                    # 공통 라이브러리
└── docker-compose.yml        # 통합 실행 설정
```

## 사용 예시

1. 웹 인터페이스(http://localhost:8080)에 접속
2. 채팅창에 프로젝트 요구사항 입력
   - 예: "쇼핑몰 웹사이트를 만들어주세요"
3. AI가 요구사항을 분석하고 프로젝트 생성
4. 생성된 코드 및 설정 파일 확인

## 문제 해결

### 서비스가 시작되지 않는 경우
```bash
# 로그 확인
docker-compose logs [service-name]

# 전체 재시작
docker-compose down
docker-compose up -d
```

### 포트 충돌
`.env` 파일에서 포트 번호를 변경하거나 docker-compose.yml을 수정하세요.

## 라이선스

이 프로젝트는 원본 GigaPress 프로젝트의 라이선스를 따릅니다.