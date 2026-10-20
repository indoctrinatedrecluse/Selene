# ==============================================================================
# Selene - Development Server Launcher (PowerShell)
# Location: tools/scripts/run/run.ps1
# ==============================================================================
# Performs pre-flight toolchain diagnostics, verifies port availability,
# displays local network access endpoints, and launches the Next.js
# Turbopack development server.
# ==============================================================================

[CmdletBinding()]
param(
    [int]$Port = 3000,
    [string]$HostName = "localhost",
    [switch]$Clean,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"

# ------------------------------------------------------------------------------
# Locate Project Root and Read Metadata
# ------------------------------------------------------------------------------
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "../../..")).Path
Set-Location -Path $ProjectRoot

$PkgPath = Join-Path $ProjectRoot "package.json"
$AppVersion = "0.4.0"
if (Test-Path $PkgPath) {
    try {
        $pkgJson = Get-Content $PkgPath -Raw | ConvertFrom-Json
        $AppVersion = $pkgJson.version
    } catch {}
}

# Git Metadata
$GitBranch = "unknown"
$GitCommit = "unknown"
$GitDirty = ""
try {
    $GitBranch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
    $GitCommit = (git rev-parse --short HEAD 2>$null).Trim()
    $statusOut = (git status --porcelain 2>$null)
    if ($statusOut) { $GitDirty = " [dirty working tree]" }
} catch {}

function Write-StepHeader {
    param([string]$Step, [string]$Title)
    Write-Host ""
    Write-Host "------------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  [$Step] $Title" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------------" -ForegroundColor DarkCyan
}

function Write-Success {
    param([string]$Msg)
    Write-Host "  [OK] $Msg" -ForegroundColor Green
}

function Write-WarnMsg {
    param([string]$Msg)
    Write-Host "  [WARN] $Msg" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Msg)
    Write-Host "  [FAIL] $Msg" -ForegroundColor Red
    exit 1
}

function Write-Info {
    param([string]$Msg)
    Write-Host "  [INFO] $Msg" -ForegroundColor Gray
}

Clear-Host
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Selene - Hypermodern Technical Canvas Development Server       " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Application    : Selene Titan Edition (v$AppVersion)" -ForegroundColor White
Write-Host "  Working Dir    : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  Git Context    : $GitBranch ($GitCommit)$GitDirty" -ForegroundColor DarkGray
Write-Host "  Target Host    : $HostName" -ForegroundColor Yellow
Write-Host "  Target Port    : $Port" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Environment Diagnostics
# ------------------------------------------------------------------------------
Write-StepHeader -Step "1/4" -Title "Checking Node.js and Package Manager"

# Node.js
try {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    $nodeVersionRaw = (node -v).Trim()
    $nodeMajor = [int]($nodeVersionRaw -replace '^v(\d+)\..*$', '$1')
    if ($nodeMajor -lt 18) {
        Write-Fail -Msg "Node.js $nodeVersionRaw detected. Selene requires Node.js v18.0.0 or higher."
    }
    Write-Success -Msg "Node.js Runtime : $nodeVersionRaw ($nodePath)"
} catch {
    Write-Fail -Msg "Node.js is not installed or not discoverable in PATH."
}

# npm
try {
    $npmPath = (Get-Command npm -ErrorAction Stop).Source
    $npmVersionRaw = (npm -v).Trim()
    Write-Success -Msg "npm Manager     : v$npmVersionRaw ($npmPath)"
} catch {
    Write-Fail -Msg "npm package manager is not installed or not discoverable in PATH."
}

# ------------------------------------------------------------------------------
# 2. Dependency Verification
# ------------------------------------------------------------------------------
Write-StepHeader -Step "2/4" -Title "Verifying Project Dependencies (node_modules)"
$nodeModulesPath = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path -Path $nodeModulesPath)) {
    Write-Info -Msg "node_modules missing. Ingesting packages via npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Fail -Msg "Automatic dependency installation failed."
    }
    Write-Success -Msg "Dependencies installed successfully."
} else {
    $moduleCount = (Get-ChildItem -Path $nodeModulesPath -Directory).Count
    Write-Success -Msg "node_modules verified ($moduleCount packages installed)"
}

if ($Clean) {
    $nextPath = Join-Path $ProjectRoot ".next"
    if (Test-Path $nextPath) {
        Write-Info -Msg "Purging .next cache for clean development start..."
        Remove-Item -Path $nextPath -Recurse -Force
        Write-Success -Msg "Cleaned .next development cache"
    }
}

# ------------------------------------------------------------------------------
# 3. Port Availability Inspection
# ------------------------------------------------------------------------------
Write-StepHeader -Step "3/4" -Title "Inspecting Port $Port Availability"
try {
    $portActive = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($portActive) {
        $occupyingPid = ($portActive | Select-Object -First 1).OwningProcess
        Write-WarnMsg -Msg "Port $Port is currently active (Owning PID: $occupyingPid). Next.js will auto-negotiate or bind."
    } else {
        Write-Success -Msg "Port $Port is available for immediate binding"
    }
} catch {
    Write-Success -Msg "Port check completed"
}

# ------------------------------------------------------------------------------
# 4. Local Network Discovery & Launch
# ------------------------------------------------------------------------------
Write-StepHeader -Step "4/4" -Title "Resolving Local Endpoints & Launching Server"

$ipAddresses = @("127.0.0.1")
try {
    $localIps = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
        Where-Object { $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -ne '127.0.0.1' } | 
        ForEach-Object { $_.IPAddressToString }
    if ($localIps) { $ipAddresses += $localIps }
} catch {}

Write-Host ""
Write-Host "  Available Access URLs:" -ForegroundColor White
Write-Host "    > Localhost      : http://${HostName}:${Port}" -ForegroundColor Green
foreach ($ip in $localIps) {
    Write-Host "    > Network (LAN)  : http://${ip}:${Port}" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  🚀 Launching Next.js Turbopack Development Server...            " -ForegroundColor Cyan
Write-Host "  Fast Refresh / HMR : ACTIVE                                     " -ForegroundColor Green
Write-Host "  Press Ctrl+C to terminate the development server                " -ForegroundColor DarkGray
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

npm run dev -- -p $Port -H $HostName
