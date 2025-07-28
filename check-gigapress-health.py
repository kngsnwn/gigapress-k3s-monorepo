#!/usr/bin/env python3
"""
GigaPress Health Check Script
실시간으로 서비스 상태를 모니터링합니다.
"""

import paramiko
import time
import requests
from datetime import datetime

# SSH 설정
HOST = "175.208.154.213"
PORT = 2222
USER = "ksw"
PASSWORD = "1009"

def ssh_command(command):
    """SSH 명령 실행"""
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD)
        stdin, stdout, stderr = ssh.exec_command(command)
        output = stdout.read().decode()
        ssh.close()
        return output
    except Exception as e:
        return f"Error: {e}"

def check_pods():
    """Pod 상태 확인"""
    output = ssh_command("sudo kubectl get pods -n gigapress -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,READY:.status.containerStatuses[0].ready,RESTARTS:.status.containerStatuses[0].restartCount")
    return output

def check_web_service():
    """웹 서비스 상태 확인"""
    try:
        response = requests.get(f"http://{HOST}:30082", timeout=5)
        return f"✅ 웹 서비스 정상 (HTTP {response.status_code})"
    except:
        return "❌ 웹 서비스 접속 실패"

def check_system_resources():
    """시스템 리소스 확인"""
    memory = ssh_command("free -h | grep Mem | awk '{print $2, $3, $4}'")
    disk = ssh_command("df -h /home | tail -1 | awk '{print $2, $3, $4}'")
    return f"Memory (Total Used Free): {memory.strip()}\nDisk (Total Used Free): {disk.strip()}"

def main():
    print("🚀 GigaPress Health Monitor")
    print("=" * 50)
    
    while True:
        print(f"\n⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 50)
        
        # Pod 상태
        print("\n📦 Pod 상태:")
        print(check_pods())
        
        # 웹 서비스
        print("\n🌐 웹 서비스:")
        print(check_web_service())
        
        # 시스템 리소스
        print("\n💻 시스템 리소스:")
        print(check_system_resources())
        
        # 문제가 있는 Pod 상세 정보
        problem_pods = ssh_command("sudo kubectl get pods -n gigapress | grep -E '(Error|CrashLoopBackOff|Pending)' | awk '{print $1}'").strip()
        if problem_pods:
            print("\n⚠️ 문제가 있는 Pod:")
            for pod in problem_pods.split('\n'):
                if pod:
                    print(f"\n- {pod}:")
                    logs = ssh_command(f"sudo kubectl logs {pod} -n gigapress --tail=5 2>&1")
                    print(logs[:200] + "..." if len(logs) > 200 else logs)
        
        print("\n" + "=" * 50)
        print("30초 후 다시 확인합니다... (Ctrl+C로 종료)")
        
        try:
            time.sleep(30)
        except KeyboardInterrupt:
            print("\n\n모니터링을 종료합니다.")
            break

if __name__ == "__main__":
    main()