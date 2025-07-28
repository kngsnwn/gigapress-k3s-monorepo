@echo off
echo Starting Java Services for GigaPress...

echo.
echo [1/2] Starting Domain Schema Service (Port 8083)...
start "Domain Schema Service" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service && gradlew.bat bootRun"

echo Waiting 10 seconds before starting next service...
timeout /t 10

echo.
echo [2/2] Starting Backend Service (Port 8084)...
start "Backend Service" cmd /k "cd /d C:\Users\ksw\Desktop\dev\gigapress-light\backend-service && gradlew.bat bootRun"

echo.
echo Java services are starting...
echo - Domain Schema Service: http://localhost:8083
echo - Backend Service: http://localhost:8084
echo.
echo Check the opened windows for startup logs.
pause