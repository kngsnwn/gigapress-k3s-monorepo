# Start Conversational AI Engine for GigaPress
Write-Host "Starting Conversational AI Engine..." -ForegroundColor Green

# Change to the conversational-ai-engine directory
$aiEngineDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-ai-engine"

Write-Host "Starting AI Engine (Port 8087)..." -ForegroundColor Yellow

# Start in new window
$processArgs = "/k", "cd /d `"$aiEngineDir`" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8087 --reload"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nConversational AI Engine is starting..." -ForegroundColor Green
Write-Host "Service URL: http://localhost:8087" -ForegroundColor Gray
Write-Host "API Docs: http://localhost:8087/docs" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")