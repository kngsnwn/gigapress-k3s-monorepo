#!/usr/bin/env python3
"""
GigaPress API 테스트 스크립트
모든 서비스의 API 엔드포인트를 테스트합니다.
"""

import requests
import json
from datetime import datetime
import time

# API 엔드포인트
SERVICES = {
    "Frontend": "http://localhost:8080",
    "Domain Schema Service": "http://localhost:8083",
    "Backend Service": "http://localhost:8084",
    "Conversational AI Engine": "http://localhost:8087"
}

def print_section(title):
    """섹션 구분선 출력"""
    print(f"\n{'='*60}")
    print(f"[TEST] {title}")
    print('='*60)

def test_health_endpoints():
    """각 서비스의 health 엔드포인트 테스트"""
    print_section("Health Check 테스트")
    
    health_endpoints = {
        "Domain Schema": "http://localhost:8083/health",
        "Backend": "http://localhost:8084/actuator/health",
        "AI Engine": "http://localhost:8087/health"
    }
    
    for service, url in health_endpoints.items():
        try:
            response = requests.get(url, timeout=5)
            status = "OK" if response.status_code == 200 else f"FAIL {response.status_code}"
            print(f"{service}: {status}")
            if response.status_code == 200:
                print(f"  Response: {response.json()}")
        except Exception as e:
            print(f"{service}: FAIL 연결 실패 - {str(e)}")

def test_domain_schema_api():
    """Domain Schema Service API 테스트"""
    print_section("Domain Schema Service API 테스트")
    
    # 1. 프로젝트 생성
    print("\n1. 프로젝트 생성")
    project_data = {
        "name": "Test E-Commerce Platform",
        "description": "테스트용 이커머스 플랫폼",
        "type": "WEB_APPLICATION"
    }
    
    try:
        response = requests.post(
            "http://localhost:8083/api/projects",
            json=project_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            project = response.json()
            print(f"Created Project: {json.dumps(project, indent=2)}")
            project_id = project.get('data', {}).get('id') or project.get('id')
            
            # 2. 요구사항 추가
            print("\n2. 요구사항 추가")
            requirement_data = {
                "title": "사용자 인증 시스템",
                "description": "JWT 기반 사용자 인증 및 권한 관리",
                "type": "FUNCTIONAL",
                "priority": "HIGH"
            }
            
            req_response = requests.post(
                f"http://localhost:8083/api/projects/{project_id}/requirements",
                json=requirement_data,
                headers={"Content-Type": "application/json"}
            )
            print(f"Requirement Status: {req_response.status_code}")
            if req_response.status_code in [200, 201]:
                print(f"Response: {json.dumps(req_response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_backend_api():
    """Backend Service API 테스트"""
    print_section("Backend Service API 테스트")
    
    # API 명세 생성 테스트
    api_spec = {
        "projectName": "Test API",
        "apiName": "UserController",
        "basePackage": "com.test.api",
        "endpoints": [
            {
                "method": "GET",
                "path": "/users",
                "description": "모든 사용자 조회"
            },
            {
                "method": "POST",
                "path": "/users",
                "description": "새 사용자 생성"
            }
        ]
    }
    
    try:
        response = requests.post(
            "http://localhost:8084/api/generate",
            json=api_spec,
            headers={"Content-Type": "application/json"}
        )
        print(f"API Generation Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Generated API: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_conversational_ai():
    """Conversational AI Engine 테스트"""
    print_section("Conversational AI Engine API 테스트")
    
    # 1. 프로젝트 생성
    print("\n1. AI 프로젝트 대화 시작")
    conversation_data = {
        "message": "이커머스 플랫폼을 만들고 싶습니다. 사용자 관리, 상품 관리, 주문 관리 기능이 필요합니다.",
        "project_id": "test-project-123",
        "context": {
            "language": "java",
            "framework": "spring-boot"
        }
    }
    
    try:
        # POST 요청으로 대화 시작
        response = requests.post(
            "http://localhost:8087/api/v2/conversations",
            json=conversation_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Conversation Status: {response.status_code}")
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"AI Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 2. 프로젝트 상태 확인
            if 'conversation_id' in result:
                conv_id = result['conversation_id']
                print(f"\n2. 대화 ID: {conv_id}")
                
                # 대화 히스토리 조회
                history_response = requests.get(
                    f"http://localhost:8087/api/v2/conversations/{conv_id}/history"
                )
                if history_response.status_code == 200:
                    print(f"대화 히스토리: {json.dumps(history_response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_websocket_connection():
    """WebSocket 연결 테스트 (간단한 확인만)"""
    print_section("WebSocket 연결 테스트")
    
    ws_url = "ws://localhost:8087/ws"
    print(f"WebSocket URL: {ws_url}")
    print("WebSocket 연결은 별도의 클라이언트가 필요합니다.")
    print("브라우저에서 http://localhost:8080 접속하여 실시간 통신을 테스트할 수 있습니다.")

def main():
    """메인 테스트 실행"""
    print("GigaPress API 테스트 시작")
    print(f"시작 시간: {datetime.now()}")
    
    # 1. Health Check
    test_health_endpoints()
    time.sleep(1)
    
    # 2. Domain Schema API
    test_domain_schema_api()
    time.sleep(1)
    
    # 3. Backend API
    test_backend_api()
    time.sleep(1)
    
    # 4. Conversational AI
    test_conversational_ai()
    
    # 5. WebSocket
    test_websocket_connection()
    
    print(f"\n\n테스트 완료: {datetime.now()}")

if __name__ == "__main__":
    main()