@echo off
echo Starting GigaPress Services Individually...

echo.
echo Starting Domain Schema Service (Port 8083)...
start "Domain Schema Service" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service && gradlew bootRun"

timeout /t 5

echo.
echo Starting Backend Service (Port 8084)...
start "Backend Service" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\backend-service && gradlew bootRun"

timeout /t 5

echo.
echo Starting Conversational AI Engine (Port 8087)...
start "AI Engine" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine && python run_socketio.py"

timeout /t 5

echo.
echo Starting Conversational Layer (Port 8080)...
start "Conversational Layer" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer && npm run dev"

echo.
echo All services are starting...
echo Check each window for startup status.
pause