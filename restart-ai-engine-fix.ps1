# Restart AI Engine Service with Fix
Write-Host "Restarting AI Engine Service with SocketIO fix..." -ForegroundColor Yellow

# Find and kill existing AI engine process
$aiProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*conversational-ai-engine*" -or 
    $_.CommandLine -like "*conversational-ai-engine*" -or
    $_.CommandLine -like "*uvicorn*8087*"
}

if ($aiProcesses) {
    Write-Host "Stopping existing AI engine process..." -ForegroundColor Cyan
    $aiProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start AI engine with the run_server.py script
Write-Host "Starting AI Engine (Port 8087) with SocketIO..." -ForegroundColor Green
$aiEngineDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"
$processArgs = "/k", "cd /d `"$aiEngineDir`" && python run_server.py"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nAI Engine service restarted with SocketIO support!" -ForegroundColor Green
Write-Host "Service URL: http://localhost:8087" -ForegroundColor Gray
Write-Host "SocketIO URL: http://localhost:8087/socket.io/" -ForegroundColor Gray
Write-Host "API Docs: http://localhost:8087/docs" -ForegroundColor Gray
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")