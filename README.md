# GigaPress K3s Monorepo

K3s 기반 모노레포 - Git 변경 감지를 통한 선택적 서비스 재배포 시스템

## 🏗️ 구조

```
├── services/           # 마이크로서비스들
│   ├── frontend/      # React/Vue 프론트엔드
│   ├── backend/       # Node.js API 서버
│   └── database/      # PostgreSQL 데이터베이스
├── scripts/           # 배포 및 유틸리티 스크립트
├── k8s/              # 공통 Kubernetes 리소스
└── .github/workflows/ # GitHub Actions CI/CD
```

## 🚀 배포 방식

### 자동 배포 (GitHub Actions)
- `main` 브랜치 푸시 시 자동 트리거
- Git diff로 변경된 서비스만 감지
- Docker 이미지 빌드 및 푸시
- K3s 클러스터에 롤링 업데이트

### 수동 배포
```bash
# 단일 서비스 배포
./scripts/deploy-service.sh frontend v1.2.3

# 변경 감지 테스트
./scripts/detect-changes.sh HEAD~1 HEAD
```

## ⚙️ 설정

### GitHub Secrets 필요
- `K3S_SERVER`: K3s 서버 URL
- `K3S_TOKEN`: K3s 인증 토큰  
- `K3S_KUBECONFIG`: kubectl 설정 (base64 인코딩)

### K3s 클러스터 준비
```bash
# 네임스페이스 및 시크릿 생성
kubectl apply -f k8s/namespace.yaml

# 서비스별 초기 배포
kubectl apply -f services/*/k8s/ -n gigapress
```

## 📊 장점

✅ **선택적 배포**: 변경된 서비스만 재배포  
✅ **빠른 배포**: 불필요한 빌드 시간 단축  
✅ **안전성**: 서비스별 독립 배포로 장애 격리  
✅ **확장성**: 새 서비스 추가 시 자동 감지
