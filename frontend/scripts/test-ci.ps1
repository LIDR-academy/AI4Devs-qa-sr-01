# CI Test Script for Frontend (PowerShell)
# This script simulates the CI environment locally

Write-Host "Starting CI Test Simulation..." -ForegroundColor Green

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
node --version
npm --version

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm ci

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "Running linting..." -ForegroundColor Yellow
npm run lint

# Check if linting passed
if ($LASTEXITCODE -eq 0) {
    Write-Host "Linting passed" -ForegroundColor Green
} else {
    Write-Host "Linting warnings (non-blocking)" -ForegroundColor Yellow
}

# Run build
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "CI Test Simulation completed successfully!" -ForegroundColor Green
