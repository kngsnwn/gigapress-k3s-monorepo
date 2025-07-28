# GigaPress Services Startup Script
Write-Host "Starting GigaPress Services..." -ForegroundColor Green

# Function to start service in new window
function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "Starting $Title..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$WorkingDirectory`" && $Command" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

# Check if infrastructure is running
Write-Host "Checking infrastructure services..." -ForegroundColor Cyan
$containers = docker ps --format "table {{.Names}}" | Select-String -Pattern "gigapress-"
if ($containers.Count -lt 5) {
    Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
    Set-Location "C:\Users\ksw\Desktop\dev\gigapress-light"
    docker-compose up -d postgres redis kafka zookeeper neo4j
    Start-Sleep -Seconds 10
}

# Start Domain Schema Service (Port 8083)
Start-ServiceWindow -Title "Domain Schema Service" -Command "java -Dspring.profiles.active=dev -jar build\libs\domain-schema-service-1.0.0.jar" -WorkingDirectory "C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service"

# Start Backend Service (Port 8084)  
Start-ServiceWindow -Title "Backend Service" -Command "java -Dspring.profiles.active=dev -jar build\libs\backend-service-1.0.0.jar" -WorkingDirectory "C:\Users\ksw\Desktop\dev\gigapress-light\backend-service"

# Start Conversational AI Engine (Port 8087)
Start-ServiceWindow -Title "AI Engine" -Command "python run_socketio.py" -WorkingDirectory "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"

# Start Conversational Layer (Port 8080)
Start-ServiceWindow -Title "Conversational Layer" -Command "npm run dev" -WorkingDirectory "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer"

Write-Host "All services are starting up..." -ForegroundColor Green
Write-Host "Services will be available at:" -ForegroundColor White
Write-Host "  - Domain Schema Service: http://localhost:8083" -ForegroundColor Gray
Write-Host "  - Backend Service: http://localhost:8084" -ForegroundColor Gray  
Write-Host "  - AI Engine: http://localhost:8087" -ForegroundColor Gray
Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")