# Kill all Python processes and restart SocketIO
Write-Host "Killing all Python processes..." -ForegroundColor Red

# Kill all python processes
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "py" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start standalone SocketIO server
Write-Host "Starting Clean SocketIO Server..." -ForegroundColor Green
$aiEngineDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"
$processArgs = "/k", "cd /d `"$aiEngineDir`" && python standalone_socketio.py"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nClean SocketIO Server started!" -ForegroundColor Green
Write-Host "Waiting 10 seconds for server to fully initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "Testing server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8087/" -TimeoutSec 5
    Write-Host "Server Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Server not ready yet" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")