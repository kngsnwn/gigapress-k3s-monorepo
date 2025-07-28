#!/bin/bash

# GigaPress K3s Secret 설정 스크립트
# ANTHROPIC_API_KEY 등 민감한 정보를 K3s Secret으로 설정

set -e

MINI_PC_HOST="175.208.154.213"
MINI_PC_PORT="2222"
MINI_PC_USER="ksw"

echo "🔐 GigaPress K3s Secret 설정을 시작합니다..."

# ANTHROPIC_API_KEY 입력 받기
echo "ANTHROPIC_API_KEY를 입력해주세요:"
read -s ANTHROPIC_API_KEY

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY가 입력되지 않았습니다."
    exit 1
fi

echo "📡 미니PC에 Secret 설정 중..."

# 미니PC에서 Secret 생성
ssh -p ${MINI_PC_PORT} ${MINI_PC_USER}@${MINI_PC_HOST} << ENDSSH
# base64 인코딩
ANTHROPIC_API_KEY_B64=\$(echo -n "${ANTHROPIC_API_KEY}" | base64)

# Secret 생성/업데이트
sudo kubectl create secret generic gigapress-secrets \
  --from-literal=anthropic-api-key="${ANTHROPIC_API_KEY}" \
  -n gigapress \
  --dry-run=client -o yaml | sudo kubectl apply -f -

echo "✅ Secret 설정 완료"

# conversational-ai-engine 재시작하여 새 Secret 적용
echo "🔄 conversational-ai-engine 재시작 중..."
sudo kubectl rollout restart deployment/conversational-ai-engine -n gigapress

echo "⏳ 재시작 완료 대기 중..."
sudo kubectl rollout status deployment/conversational-ai-engine -n gigapress

echo "🎉 Secret 설정 및 서비스 재시작이 완료되었습니다!"
ENDSSH

echo "✅ GigaPress Secret 설정이 완료되었습니다!"