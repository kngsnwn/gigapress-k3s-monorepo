#!/bin/bash

# 변경 감지 스크립트 - Git diff를 통한 서비스별 변경 감지

# 이전 커밋과 비교할 기준점 (HEAD~1 또는 특정 커밋)
BASE_COMMIT=${1:-"HEAD~1"}
CURRENT_COMMIT=${2:-"HEAD"}

# 변경된 파일들 가져오기
CHANGED_FILES=$(git diff --name-only $BASE_COMMIT $CURRENT_COMMIT)

# 서비스 디렉토리 목록
SERVICES_DIR="services"
CHANGED_SERVICES=()

echo "=== 변경 감지 시작 ==="
echo "기준 커밋: $BASE_COMMIT"
echo "현재 커밋: $CURRENT_COMMIT"
echo ""

# 변경된 파일들 출력
echo "변경된 파일들:"
echo "$CHANGED_FILES"
echo ""

# 각 서비스별로 변경사항 확인
for service_dir in $SERVICES_DIR/*/; do
    if [ -d "$service_dir" ]; then
        service_name=$(basename "$service_dir")
        
        # 해당 서비스 디렉토리에 변경사항이 있는지 확인
        service_changes=$(echo "$CHANGED_FILES" | grep "^$service_dir")
        
        if [ ! -z "$service_changes" ]; then
            echo "✅ $service_name 서비스에 변경사항 발견:"
            echo "$service_changes" | sed 's/^/  - /'
            CHANGED_SERVICES+=("$service_name")
        else
            echo "⚪ $service_name 서비스에 변경사항 없음"
        fi
    fi
done

echo ""
echo "=== 재배포 대상 서비스 ==="
if [ ${#CHANGED_SERVICES[@]} -eq 0 ]; then
    echo "재배포할 서비스가 없습니다."
    exit 0
else
    printf '%s\n' "${CHANGED_SERVICES[@]}"
    
    # GitHub Actions에서 사용할 수 있도록 output 설정
    if [ ! -z "$GITHUB_OUTPUT" ]; then
        echo "changed_services=$(IFS=','; echo "${CHANGED_SERVICES[*]}")" >> $GITHUB_OUTPUT
    fi
fi