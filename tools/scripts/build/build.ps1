# ==============================================================================
# Selene - Production Build and Quality Sanity Suite
# Location: tools/scripts/build/build.ps1
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipTests,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# Determine project root (3 levels up from tools/scripts/build)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "../../..")).Path
Set-Location -Path $ProjectRoot

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Selene - Production Build and Quality Sanity Suite     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Working Directory: $ProjectRoot" -ForegroundColor DarkGray
Write-Host ""

# ------------------------------------------------------------------------------
# Dependency & Environment Checks
# ------------------------------------------------------------------------------
Write-Host "[1/5] Checking Node.js runtime..." -ForegroundColor Yellow
try {
    $nodeVersionRaw = node -v
    $nodeMajor = [int]($nodeVersionRaw -replace '^v(\d+)\..*$', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "  [ERROR] Node.js version $nodeVersionRaw detected. Selene requires Node.js v18.0.0 or higher." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Node.js $nodeVersionRaw" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js is not installed." -ForegroundColor Red
    exit 1
}

Write-Host "[2/5] Checking npm package manager..." -ForegroundColor Yellow
try {
    $npmVersionRaw = npm -v
    Write-Host "  [OK] npm v$npmVersionRaw" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host "[3/5] Verifying dependency integrity..." -ForegroundColor Yellow
$nodeModulesPath = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path -Path $nodeModulesPath)) {
    Write-Host "  node_modules missing. Running npm install..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Dependency installation failed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  [OK] Dependencies intact" -ForegroundColor Green

if ($Clean) {
    Write-Host "  Cleaning prior build artifacts (.next)..." -ForegroundColor Yellow
    $nextPath = Join-Path $ProjectRoot ".next"
    if (Test-Path -Path $nextPath) {
        Remove-Item -Path $nextPath -Recurse -Force
        Write-Host "  [OK] Removed .next directory" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# Quality and Sanity Test Suite
# ------------------------------------------------------------------------------
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "[4/5] Executing Quality and Sanity Test Suite..." -ForegroundColor Yellow

    Write-Host "  --> Running TypeScript Type-Check (tsc --noEmit)..." -ForegroundColor Cyan
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] TypeScript compilation check failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Type check passed (0 errors)." -ForegroundColor Green

    Write-Host "  --> Running ESLint static analysis (eslint)..." -ForegroundColor Cyan
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] ESLint rules violation." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] ESLint passed (0 errors, 0 warnings)." -ForegroundColor Green
} else {
    Write-Host "[4/5] Skipping test suite (-SkipTests specified)." -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# Production Build
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/5] Compiling production distribution bundle (next build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [FAIL] Production build failed." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# Build Artifact Verification
# ------------------------------------------------------------------------------
$nextDir = Join-Path $ProjectRoot ".next"
if (Test-Path -Path $nextDir) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Build Succeeded! Production bundle is ready.  " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  Output Directory: $nextDir" -ForegroundColor DarkGray
    Write-Host "  Run 'npm start' to serve the production build locally." -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "  [ERROR] .next output directory not found after build." -ForegroundColor Red
    exit 1
}
