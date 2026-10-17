# ==============================================================================
# Selene - Development Server Launcher
# Location: tools/scripts/run/run.ps1
# ==============================================================================

[CmdletBinding()]
param(
    [int]$Port = 3000,
    [string]$HostName = "localhost"
)

$ErrorActionPreference = "Stop"

# Determine project root (3 levels up from tools/scripts/run)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "../../..")).Path
Set-Location -Path $ProjectRoot

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Selene - Modern Technical Document and Code Canvas     " -ForegroundColor Cyan
Write-Host "  Development Server Launcher                            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Working Directory: $ProjectRoot" -ForegroundColor DarkGray
Write-Host ""

# ------------------------------------------------------------------------------
# Dependency & Pre-flight Checks
# ------------------------------------------------------------------------------
Write-Host "[1/4] Checking Node.js environment..." -ForegroundColor Yellow
try {
    $nodeVersionRaw = node -v
    $nodeMajor = [int]($nodeVersionRaw -replace '^v(\d+)\..*$', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "  [ERROR] Node.js version $nodeVersionRaw detected. Selene requires Node.js v18.0.0 or higher." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Node.js $nodeVersionRaw" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "  Please install Node.js (v20+ recommended) from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Checking npm package manager..." -ForegroundColor Yellow
try {
    $npmVersionRaw = npm -v
    Write-Host "  [OK] npm v$npmVersionRaw" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Verifying project dependencies (node_modules)..." -ForegroundColor Yellow
$nodeModulesPath = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path -Path $nodeModulesPath)) {
    Write-Host "  node_modules not found. Installing dependencies automatically..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] npm install failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "  [OK] node_modules present" -ForegroundColor Green
}

Write-Host "[4/4] Checking local port status..." -ForegroundColor Yellow
try {
    $portActive = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($portActive) {
        Write-Host "  [NOTE] Port $Port is currently active. Next.js will negotiate port or use existing." -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] Port $Port is available" -ForegroundColor Green
    }
} catch {
    Write-Host "  [OK] Port check passed" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# Starting Development Server
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Launching Next.js Turbopack Development Server...       " -ForegroundColor Cyan
Write-Host "  Target URL: http://${HostName}:${Port}                  " -ForegroundColor Cyan
Write-Host "  Live Reload / HMR: ACTIVE                               " -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop the server                         " -ForegroundColor DarkGray
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

npm run dev -- -p $Port -H $HostName
