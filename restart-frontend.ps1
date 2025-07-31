# Restart Frontend Service
Write-Host "Restarting Frontend Service..." -ForegroundColor Yellow

# Find and kill existing frontend process
$frontendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*conversational-layer*" -or 
    $_.CommandLine -like "*conversational-layer*"
}

if ($frontendProcesses) {
    Write-Host "Stopping existing frontend process..." -ForegroundColor Cyan
    $frontendProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start frontend again
Write-Host "Starting Frontend (Port 8080)..." -ForegroundColor Green
$frontendDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer"
$processArgs = "/k", "cd /d `"$frontendDir`" && npm run dev"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nFrontend service restarted!" -ForegroundColor Green
Write-Host "URL: http://localhost:8080" -ForegroundColor Gray
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")