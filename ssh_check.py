#!/usr/bin/env python3
import paramiko
import sys
import os

# SSH 설정
HOST = "175.208.154.213"
PORT = 2222
USER = "ksw"
PASSWORD = "1009"

def execute_command(command):
    """SSH로 명령어 실행"""
    try:
        # SSH 클라이언트 생성
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # 연결
        ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD)
        
        # 명령어 실행
        stdin, stdout, stderr = ssh.exec_command(command)
        
        # 결과 출력
        output = stdout.read().decode()
        error = stderr.read().decode()
        
        if output:
            print(output)
        if error:
            print(f"Error: {error}", file=sys.stderr)
        
        # 연결 종료
        ssh.close()
        
    except Exception as e:
        print(f"Connection error: {e}", file=sys.stderr)
        sys.exit(1)

def check_deployment_status():
    """배포 상태 확인"""
    print("=== Docker Images ===")
    execute_command("sudo docker images | grep -E '(domain-schema|backend-service|conversational)'")
    
    print("\n=== K3s Nodes ===")
    execute_command("sudo kubectl get nodes")
    
    print("\n=== K3s Pods ===")
    execute_command("sudo kubectl get pods --all-namespaces")
    
    print("\n=== System Resources ===")
    execute_command("free -h")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # 인자로 받은 명령어 실행
        command = " ".join(sys.argv[1:])
        execute_command(command)
    else:
        # 기본 배포 상태 확인
        check_deployment_status()