# Start All GigaPress Services
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "    Starting All GigaPress Services        " -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Start Backend Service
Write-Host "`n[1/3] Starting Backend Service..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File start-backend-service.ps1 -WindowStyle Hidden
Start-Sleep -Seconds 10

# Start AI Engine
Write-Host "`n[2/3] Starting Conversational AI Engine..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File start-ai-engine.ps1 -WindowStyle Hidden
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "`n[3/3] Starting Conversational Layer (Frontend)..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File start-frontend.ps1 -WindowStyle Hidden

Write-Host "`n===========================================" -ForegroundColor Green
Write-Host "    All Services Started Successfully!     " -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor White
Write-Host "  - Frontend:        http://localhost:8080" -ForegroundColor Gray
Write-Host "  - AI Engine:       http://localhost:8087" -ForegroundColor Gray
Write-Host "  - Backend Service: http://localhost:8084" -ForegroundColor Gray
Write-Host "`nAPI Documentation:" -ForegroundColor White
Write-Host "  - AI Engine Docs:  http://localhost:8087/docs" -ForegroundColor Gray
Write-Host "  - Backend Swagger: http://localhost:8084/swagger-ui.html" -ForegroundColor Gray

Write-Host "`nNote: Infrastructure services (Redis, Kafka, PostgreSQL) should be running separately." -ForegroundColor Yellow
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")