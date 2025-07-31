# Start Frontend Service Clean
Write-Host "Starting Frontend Service..." -ForegroundColor Green

$frontendDir = "C:\Users\ksw\Desktop\dev\gigapress-light\conversational-layer"
$processArgs = "/k", "cd /d `"$frontendDir`" && npm run dev"
Start-Process -FilePath "cmd.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "Frontend Service starting on port 8080..." -ForegroundColor Yellow
Write-Host "This may take 10-20 seconds to compile..." -ForegroundColor Cyan

Start-Sleep -Seconds 10

Write-Host "Frontend Service started!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:8080" -ForegroundColor Gray

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")