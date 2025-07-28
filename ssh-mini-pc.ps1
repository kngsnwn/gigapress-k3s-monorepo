# PowerShell script to SSH to mini PC with password
$password = "1009"
$host = "175.208.154.213"
$port = "2222"
$user = "ksw"

# Install plink if not available
if (!(Test-Path "C:\plink.exe")) {
    Write-Host "Downloading plink..."
    Invoke-WebRequest -Uri "https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe" -OutFile "C:\plink.exe"
}

# Execute command using plink
$command = $args[0]
if ($command) {
    & C:\plink.exe -P $port -pw $password $user@$host $command
} else {
    Write-Host "Usage: .\ssh-mini-pc.ps1 'command'"
}