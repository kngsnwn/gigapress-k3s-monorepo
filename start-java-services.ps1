# Start Java Services for GigaPress
Write-Host "Starting Java Services for GigaPress..." -ForegroundColor Green

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

# Start Domain Schema Service
Start-JavaService -ServiceName "Domain Schema Service" -Port "8083" -Directory "C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service"

Write-Host "Waiting 15 seconds before starting next service..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Start Backend Service
Start-JavaService -ServiceName "Backend Service" -Port "8084" -Directory "C:\Users\ksw\Desktop\dev\gigapress-light\backend-service"

Write-Host "`nJava services are starting..." -ForegroundColor Green
Write-Host "Services:" -ForegroundColor White
Write-Host "  - Domain Schema Service: http://localhost:8083/actuator/health" -ForegroundColor Gray
Write-Host "  - Backend Service: http://localhost:8084/actuator/health" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")