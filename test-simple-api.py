#!/usr/bin/env python3
"""
간단한 API 테스트 - curl 방식
"""

import subprocess
import json

def run_curl(command):
    """curl 명령 실행"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout, result.stderr
    except Exception as e:
        return None, str(e)

print("=== GigaPress Simple API Test ===\n")

# 1. Frontend 확인
print("1. Frontend Status:")
stdout, stderr = run_curl('curl -s -o nul -w "HTTP Status: %{http_code}" http://localhost:8080')
print(f"   {stdout}\n")

# 2. Health Checks
print("2. Health Checks:")
services = [
    ("Domain Schema", "http://localhost:8083/health"),
    ("Backend", "http://localhost:8084/actuator/health"),
    ("AI Engine", "http://localhost:8087/health")
]

for name, url in services:
    stdout, stderr = run_curl(f'curl -s {url}')
    try:
        data = json.loads(stdout) if stdout else {}
        status = data.get('status', 'Unknown')
        print(f"   {name}: {status}")
    except:
        print(f"   {name}: Error - {stdout[:50]}")

# 3. Domain Schema API - GET projects
print("\n3. Domain Schema API - List Projects:")
stdout, stderr = run_curl('curl -s http://localhost:8083/api/projects')
try:
    data = json.loads(stdout) if stdout else {}
    if 'data' in data:
        print(f"   Total Projects: {len(data['data'])}")
        for project in data['data'][:3]:  # 처음 3개만
            print(f"   - {project.get('name', 'Unknown')}")
    else:
        print(f"   Response: {stdout[:100]}")
except:
    print(f"   Error: {stdout[:100]}")

# 4. Backend API Info
print("\n4. Backend Service Info:")
stdout, stderr = run_curl('curl -s http://localhost:8084/actuator/info')
print(f"   {stdout[:200] if stdout else 'No response'}")

# 5. AI Engine Version
print("\n5. AI Engine:")
stdout, stderr = run_curl('curl -s http://localhost:8087/api/v2/status')
print(f"   {stdout[:200] if stdout else 'No response'}")

print("\n=== Test Complete ===")