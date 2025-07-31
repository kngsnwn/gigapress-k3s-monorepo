# Start SocketIO Server Clean
Write-Host "Starting SocketIO Server..." -ForegroundColor Green

$aiEngineDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"
$processArgs = "/k", "cd /d `"$aiEngineDir`" && python standalone_socketio.py"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "SocketIO Server starting on port 8087..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8087/" -TimeoutSec 10
    Write-Host "✅ SocketIO Server Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ SocketIO Server not ready yet" -ForegroundColor Yellow
}

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")