# K3s 클러스터 설정 가이드

## Windows 환경 K3s 설치 방법

### 방법 1: Docker를 이용한 K3s 설치 (권장)

```bash
# K3s 서버 실행 (Docker 컨테이너)
docker run -d --name k3s-server \
  --privileged \
  --restart=unless-stopped \
  -p 6443:6443 \
  -p 80:80 \
  -p 443:443 \
  -v k3s-storage:/var/lib/rancher/k3s \
  rancher/k3s:latest \
  server --cluster-init

# 토큰 확인
docker exec k3s-server cat /var/lib/rancher/k3s/server/node-token

# kubeconfig 파일 가져오기
docker exec k3s-server cat /etc/rancher/k3s/k3s.yaml > ~/.kube/config
```

### 방법 2: WSL2 + K3s 설치

```bash
# WSL2에서 실행
curl -sfL https://get.k3s.io | sh -

# 서비스 시작
sudo systemctl start k3s

# 토큰 확인
sudo cat /var/lib/rancher/k3s/server/node-token

# kubeconfig 설정
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER ~/.kube/config
```

### 방법 3: 미니 PC용 K3s 설치

```bash
# 미니 PC에 직접 설치 (Ubuntu/Debian)
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# 서비스 상태 확인
sudo systemctl status k3s

# 설정 정보 확인
sudo cat /etc/rancher/k3s/k3s.yaml
```

## GitHub Secrets 설정값

설치 완료 후 다음 값들을 GitHub Secrets에 설정:

1. **K3S_SERVER**: `https://your-k3s-server:6443`
2. **K3S_TOKEN**: `/var/lib/rancher/k3s/server/node-token` 파일 내용
3. **K3S_KUBECONFIG**: `/etc/rancher/k3s/k3s.yaml` 파일 내용 (base64 인코딩)

### kubeconfig base64 인코딩 방법

```bash
# Linux/WSL
cat /etc/rancher/k3s/k3s.yaml | base64 -w 0

# macOS
cat /etc/rancher/k3s/k3s.yaml | base64

# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content k3s.yaml -Raw)))
```

## 네트워크 설정

### 포트 포워딩 (미니 PC 사용 시)
- 6443: Kubernetes API
- 80: HTTP 트래픽  
- 443: HTTPS 트래픽
- 30000-32767: NodePort 서비스 범위

### 방화벽 설정
```bash
# Ubuntu/Debian
sudo ufw allow 6443
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 30000:32767/tcp
```