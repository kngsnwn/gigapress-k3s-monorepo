# PowerShell script for Windows service control
param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [Parameter(Mandatory=$true)]
    [string]$Mode
)

$basePath = "C:\Users\ksw\Desktop\dev\gigapress\services"

# Service configurations
$services = @{
    "beginner" = @(
        @{name="conversational-ai-engine"; port=8087; type="python"; path="$basePath\conversational-ai-engine"},
        @{name="mcp-server"; port=8082; type="java"; path="$basePath\mcp-server"},
        @{name="domain-schema-service"; port=8083; type="java"; path="$basePath\domain-schema-service"},
        @{name="backend-service"; port=8084; type="java"; path="$basePath\backend-service"}
    )
    "expert" = @(
        @{name="conversational-ai-engine"; port=8087; type="python"; path="$basePath\conversational-ai-engine"},
        @{name="mcp-server"; port=8082; type="java"; path="$basePath\mcp-server"},
        @{name="domain-schema-service"; port=8083; type="java"; path="$basePath\domain-schema-service"},
        @{name="backend-service"; port=8084; type="java"; path="$basePath\backend-service"},
        @{name="design-frontend-service"; port=8085; type="node"; path="$basePath\design-frontend-service"},
        @{name="infra-version-control-service"; port=8086; type="python"; path="$basePath\infra-version-control-service"},
        @{name="dynamic-update-engine"; port=8081; type="java"; path="$basePath\dynamic-update-engine"}
    )
}

function Start-Service {
    param($service)
    
    Write-Host "Starting $($service.name) on port $($service.port)..." -ForegroundColor Green
    
    switch ($service.type) {
        "python" {
            Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory $service.path -WindowStyle Hidden
        }
        "java" {
            Start-Process -FilePath "cmd" -ArgumentList "/c", "gradlew.bat bootRun" -WorkingDirectory $service.path -WindowStyle Hidden
        }
        "node" {
            Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $service.path -WindowStyle Hidden
        }
    }
}

function Stop-Service {
    param($port)
    
    Write-Host "Stopping service on port $port..." -ForegroundColor Yellow
    
    # Find process using the port
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

function Check-Service {
    param($port)
    
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Main execution
if ($Action -eq "start") {
    Write-Host "Starting services in $Mode mode..." -ForegroundColor Cyan
    
    foreach ($service in $services[$Mode]) {
        if (-not (Check-Service -port $service.port)) {
            Start-Service -service $service
            Start-Sleep -Seconds 2
        } else {
            Write-Host "$($service.name) is already running" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nAll services started!" -ForegroundColor Green
}
elseif ($Action -eq "stop") {
    Write-Host "Stopping services in $Mode mode..." -ForegroundColor Cyan
    
    foreach ($service in $services[$Mode]) {
        if (Check-Service -port $service.port) {
            Stop-Service -port $service.port
        }
    }
    
    Write-Host "`nAll services stopped!" -ForegroundColor Green
}
elseif ($Action -eq "status") {
    Write-Host "Checking service status..." -ForegroundColor Cyan
    
    foreach ($service in $services[$Mode]) {
        $status = if (Check-Service -port $service.port) { "Running" } else { "Stopped" }
        $color = if ($status -eq "Running") { "Green" } else { "Red" }
        Write-Host "$($service.name) (port $($service.port)): $status" -ForegroundColor $color
    }
}

# Usage examples:
# .\service-control.ps1 -Action start -Mode beginner
# .\service-control.ps1 -Action stop -Mode expert
# .\service-control.ps1 -Action status -Mode beginner