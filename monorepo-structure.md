# 모노레포 구조

```
project-root/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── services/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── k8s/
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── k8s/
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   └── database/
│       ├── Dockerfile
│       └── k8s/
│           ├── deployment.yaml
│           └── service.yaml
├── scripts/
│   ├── detect-changes.sh
│   └── deploy-service.sh
└── .changeset/
    └── config.json
```