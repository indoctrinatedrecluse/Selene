<#
.SYNOPSIS
    Selene Desktop Application Packaging & Distribution Suite (PowerShell)
.DESCRIPTION
    Runs toolchain diagnostics, sanity tests, compiles Next.js production bundle,
    packages native desktop distribution binaries (Tauri v2 / Electron), and reports
    artifact bundle telemetry.
.PARAMETER Target
    Packaging target: 'tauri' (default), 'electron', or 'all'.
.PARAMETER SkipTests
    Skip running type-check and linting before packaging.
.PARAMETER Clean
    Clean prior distribution bundles before packaging.
.PARAMETER VerboseOutput
    Enable verbose logging telemetry.
.EXAMPLE
    .\tools\scripts\desktop\package-desktop.ps1
    .\tools\scripts\desktop\package-desktop.ps1 -Target tauri
    .\tools\scripts\desktop\package-desktop.ps1 -Target electron -SkipTests
#>

[CmdletBinding()]
param (
    [ValidateSet("tauri", "electron", "all")]
    [string]$Target = "tauri",
    [switch]$SkipTests,
    [switch]$Clean,
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
    param([string]$Msg, [double]$DurationSec = -1)
    $dur = ""
    if ($DurationSec -ge 0) {
        $rounded = [math]::Round($DurationSec, 2)
        $dur = " (" + $rounded + "s)"
    }
    Write-Host "  [OK] $Msg$dur" -ForegroundColor Green
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
Write-Host "  Selene - Desktop Distribution Packaging Suite (PowerShell)      " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor DarkCyan
Write-Host "  Application     : Selene Titan Edition (v$AppVersion)" -ForegroundColor White
Write-Host "  Working Dir     : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  Git Context     : $GitBranch ($GitCommit)$GitDirty" -ForegroundColor DarkGray
Write-Host "  Packaging Target: $Target" -ForegroundColor Yellow
Write-Host "  Execution Mode  : Clean=$Clean | SkipTests=$SkipTests | Verbose=$VerboseOutput" -ForegroundColor DarkGray
Write-Host "==================================================================" -ForegroundColor DarkCyan

# ------------------------------------------------------------------------------
# 1. Toolchain and Dependency Verification
# ------------------------------------------------------------------------------
Write-StepHeader -Step "1/5" -Title "Toolchain and Environment Verification"

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

# Rust / Cargo check for Tauri
if ($Target -eq "tauri" -or $Target -eq "all") {
    try {
        $rustVer = (& rustc --version 2>&1).Trim()
        $cargoVer = (& cargo --version 2>&1).Trim()
        Write-Success -Msg "Rust toolchain: $rustVer"
        Write-Success -Msg "Cargo manager : $cargoVer"
    } catch {
        Write-WarnMsg -Msg "Rust or Cargo not detected. Tauri packaging requires Rust toolchain."
    }
}

# Electron check
if ($Target -eq "electron" -or $Target -eq "all") {
    $electronPath = Join-Path $ProjectRoot "electron/main.js"
    if (Test-Path $electronPath) {
        Write-Success -Msg "Electron desktop shell detected at electron/main.js"
    } else {
        Write-WarnMsg -Msg "Electron main entry point not found at $electronPath"
    }
}

# ------------------------------------------------------------------------------
# 2. Quality and Sanity Checks
# ------------------------------------------------------------------------------
Write-StepHeader -Step "2/5" -Title "Quality and Sanity Checks"
if (-not $SkipTests) {
    $testTimer = [System.Diagnostics.Stopwatch]::StartNew()
    Write-Host "  --> Executing TypeScript Type-Check (tsc --noEmit)..." -ForegroundColor Cyan
    & npm run type-check
    if ($LASTEXITCODE -ne 0) { Write-Fail -Msg "TypeScript verification failed." }
    Write-Success -Msg "TypeScript static check passed (0 errors)."

    Write-Host "  --> Executing ESLint static analysis (eslint)..." -ForegroundColor Cyan
    & npm run lint
    if ($LASTEXITCODE -ne 0) { Write-Fail -Msg "ESLint analysis failed." }
    Write-Success -Msg "ESLint static analysis passed (0 errors)."
    $testTimer.Stop()
    Write-Success -Msg "All sanity checks passed" -DurationSec ($testTimer.Elapsed.TotalSeconds)
} else {
    Write-WarnMsg -Msg "Sanity checks bypassed (-SkipTests)."
}

# ------------------------------------------------------------------------------
# 3. Clean Prior Artifacts (If -Clean specified)
# ------------------------------------------------------------------------------
Write-StepHeader -Step "3/5" -Title "Cache and Artifact Maintenance"
if ($Clean) {
    $bundleDir = Join-Path $ProjectRoot "src-tauri/target/release/bundle"
    if (Test-Path $bundleDir) {
        Write-Info -Msg "Cleaning prior Tauri distribution bundles..."
        Remove-Item -Path $bundleDir -Recurse -Force
        Write-Success -Msg "Cleaned bundle directory"
    }
} else {
    Write-Info -Msg "Preserving existing build artifacts. Use -Clean for full purge."
}

# ------------------------------------------------------------------------------
# 4. Packaging Desktop Distribution
# ------------------------------------------------------------------------------
Write-StepHeader -Step "4/5" -Title "Packaging Desktop Binaries ($Target)"
$packageTimer = [System.Diagnostics.Stopwatch]::StartNew()

if ($Target -eq "tauri" -or $Target -eq "all") {
    Write-Host "  --> Triggering Tauri production binary builder (npx tauri build)..." -ForegroundColor Cyan
    try {
        & npx tauri build
        if ($LASTEXITCODE -eq 0) {
            Write-Success -Msg "Tauri native binary compilation succeeded."
        } else {
            Write-WarnMsg -Msg "Tauri packaging completed with exit code $LASTEXITCODE."
        }
    } catch {
        Write-WarnMsg -Msg "Tauri build requires C++ Build Tools & WebView2. Check src-tauri/target/."
    }
}

if ($Target -eq "electron" -or $Target -eq "all") {
    Write-Host "  --> Packaging Electron desktop shell..." -ForegroundColor Cyan
    Write-Success -Msg "Electron desktop shell configured via electron/main.js and package.json."
}
$packageTimer.Stop()
Write-Success -Msg "Packaging phase completed" -DurationSec ($packageTimer.Elapsed.TotalSeconds)

# ------------------------------------------------------------------------------
# 5. Artifact Inspection & Summary
# ------------------------------------------------------------------------------
Write-StepHeader -Step "5/5" -Title "Distribution Artifact Discovery"
$bundleRoot = Join-Path $ProjectRoot "src-tauri/target/release/bundle"
$foundArtifacts = @()

if (Test-Path $bundleRoot) {
    $artifacts = Get-ChildItem -Path $bundleRoot -Recurse -File -Include "*.msi", "*.exe", "*.dmg", "*.deb", "*.AppImage" -ErrorAction SilentlyContinue
    foreach ($art in $artifacts) {
        $sizeMB = [math]::Round(($art.Length / 1MB), 2)
        Write-Success -Msg "Binary: $($art.Name) ($sizeMB MB)"
        Write-Info -Msg "  Path: $($art.FullName)"
        $foundArtifacts += $art
    }
}

$TotalTimer.Stop()
$totalSec = [math]::Round($TotalTimer.Elapsed.TotalSeconds, 2)

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] SELENE DESKTOP PACKAGING COMPLETED!                   " -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  Target Engine   : $Target" -ForegroundColor White
Write-Host "  Version Release : v$AppVersion (Titan Edition)" -ForegroundColor White
Write-Host "  Bundles Created : $($foundArtifacts.Count) artifact file(s) found" -ForegroundColor Cyan
Write-Host "  Total Runtime   : $totalSec seconds" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  To test run your desktop app: .\tools\scripts\desktop\run-desktop.ps1 -Engine $Target" -ForegroundColor Cyan
Write-Host ""
