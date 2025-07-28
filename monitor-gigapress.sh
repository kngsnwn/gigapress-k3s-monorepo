#!/bin/bash

# GigaPress 서비스 모니터링 스크립트

echo "=== GigaPress Service Monitor ==="
echo "현재 시간: $(date)"
echo ""

# Pod 상태
echo "📦 Pod 상태:"
ssh -p 2222 ksw@175.208.154.213 "sudo kubectl get pods -n gigapress -o wide"
echo ""

# 서비스 상태
echo "🌐 서비스 상태:"
ssh -p 2222 ksw@175.208.154.213 "sudo kubectl get services -n gigapress"
echo ""

# 리소스 사용량
echo "📊 리소스 사용량:"
ssh -p 2222 ksw@175.208.154.213 "sudo kubectl top pods -n gigapress 2>/dev/null || echo 'Metrics server not installed'"
echo ""

# 시스템 리소스
echo "💻 시스템 리소스:"
ssh -p 2222 ksw@175.208.154.213 "free -h && echo '' && df -h /home"
echo ""

# 웹 서비스 확인
echo "🔍 웹 서비스 상태:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://175.208.154.213:30082 || echo "웹 서비스 접속 실패"
echo ""

# 최근 이벤트
echo "📝 최근 이벤트:"
ssh -p 2222 ksw@175.208.154.213 "sudo kubectl get events -n gigapress --sort-by='.lastTimestamp' | tail -10"