# Start Standalone SocketIO Server
Write-Host "Starting Standalone SocketIO Server..." -ForegroundColor Yellow

# Kill existing processes on port 8087
$port8087Processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*8087*" -or 
    $_.CommandLine -like "*uvicorn*" -or
    $_.MainWindowTitle -like "*8087*"
}

if ($port8087Processes) {
    Write-Host "Stopping existing processes on port 8087..." -ForegroundColor Cyan
    $port8087Processes | Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Start standalone SocketIO server
Write-Host "Starting Standalone SocketIO Server (Port 8087)..." -ForegroundColor Green
$aiEngineDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"
$processArgs = "/k", "cd /d `"$aiEngineDir`" && python standalone_socketio.py"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nStandalone SocketIO Server started!" -ForegroundColor Green
Write-Host "Service URL: http://localhost:8087" -ForegroundColor Gray
Write-Host "SocketIO URL: http://localhost:8087/socket.io/" -ForegroundColor Gray
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")