#!/bin/bash

# GigaPress K3s 배포 스크립트
# 미니PC K3s 환경에 gigapress-light 마이크로서비스 배포

set -e

echo "🚀 GigaPress K3s 배포를 시작합니다..."

# 미니PC 정보
MINI_PC_HOST="175.208.154.213"
MINI_PC_PORT="2222"
MINI_PC_USER="ksw"
PROJECT_NAME="gigapress-light"
REMOTE_PROJECT_PATH="/home/ksw/dev/$PROJECT_NAME"

# 색상 출력 함수
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# 현재 디렉토리 확인
if [ ! -f "docker-compose.yml" ] || [ ! -f "k8s-deployment.yaml" ]; then
    print_error "gigapress-light 프로젝트 루트 디렉토리에서 실행해주세요"
    exit 1
fi

# 1. 프로젝트 파일을 미니PC로 전송
print_info "프로젝트 파일을 미니PC로 전송 중..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude 'target' \
    --exclude 'build' \
    --exclude '.gradle' \
    -e "ssh -p ${MINI_PC_PORT}" \
    ./ ${MINI_PC_USER}@${MINI_PC_HOST}:${REMOTE_PROJECT_PATH}/

print_success "파일 전송 완료"

# 2. 미니PC에서 Docker 이미지 빌드 및 K3s 배포
print_info "미니PC에서 Docker 이미지 빌드 및 K3s 배포 실행 중..."

ssh -p ${MINI_PC_PORT} ${MINI_PC_USER}@${MINI_PC_HOST} << 'ENDSSH'
set -e

PROJECT_PATH="/home/ksw/dev/gigapress-light"
cd $PROJECT_PATH

echo "📁 현재 디렉토리: $(pwd)"

# Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."

# Domain Schema Service
echo "Building domain-schema-service..."
cd domain-schema-service
sudo docker build -t domain-schema-service:latest .
sudo docker save domain-schema-service:latest | sudo k3s ctr images import -
cd ..

# Backend Service
echo "Building backend-service..."
cd backend-service
sudo docker build -t backend-service:latest .
sudo docker save backend-service:latest | sudo k3s ctr images import -
cd ..

# Conversational AI Engine
echo "Building conversational-ai-engine..."
cd conversational-ai-engine
sudo docker build -t conversational-ai-engine:latest .
sudo docker save conversational-ai-engine:latest | sudo k3s ctr images import -
cd ..

# Conversational Layer
echo "Building conversational-layer..."
cd conversational-layer
sudo docker build -t conversational-layer:latest .
sudo docker save conversational-layer:latest | sudo k3s ctr images import -
cd ..

echo "✅ 모든 Docker 이미지 빌드 완료"

# K3s에 배포
echo "☸️ K3s에 배포 중..."

# 기존 배포 제거 (존재하는 경우)
sudo kubectl delete namespace gigapress --ignore-not-found=true
sleep 10

# 새 배포 적용
sudo kubectl apply -f k8s-deployment.yaml

echo "⏳ 배포 상태 확인 중..."
sleep 30

# 배포 상태 확인
sudo kubectl get pods -n gigapress
sudo kubectl get services -n gigapress

echo "🎉 GigaPress K3s 배포가 완료되었습니다!"
echo ""
echo "📋 접속 정보:"
echo "   NodePort 접속: http://175.208.154.213:30082"
echo "   도메인 접속: http://gigapress.kngsnwn.duckdns.org (DuckDNS 설정 후)"
echo ""
echo "🔍 배포 상태 확인 명령어:"
echo "   sudo kubectl get pods -n gigapress"
echo "   sudo kubectl get services -n gigapress"
echo "   sudo kubectl logs -f deployment/conversational-layer -n gigapress"

ENDSSH

print_success "GigaPress K3s 배포가 완료되었습니다!"
print_info "접속 주소: http://175.208.154.213:30082"

echo ""
echo "📋 배포 후 확인사항:"
echo "1. 모든 Pod가 Running 상태인지 확인"
echo "2. Secret에 ANTHROPIC_API_KEY 설정"
echo "3. DuckDNS 도메인 설정 (선택사항)"
echo ""
echo "🔧 문제 해결 명령어:"
echo "   ssh ksw@175.208.154.213"
echo "   sudo kubectl get pods -n gigapress"
echo "   sudo kubectl describe pod <pod-name> -n gigapress"
echo "   sudo kubectl logs <pod-name> -n gigapress"