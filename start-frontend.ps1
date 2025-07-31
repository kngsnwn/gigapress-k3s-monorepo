# Start Conversational Layer (Frontend) for GigaPress
Write-Host "Starting Conversational Layer (Frontend)..." -ForegroundColor Green

# Change to the conversational-layer directory
$frontendDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer"

Write-Host "Starting Frontend (Port 8080)..." -ForegroundColor Yellow

# Start in new window
$processArgs = "/k", "cd /d `"$frontendDir`" && npm run dev"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "`nConversational Layer is starting..." -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:8080" -ForegroundColor Gray

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")