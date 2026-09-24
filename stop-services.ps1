Write-Host "Stopping Student Companion Microservices..." -ForegroundColor Yellow

docker-compose down

Write-Host "`nAll services stopped." -ForegroundColor Green
Write-Host "To remove all data (including database), run: docker-compose down -v" -ForegroundColor Cyan
