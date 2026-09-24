Write-Host "Starting Student Companion Microservices..." -ForegroundColor Green

Write-Host "`nStopping any existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host "`nBuilding and starting all services..." -ForegroundColor Cyan
docker-compose up --build -d

Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nChecking service health..." -ForegroundColor Cyan

$services = @{
    "MongoDB" = "http://localhost:27017"
    "Auth Service" = "http://localhost:5001/health"
    "Profile Service" = "http://localhost:5002/health"
    "Expense Service" = "http://localhost:5003/health"
    "Feed Service" = "http://localhost:5006/health"
    "Frontend" = "http://localhost"
}

foreach ($service in $services.Keys) {
    $url = $services[$service]
    if ($service -eq "MongoDB") {
        $container = docker ps --filter "name=sc-mongodb" --format "{{.Names}}"
        if ($container) {
            Write-Host "✓ $service is running" -ForegroundColor Green
        } else {
            Write-Host "✗ $service is NOT running" -ForegroundColor Red
        }
    } else {
        try {
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            Write-Host "✓ $service is running" -ForegroundColor Green
        } catch {
            Write-Host "✗ $service is NOT responding at $url" -ForegroundColor Red
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Student Companion is Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAccess the application at:" -ForegroundColor White
Write-Host "  Frontend: http://localhost" -ForegroundColor Yellow
Write-Host "`nService URLs:" -ForegroundColor White
Write-Host "  Auth Service:    http://localhost:5001" -ForegroundColor Gray
Write-Host "  Profile Service: http://localhost:5002" -ForegroundColor Gray
Write-Host "  Expense Service: http://localhost:5003" -ForegroundColor Gray
Write-Host "  Feed Service:    http://localhost:5006" -ForegroundColor Gray
Write-Host "`nTo view logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "To stop: .\stop-services.ps1 or docker-compose down" -ForegroundColor Cyan
