# GigaPress Services Individual Startup Guide

## Prerequisites
1. **Infrastructure Services**: PostgreSQL, Redis, Kafka, Zookeeper, Neo4j (running via Docker)
2. **Java 17+** installed
3. **Node.js** installed
4. **Python 3.8+** installed

## Infrastructure Services (Docker)
```bash
cd C:\Users\ksw\Desktop\dev\gigapress-light
docker-compose up -d postgres redis kafka zookeeper neo4j
```

## Service Startup Order

### 1. Domain Schema Service (Port 8083)
```bash
cd C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service
# Windows Command Prompt
gradlew.bat bootRun

# Or if built:
java -jar build\libs\domain-schema-service-*.jar
```

### 2. Backend Service (Port 8084)
```bash
cd C:\Users\ksw\Desktop\dev\gigapress-light\backend-service
# Windows Command Prompt  
gradlew.bat bootRun

# Or if built:
java -jar build\libs\backend-service-*.jar
```

### 3. Conversational AI Engine (Port 8087)
```bash
cd C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine
# Install dependencies (first time only)
pip install python-socketio uvicorn

# Run the service
python run_socketio.py
```

### 4. Conversational Layer (Port 8080)
```bash
cd C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer
# Install dependencies (first time only)
npm install

# Run the service
npm run dev
```

## Automated Startup

### Option 1: PowerShell Script
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-all-services.ps1
```

### Option 2: Batch Script  
```cmd
start-services.bat
```

## Service Health Checks

- **Domain Schema Service**: http://localhost:8083/actuator/health
- **Backend Service**: http://localhost:8084/actuator/health
- **AI Engine**: http://localhost:8087 (Socket.IO endpoint)
- **Frontend**: http://localhost:8080

## Manual Service Start Commands

### Terminal 1: Domain Schema Service
```cmd
cd "C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service"
gradlew.bat bootRun
```

### Terminal 2: Backend Service
```cmd
cd "C:\Users\ksw\Desktop\dev\gigapress-light\backend-service"  
gradlew.bat bootRun
```

### Terminal 3: AI Engine
```cmd
cd "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"
python run_socketio.py
```

### Terminal 4: Frontend
```cmd
cd "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer"
npm run dev
```

## Troubleshooting

### Common Issues:
1. **Port conflicts**: Check if ports 8080, 8083, 8084, 8087 are free
2. **Database connection**: Ensure PostgreSQL container is running
3. **Java version**: Ensure Java 17+ is installed
4. **Node.js**: Ensure Node.js and npm are installed
5. **Python**: Ensure Python 3.8+ and required packages are installed

### Verify Infrastructure:
```bash
docker ps | findstr gigapress
```

Should show 5 running containers: postgres, redis, kafka, zookeeper, neo4j