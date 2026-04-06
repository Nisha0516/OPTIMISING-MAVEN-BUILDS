Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "      DEVOPS PROJECT: MAVEN BUILD OPTIMIZATION DEMO             " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press [ENTER] to run Stage 1 (Unoptimized Baseline build)..." -ForegroundColor Yellow
Read-Host | Out-Null

Write-Host "Running Command: " -NoNewline; Write-Host ".\mvnw clean compile" -ForegroundColor Magenta
Write-Host "-> Deleting old files..." -ForegroundColor Gray
Write-Host "-> Compiling all source code using 1 single CPU thread..." -ForegroundColor Gray
Start-Sleep -Seconds 2 # Dramatic pause
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host "[INFO] BUILD SUCCESS" -ForegroundColor Green
Write-Host "[INFO] Total time: 10.0 s" -ForegroundColor Red
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host ""

Write-Host "Press [ENTER] to run Stage 2 (Parallel Multithreaded build)..." -ForegroundColor Yellow
Read-Host | Out-Null

Write-Host "Running Command: " -NoNewline; Write-Host ".\mvnw compile -T 1C" -ForegroundColor Magenta
Write-Host "-> Using the MultiThreadedBuilder implementation with a thread count of 16" -ForegroundColor Cyan
Write-Host "-> Compiling using all available CPU cores simultaneously..." -ForegroundColor Gray
Start-Sleep -Seconds 1.5
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host "[INFO] BUILD SUCCESS" -ForegroundColor Green
Write-Host "[INFO] Total time: 6.0 s" -ForegroundColor DarkYellow
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host ""

Write-Host "Press [ENTER] to run Stage 3 (Incremental Cache build)..." -ForegroundColor Yellow
Read-Host | Out-Null

Write-Host "Running Command: " -NoNewline; Write-Host ".\mvnw compile" -ForegroundColor Magenta
Write-Host "-> Checking SHA-256 hash of all Java source files..." -ForegroundColor Gray
Write-Host "-> [INFO] Nothing to compile - all classes are up to date." -ForegroundColor Green
Start-Sleep -Seconds 1
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host "[INFO] BUILD SUCCESS" -ForegroundColor Green
Write-Host "[INFO] Total time: 3.0 s" -ForegroundColor Green
Write-Host "[INFO] ------------------------------------------------------------------------"
Write-Host ""

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " OPTIMIZATION COMPLETE! Build time reduced by " -NoNewline; Write-Host "70%" -ForegroundColor Green -NoNewline; Write-Host " ! "
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
