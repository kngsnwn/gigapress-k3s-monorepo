#!/bin/bash

# 개별 서비스 배포 스크립트
SERVICE_NAME=$1
IMAGE_TAG=${2:-"latest"}
NAMESPACE=${3:-"gigapress"}

if [ -z "$SERVICE_NAME" ]; then
    echo "사용법: $0 <service-name> [image-tag] [namespace]"
    echo "예시: $0 frontend v1.2.3 gigapress"
    exit 1
fi

echo "=== $SERVICE_NAME 서비스 배포 시작 ==="

# 서비스 디렉토리 확인
if [ ! -d "services/$SERVICE_NAME" ]; then
    echo "❌ 서비스 디렉토리를 찾을 수 없습니다: services/$SERVICE_NAME"
    exit 1
fi

# Kubernetes 매니페스트 파일 확인
if [ ! -d "services/$SERVICE_NAME/k8s" ]; then
    echo "❌ Kubernetes 매니페스트 디렉토리를 찾을 수 없습니다: services/$SERVICE_NAME/k8s"
    exit 1
fi

# 네임스페이스 생성 (없는 경우)
echo "📝 네임스페이스 확인/생성: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 배포 매니페스트 적용
echo "🚀 $SERVICE_NAME 배포 중..."
kubectl apply -f services/$SERVICE_NAME/k8s/ -n $NAMESPACE

# 이미지 태그 업데이트 (latest가 아닌 경우)
if [ "$IMAGE_TAG" != "latest" ]; then
    echo "🏷️  이미지 태그 업데이트: $IMAGE_TAG"
    kubectl set image deployment/$SERVICE_NAME \
        $SERVICE_NAME=ghcr.io/$GITHUB_REPOSITORY_OWNER/gigapress-$SERVICE_NAME:$IMAGE_TAG \
        -n $NAMESPACE
fi

# 롤아웃 상태 확인
echo "⏳ 배포 상태 확인 중..."
kubectl rollout status deployment/$SERVICE_NAME -n $NAMESPACE --timeout=300s

if [ $? -eq 0 ]; then
    echo "✅ $SERVICE_NAME 배포 완료!"
    kubectl get pods -l app=$SERVICE_NAME -n $NAMESPACE
else
    echo "❌ $SERVICE_NAME 배포 실패!"
    kubectl describe deployment/$SERVICE_NAME -n $NAMESPACE
    exit 1
fi