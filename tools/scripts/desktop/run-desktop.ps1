<#
.SYNOPSIS
    Selene Desktop Application Launcher (PowerShell)
.DESCRIPTION
    Performs toolchain diagnostics, verifies or starts the local Next.js server,
    monitors server readiness, and launches Selene inside a native desktop shell
    (Electron or Tauri v2). Ensures graceful server shutdown upon desktop exit.
.PARAMETER Engine
    Desktop engine to use: 'electron' (default, instant launch) or 'tauri' (Rust WebView2).
.PARAMETER Port
    Local development server port (Default: 3000).
.PARAMETER ForceRestart
    Force stop any existing process on port before launching.
.PARAMETER VerboseOutput
    Enable verbose diagnostic logging.
.EXAMPLE
    .\tools\scripts\desktop\run-desktop.ps1
    .\tools\scripts\desktop\run-desktop.ps1 -Engine tauri
    .\tools\scripts\desktop\run-desktop.ps1 -Engine electron -Port 3001
#>

[CmdletBinding()]
param (
    [ValidateSet("electron", "tauri")]
    [string]$Engine = "electron",
    [int]$Port = 3000,
    [switch]$ForceRestart,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"
$TotalTimer = [System.Diagnostics.Stopwatch]::StartNew()

# ------------------------------------------------------------------------------
# Locate Project Root and Read Metadata
# ------------------------------------------------------------------------------
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..\..\..")).Path
Set-Location $ProjectRoot

$PkgPath = Join-Path $ProjectRoot "package.json"
$AppVersion = "0.5.0"
if (Test-Path $PkgPath) {
    try {
        $pkgJson = Get-Content $PkgPath -Raw | ConvertFrom-Json
        $AppVersion = $pkgJson.version
    } catch {}
}

# Git Context
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
Write-Host "==================================================================" -ForegroundColor DarkCyan
Write-Host "  Selene - Native Desktop Shell Launcher (PowerShell)             " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor DarkCyan
Write-Host "  Application     : Selene Titan Edition (v$AppVersion)" -ForegroundColor White
Write-Host "  Working Dir     : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  Git Context     : $GitBranch ($GitCommit)$GitDirty" -ForegroundColor DarkGray
Write-Host "  Desktop Engine  : $Engine" -ForegroundColor Yellow
Write-Host "  Server Endpoint : http://localhost:$Port" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor DarkCyan

# ------------------------------------------------------------------------------
# 1. Environment & Toolchain Diagnostics
# ------------------------------------------------------------------------------
Write-StepHeader -Step "1/4" -Title "Checking Toolchain Requirements"

# Node.js
try {
    $nodeVer = (& node -v).Trim()
    Write-Success -Msg "Node.js runtime: $nodeVer"
} catch {
    Write-Fail -Msg "Node.js not detected in PATH!"
}

# npm
try {
    $npmVer = (& npm -v).Trim()
    Write-Success -Msg "npm package manager: v$npmVer"
} catch {
    Write-Fail -Msg "npm not detected in PATH!"
}

# Engine prerequisites
if ($Engine -eq "tauri") {
    try {
        $rustVer = (& rustc --version 2>&1).Trim()
        $cargoVer = (& cargo --version 2>&1).Trim()
        Write-Success -Msg "Rust compiler: $rustVer"
        Write-Success -Msg "Cargo manager: $cargoVer"
    } catch {
        Write-WarnMsg -Msg "Rust toolchain not found. Falling back to Electron desktop shell."
        $Engine = "electron"
    }
}

if ($Engine -eq "electron") {
    $electronPath = Join-Path $ProjectRoot "electron/main.js"
    if (Test-Path $electronPath) {
        Write-Success -Msg "Electron desktop shell detected at electron/main.js"
    } else {
        Write-Fail -Msg "Electron desktop entry point missing at $electronPath"
    }
}

# ------------------------------------------------------------------------------
# 2. Dependency Verification
# ------------------------------------------------------------------------------
Write-StepHeader -Step "2/4" -Title "Verifying Dependencies (node_modules)"
if (-not (Test-Path "node_modules")) {
    Write-Info -Msg "node_modules missing. Ingesting packages via npm install..."
    & npm install
    if ($LASTEXITCODE -ne 0) { Write-Fail -Msg "Dependency installation failed." }
    Write-Success -Msg "Dependencies installed successfully."
} else {
    Write-Success -Msg "Dependencies verified."
}

# ------------------------------------------------------------------------------
# 3. Local Next.js Server Lifecycle
# ------------------------------------------------------------------------------
Write-StepHeader -Step "3/4" -Title "Inspecting Local Server Availability (Port $Port)"

$serverRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $connect = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(800, $false)
    if ($wait -and $tcp.Connected) {
        $serverRunning = $true
        $tcp.EndConnect($connect)
    }
    $tcp.Close()
} catch {
    $serverRunning = $false
}

$serverProcess = $null

if ($serverRunning) {
    Write-Success -Msg "Local Selene server is already active on http://localhost:$Port"
} else {
    Write-Info -Msg "Starting Next.js Turbopack dev server in background on port $Port..."
    $serverProcess = Start-Process -FilePath "npx" -ArgumentList "next", "dev", "-p", "$Port" -PassThru -NoNewWindow
    Write-Info -Msg "Spawned Next.js dev server (PID: $($serverProcess.Id)). Waiting for HTTP readiness..."

    $attempts = 0
    while ($attempts -lt 30) {
        Start-Sleep -Seconds 1
        $attempts++
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $connect = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
            $wait = $connect.AsyncWaitHandle.WaitOne(600, $false)
            if ($wait -and $tcp.Connected) {
                $serverRunning = $true
                $tcp.EndConnect($connect)
                $tcp.Close()
                break
            }
            $tcp.Close()
        } catch {}
    }

    if ($serverRunning) {
        Write-Success -Msg "Local Next.js server is up and responsive on port $Port!"
    } else {
        Write-WarnMsg -Msg "Server took longer than expected. Desktop shell will retry automatically."
    }
}

# ------------------------------------------------------------------------------
# 4. Launch Desktop Shell
# ------------------------------------------------------------------------------
Write-StepHeader -Step "4/4" -Title "Launching Selene in Native $Engine Shell"
Write-Info -Msg "Opening Selene desktop window..."

try {
    if ($Engine -eq "electron") {
        & npx electron electron/main.js
    } else {
        & npx tauri dev
    }
} finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Write-Info -Msg "Shutting down background Next.js server (PID: $($serverProcess.Id))..."
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Success -Msg "Background server terminated cleanly."
    }
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor DarkCyan
    Write-Host "  [Selene Desktop Session Closed]                                 " -ForegroundColor DarkGray
    Write-Host "==================================================================" -ForegroundColor DarkCyan
    Write-Host ""
}
