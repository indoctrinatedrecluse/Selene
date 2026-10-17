<#
.SYNOPSIS
    Selene Desktop Application Launcher (PowerShell)
.DESCRIPTION
    Performs dependency checks, verifies or boots the local Next.js server,
    and launches Selene inside a native desktop shell (Electron or Tauri v2).
.PARAMETER Engine
    Desktop engine to use: 'electron' (default, instant launch) or 'tauri' (Rust WebView2).
.EXAMPLE
    .\tools\scripts\desktop\run-desktop.ps1
    .\tools\scripts\desktop\run-desktop.ps1 -Engine tauri
#>

[CmdletBinding()]
param (
    [ValidateSet("electron", "tauri")]
    [string]$Engine = "electron"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Text)
    Write-Host "`n--> $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "  [*] $Text" -ForegroundColor Gray
}

function Write-WarningMsg {
    param([string]$Text)
    Write-Host "  [WARN] $Text" -ForegroundColor Yellow
}

# 1. Resolve Project Root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..\..")
Set-Location $ProjectRoot

Clear-Host
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  🌙 Selene — Native Desktop Shell Launcher               " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  Working Directory: $ProjectRoot" -ForegroundColor Gray
Write-Host "  Selected Desktop Engine: $Engine" -ForegroundColor Yellow

# 2. Check Node.js and npm
Write-Step "Checking Node.js & Toolchain Requirements..."
try {
    $nodeVer = & node -v
    Write-Success "Node.js runtime: $nodeVer"
} catch {
    Write-Host "  [FAIL] Node.js not detected in PATH!" -ForegroundColor Red
    exit 1
}

if ($Engine -eq "tauri") {
    try {
        $rustVer = & rustc --version
        $cargoVer = & cargo --version
        Write-Success "Rust compiler: $rustVer"
        Write-Success "Cargo: $cargoVer"
    } catch {
        Write-WarningMsg "Rust toolchain not found. Falling back to Electron desktop shell."
        $Engine = "electron"
    }
}

# 3. Check dependencies
Write-Step "Checking node_modules dependencies..."
if (-not (Test-Path "node_modules")) {
    Write-Info "Installing dependencies via npm install..."
    & npm install
}
Write-Success "Dependencies verified."

# 4. Check if Next.js server is already running on port 3000
Write-Step "Checking local Selene server availability..."
$port = 3000
$serverRunning = $false

try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $connect = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
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
    Write-Success "Next.js dev server is already running on http://localhost:$port"
} else {
    Write-Info "Starting Next.js dev server in background on port $port..."
    $serverProcess = Start-Process -FilePath "npx" -ArgumentList "next", "dev" -PassThru -NoNewWindow
    Write-Info "Waiting for server to accept connections on port $port..."

    $attempts = 0
    while ($attempts -lt 25) {
        Start-Sleep -Seconds 1
        $attempts++
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $connect = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
            $wait = $connect.AsyncWaitHandle.WaitOne(500, $false)
            if ($wait -and $tcp.Connected) {
                $serverRunning = $true
                $tcp.EndConnect($connect)
                $tcp.Close()
                break
            }
            $tcp.Close()
        } catch {
            # continue waiting
        }
    }

    if ($serverRunning) {
        Write-Success "Local Next.js server is up and responsive!"
    } else {
        Write-WarningMsg "Server didn't respond immediately. Desktop shell will retry connecting automatically."
    }
}

# 5. Launch the desktop application
Write-Step "Launching Selene in native $Engine shell..."
try {
    if ($Engine -eq "electron") {
        & npx electron electron/main.js
    } else {
        & npx tauri dev
    }
} finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Write-Info "Shutting down background Next.js server (PID: $($serverProcess.Id))..."
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "`n[Selene Desktop Session Closed]`n" -ForegroundColor Gray
}
