# Start Backend Service for GigaPress
Write-Host "Starting Backend Service for GigaPress..." -ForegroundColor Green

# Function to start service in new window
function Start-JavaService {
    param(
        [string]$ServiceName,
        [string]$Port,
        [string]$Directory
    )
    
    Write-Host "Starting $ServiceName (Port $Port)..." -ForegroundColor Yellow
    $processArgs = "/k", "cd /d `"$Directory`" && gradlew.bat bootRun"
    Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal
    Start-Sleep -Seconds 5
}

# Start Backend Service
Start-JavaService -ServiceName "Backend Service" -Port "8084" -Directory "C:\Users\ksw\Desktop\dev\gigapress-light\backend-service"

Write-Host "`nBackend service is starting..." -ForegroundColor Green
Write-Host "Service URL: http://localhost:8084/actuator/health" -ForegroundColor Gray
Write-Host "Swagger UI: http://localhost:8084/swagger-ui.html" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")