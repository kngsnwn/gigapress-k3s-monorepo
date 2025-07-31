# GigaPress Light 개발 환경 실행 가이드

이 가이드는 개발 중 Docker 없이 직접 애플리케이션을 실행하는 방법을 설명합니다.

## 🚀 실행 순서

### 1. 인프라 서비스 시작 (Docker)
```bash
# 프로젝트 루트 디렉토리에서 실행
docker-compose up -d
```

**실행되는 서비스:**
- PostgreSQL (5432)
- Redis (6379) 
- Neo4j (7474, 7687)
- Zookeeper (2181)
- Kafka (9092)

### 2. Backend Service 실행
```bash
cd backend-service
./gradlew bootRun
# 또는 Windows에서: gradlew.bat bootRun
```
- **포트**: 8084
- **URL**: http://localhost:8084
- **Swagger UI**: http://localhost:8084/swagger-ui.html

### 3. Conversational AI Engine 실행
```bash
cd conversational-ai-engine

# Python 가상환경 활성화 (선택사항)
# python -m venv venv
# source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn app.main:app --host 0.0.0.0 --port 8087 --reload
```
- **포트**: 8087
- **URL**: http://localhost:8087
- **Health Check**: http://localhost:8087/health

### 4. Conversational Layer 실행
```bash
cd conversational-layer

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
- **포트**: 8080
- **URL**: http://localhost:8080

## 🔧 환경 설정

### Backend Service
- **설정 파일**: `backend-service/src/main/resources/application.properties`
- **주요 설정**:
  - Database: `jdbc:postgresql://localhost:5432/gigapress`
  - Redis: `localhost:6379` (비밀번호 없음)
  - Kafka: `localhost:9092`

### AI Engine
- **설정 파일**: `conversational-ai-engine/config/settings.py`
- **환경 변수 파일**: `conversational-ai-engine/.env` (선택사항)
- **주요 설정**:
  - Redis: `localhost:6379`
  - Kafka: `localhost:9092`
  - Backend: `http://localhost:8084`

### Conversational Layer
- **설정**: Next.js 기본 설정 사용
- **API URL**: `http://localhost:8087`
- **WebSocket URL**: `ws://localhost:8087`

## 🛠️ 개발 도구

### 데이터베이스 접속
```bash
# PostgreSQL
psql -h localhost -p 5432 -U gigapress -d gigapress

# Neo4j Browser
# http://localhost:7474
# Username: neo4j
# Password: gigapress123
```

### Redis CLI
```bash
redis-cli -h localhost -p 6379
```

### Kafka 테스트
```bash
# Kafka 토픽 목록 확인
docker exec gigapress-kafka kafka-topics --list --bootstrap-server localhost:9092

# 토픽 생성
docker exec gigapress-kafka kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

## 🚦 서비스 상태 확인

### Health Check URLs
- Backend Service: http://localhost:8084/actuator/health
- AI Engine: http://localhost:8087/health
- Conversational Layer: http://localhost:8080 (메인 페이지)

### 인프라 서비스 상태
```bash
docker ps
```

## 🔄 재시작 시 주의사항

1. **인프라 서비스 먼저 시작**: `docker-compose up -d`
2. **Backend Service 시작**: 데이터베이스 연결 대기
3. **AI Engine 시작**: Redis, Kafka 연결 대기  
4. **Frontend 시작**: Backend 서비스 대기

## 🛑 종료하기

### 애플리케이션 서비스
- 각 터미널에서 `Ctrl+C`로 종료

### 인프라 서비스
```bash
docker-compose down
```

### 전체 정리 (볼륨 포함)
```bash
docker-compose down -v
```

## 📝 개발 팁

1. **Hot Reload**: 
   - AI Engine: `--reload` 플래그로 코드 변경 시 자동 재시작
   - Frontend: `npm run dev`로 자동 새로고침
   - Backend: IDE에서 Spring Boot DevTools 사용

2. **로그 확인**:
   - 각 서비스의 콘솔 출력 모니터링
   - Docker 로그: `docker logs <container_name>`

3. **포트 충돌 시**:
   - 각 서비스의 설정 파일에서 포트 변경 가능
   - 변경 후 모든 서비스에서 URL 업데이트 필요