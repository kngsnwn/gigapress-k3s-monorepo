# Start Backend Service Clean
Write-Host "Starting Backend Service..." -ForegroundColor Green

$backendDir = "C:\Users\ksw\Desktop\dev\gigapress-light\backend-service"
$processArgs = "/k", "cd /d `"$backendDir`" && gradlew.bat bootRun"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "Backend Service starting on port 8084..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds to fully initialize..." -ForegroundColor Cyan

Start-Sleep -Seconds 15

Write-Host "Backend Service started! Check the terminal window for startup progress." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:8084" -ForegroundColor Gray
Write-Host "Swagger UI: http://localhost:8084/swagger-ui.html" -ForegroundColor Gray

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")