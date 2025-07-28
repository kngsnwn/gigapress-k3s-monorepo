# GigaPress K3s 배포 가이드

미니PC K3s 환경에 GigaPress 마이크로서비스를 배포하는 방법을 설명합니다.

## 🚀 빠른 배포

### 1. 전체 배포 실행
```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy-to-k3s.sh
chmod +x set-secrets.sh

# 전체 배포 실행
./deploy-to-k3s.sh
```

### 2. API Key 설정
```bash
# Anthropic API Key 설정
./set-secrets.sh
```

### 3. 접속 확인
- **NodePort 접속**: http://175.208.154.213:30082
- **도메인 접속**: http://gigapress.kngsnwn.duckdns.org (DuckDNS 설정 후)

## 📋 배포된 서비스들

| 서비스 | 포트 | 설명 |
|--------|------|------|
| conversational-layer | 8080 | Frontend (Next.js) |
| conversational-ai-engine | 8087 | AI 엔진 (Python/FastAPI) |
| backend-service | 8084 | 백엔드 API (Spring Boot) |
| domain-schema-service | 8083 | 도메인 스키마 서비스 (Spring Boot) |
| postgres | 5432 | PostgreSQL 데이터베이스 |
| redis | 6379 | Redis 캐시 |
| kafka | 9092 | Kafka 메시지 브로커 |
| neo4j | 7474/7687 | Neo4j 그래프 데이터베이스 |

## 🔧 수동 배포 단계

### 1. 프로젝트 전송
```bash
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    -e "ssh -p 2222" \
    ./ ksw@175.208.154.213:/home/ksw/dev/gigapress-light/
```

### 2. 미니PC SSH 접속
```bash
ssh -p 2222 ksw@175.208.154.213
cd /home/ksw/dev/gigapress-light
```

### 3. Docker 이미지 빌드
```bash
# Domain Schema Service
cd domain-schema-service
sudo docker build -t domain-schema-service:latest .
sudo docker save domain-schema-service:latest | sudo k3s ctr images import -
cd ..

# Backend Service
cd backend-service
sudo docker build -t backend-service:latest .
sudo docker save backend-service:latest | sudo k3s ctr images import -
cd ..

# Conversational AI Engine
cd conversational-ai-engine
sudo docker build -t conversational-ai-engine:latest .
sudo docker save conversational-ai-engine:latest | sudo k3s ctr images import -
cd ..

# Conversational Layer
cd conversational-layer
sudo docker build -t conversational-layer:latest .
sudo docker save conversational-layer:latest | sudo k3s ctr images import -
cd ..
```

### 4. K3s 배포
```bash
# 기존 배포 제거 (있는 경우)
sudo kubectl delete namespace gigapress --ignore-not-found=true

# 새 배포 적용
sudo kubectl apply -f k8s-deployment.yaml
```

### 5. Secret 설정
```bash
# API Key 설정
sudo kubectl create secret generic gigapress-secrets \
  --from-literal=anthropic-api-key="your-api-key-here" \
  -n gigapress

# 서비스 재시작
sudo kubectl rollout restart deployment/conversational-ai-engine -n gigapress
```

## 🔍 배포 상태 확인

### Pod 상태 확인
```bash
sudo kubectl get pods -n gigapress
sudo kubectl get services -n gigapress
```

### 로그 확인
```bash
# 전체 로그
sudo kubectl logs -f deployment/conversational-layer -n gigapress

# 특정 Pod 로그
sudo kubectl logs <pod-name> -n gigapress
```

### 서비스 상태 확인
```bash
sudo kubectl describe deployment conversational-layer -n gigapress
sudo kubectl describe service conversational-layer -n gigapress
```

## 🌐 네트워크 설정

### NodePort 접속
- **주소**: http://175.208.154.213:30082
- **포트**: 30082 (기존 inv-wed는 30080 사용 중)

### DuckDNS 도메인 설정 (선택사항)
1. DuckDNS에서 `gigapress.kngsnwn.duckdns.org` 생성
2. A 레코드를 `175.208.154.213`으로 설정
3. Ingress를 통한 도메인 접속 가능

## 🔧 문제 해결

### 일반적인 문제들

#### 1. Pod가 Pending 상태
```bash
sudo kubectl describe pod <pod-name> -n gigapress
# 리소스 부족이나 이미지 Pull 문제 확인
```

#### 2. 이미지 Pull 실패
```bash
# 이미지가 올바르게 import되었는지 확인
sudo k3s ctr images list | grep gigapress
```

#### 3. 서비스 연결 실패
```bash
# 서비스 endpoint 확인
sudo kubectl get endpoints -n gigapress
```

#### 4. 데이터베이스 연결 실패
```bash
# PostgreSQL Pod 상태 확인
sudo kubectl logs deployment/postgres -n gigapress
```

### 리소스 정리
```bash
# 전체 네임스페이스 제거
sudo kubectl delete namespace gigapress

# 특정 배포만 제거
sudo kubectl delete deployment <deployment-name> -n gigapress
```

## 📊 모니터링

### 리소스 사용량 확인
```bash
# Pod 리소스 사용량
sudo kubectl top pods -n gigapress

# 노드 리소스 사용량
sudo kubectl top nodes
```

### 이벤트 확인
```bash
sudo kubectl get events -n gigapress --sort-by='.lastTimestamp'
```

## 🚨 주의사항

1. **리소스 제한**: 미니PC 사양에 맞게 각 서비스의 replicas를 1로 설정
2. **포트 충돌**: NodePort 30082 사용 (30080은 inv-wed가 사용 중)
3. **Secret 관리**: API Key는 반드시 Secret으로 관리
4. **데이터 백업**: PV 데이터는 정기적으로 백업 권장
5. **메모리 사용량**: Neo4j, Kafka 등 메모리 사용량이 높은 서비스 모니터링 필요

## 📝 추가 설정

### Persistent Volume 설정
현재는 기본 스토리지를 사용하지만, 필요시 NFS나 로컬 스토리지 설정 가능

### SSL/TLS 설정
Let's Encrypt와 cert-manager를 사용하여 HTTPS 설정 가능

### 스케일링
필요시 특정 서비스의 replicas 수를 증가시킬 수 있음 (리소스 허용 범위 내에서)