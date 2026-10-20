# ==============================================================================
# Selene - Production Build and Quality Sanity Suite (PowerShell)
# Location: tools/scripts/build/build.ps1
# ==============================================================================
# Executes environment diagnostics, type-checks, ESLint static analysis,
# cleans prior build caches, compiles production Next.js assets, and reports
# build artifact telemetry.
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipTests,
    [switch]$SkipTypeCheck,
    [switch]$SkipLint,
    [switch]$Clean,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"
$TotalTimer = [System.Diagnostics.Stopwatch]::StartNew()

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

# System Specs
$OSInfo = [System.Environment]::OSVersion.VersionString
$Arch = [System.Environment]::GetEnvironmentVariable("PROCESSOR_ARCHITECTURE")
$HostName = [System.Environment]::MachineName

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Selene - Production Build and Quality Sanity Suite              " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Application    : Selene Titan Edition (v$AppVersion)" -ForegroundColor White
Write-Host "  Working Dir    : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  Host Machine   : $HostName ($OSInfo - $Arch)" -ForegroundColor DarkGray
Write-Host "  Git Context    : $GitBranch ($GitCommit)$GitDirty" -ForegroundColor DarkGray
Write-Host "  Execution Mode : Clean=$Clean | SkipTests=$SkipTests | Verbose=$VerboseOutput" -ForegroundColor DarkGray
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

function Write-Phase {
    param([string]$Step, [string]$Title)
    Write-Host "------------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  [$Step] $Title" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------------" -ForegroundColor DarkCyan
}

function Write-Success {
    param([string]$Msg, [double]$DurationSec = -1)
    $durStr = ""
    if ($DurationSec -ge 0) {
        $rounded = [math]::Round($DurationSec, 2)
        $durStr = " (" + $rounded + "s)"
    }
    Write-Host "  [OK] $Msg$durStr" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Msg)
    Write-Host "  [FAIL] $Msg" -ForegroundColor Red
}

function Write-Info {
    param([string]$Msg)
    Write-Host "  [INFO] $Msg" -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# Phase 1: Environment and Toolchain Diagnostics
# ------------------------------------------------------------------------------
$Phase1Timer = [System.Diagnostics.Stopwatch]::StartNew()
Write-Phase -Step "1/5" -Title "Environment and Toolchain Diagnostics"

# 1.1 Node.js
try {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    $nodeVersionRaw = (node -v).Trim()
    $nodeMajor = [int]($nodeVersionRaw -replace '^v(\d+)\..*$', '$1')
    if ($nodeMajor -lt 18) {
        Write-Failure -Msg "Node.js $nodeVersionRaw detected. Selene requires Node.js v18.0.0 or higher."
        exit 1
    }
    Write-Success -Msg "Node.js Runtime : $nodeVersionRaw ($nodePath)"
} catch {
    Write-Failure -Msg "Node.js is not installed or not discoverable in PATH."
    exit 1
}

# 1.2 npm
try {
    $npmPath = (Get-Command npm -ErrorAction Stop).Source
    $npmVersionRaw = (npm -v).Trim()
    Write-Success -Msg "npm Manager     : v$npmVersionRaw ($npmPath)"
} catch {
    Write-Failure -Msg "npm package manager is not installed or not discoverable in PATH."
    exit 1
}

# 1.3 Dependencies
$nodeModulesPath = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path -Path $nodeModulesPath)) {
    Write-Host "  node_modules missing. Ingesting packages via npm install..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Failure -Msg "Automatic dependency installation failed."
        exit 1
    }
    Write-Success -Msg "node_modules created and installed"
} else {
    $moduleCount = (Get-ChildItem -Path $nodeModulesPath -Directory).Count
    Write-Success -Msg "node_modules verified ($moduleCount packages installed)"
}
$Phase1Timer.Stop()

# ------------------------------------------------------------------------------
# Phase 2: Build Cache and Clean Sweep
# ------------------------------------------------------------------------------
$Phase2Timer = [System.Diagnostics.Stopwatch]::StartNew()
Write-Phase -Step "2/5" -Title "Build Cache and Clean Sweep"

$nextPath = Join-Path $ProjectRoot ".next"
if ($Clean) {
    if (Test-Path -Path $nextPath) {
        Write-Info -Msg "Purging prior Next.js build cache (.next)..."
        Remove-Item -Path $nextPath -Recurse -Force
        Write-Success -Msg "Removed previous .next distribution directory"
    } else {
        Write-Success -Msg "Clean sweep skipped (no prior .next folder existed)"
    }
} else {
    if (Test-Path -Path $nextPath) {
        Write-Info -Msg "Incremental build cache active (.next preserved for speed). Use -Clean for full wipe."
    } else {
        Write-Info -Msg "Fresh build workspace detected (no existing .next directory)."
    }
}
$Phase2Timer.Stop()

# ------------------------------------------------------------------------------
# Phase 3: Quality and Static Sanity Suite
# ------------------------------------------------------------------------------
$Phase3Timer = [System.Diagnostics.Stopwatch]::StartNew()
Write-Phase -Step "3/5" -Title "Quality and Static Sanity Suite"

if (-not $SkipTests) {
    # 3.1 TypeScript Type-Check
    if (-not $SkipTypeCheck) {
        $typeTimer = [System.Diagnostics.Stopwatch]::StartNew()
        Write-Host "  --> Executing TypeScript Type-Check (tsc --noEmit)..." -ForegroundColor Cyan
        npm run type-check
        $typeTimer.Stop()
        if ($LASTEXITCODE -ne 0) {
            Write-Failure -Msg "TypeScript compilation sanity check failed."
            exit 1
        }
        Write-Success -Msg "TypeScript strict type verification passed (0 errors)" -DurationSec ($typeTimer.Elapsed.TotalSeconds)
    } else {
        Write-Info -Msg "TypeScript type-check bypassed (-SkipTypeCheck)."
    }

    # 3.2 ESLint
    if (-not $SkipLint) {
        $lintTimer = [System.Diagnostics.Stopwatch]::StartNew()
        Write-Host "  --> Executing ESLint Static Analysis (eslint)..." -ForegroundColor Cyan
        npm run lint
        $lintTimer.Stop()
        if ($LASTEXITCODE -ne 0) {
            Write-Failure -Msg "ESLint static analysis violation detected."
            exit 1
        }
        Write-Success -Msg "ESLint rules passed (0 errors, 0 warnings)" -DurationSec ($lintTimer.Elapsed.TotalSeconds)
    } else {
        Write-Info -Msg "ESLint check bypassed (-SkipLint)."
    }
} else {
    Write-Info -Msg "All quality sanity checks bypassed (-SkipTests specified)."
}
$Phase3Timer.Stop()

# ------------------------------------------------------------------------------
# Phase 4: Production Compilation (Next.js Turbopack)
# ------------------------------------------------------------------------------
$Phase4Timer = [System.Diagnostics.Stopwatch]::StartNew()
Write-Phase -Step "4/5" -Title "Production Distribution Compilation (next build)"

Write-Host "  --> Triggering Next.js production build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Failure -Msg "Next.js production build compilation failed."
    exit 1
}
$Phase4Timer.Stop()
Write-Success -Msg "Next.js compilation completed" -DurationSec ($Phase4Timer.Elapsed.TotalSeconds)

# ------------------------------------------------------------------------------
# Phase 5: Build Artifact Verification and Telemetry
# ------------------------------------------------------------------------------
$Phase5Timer = [System.Diagnostics.Stopwatch]::StartNew()
Write-Phase -Step "5/5" -Title "Build Artifact Verification and Sizing"

$totalMB = 0
$fileCount = 0
if (Test-Path -Path $nextPath) {
    $allFiles = Get-ChildItem -Path $nextPath -Recurse -File -ErrorAction SilentlyContinue
    $totalBytes = ($allFiles | Measure-Object -Property Length -Sum).Sum
    $totalMB = [math]::Round(($totalBytes / 1MB), 2)
    $fileCount = $allFiles.Count

    $staticDir = Join-Path $nextPath "static"
    $staticSizeMB = 0
    if (Test-Path $staticDir) {
        $staticFiles = Get-ChildItem -Path $staticDir -Recurse -File -ErrorAction SilentlyContinue
        $staticBytes = ($staticFiles | Measure-Object -Property Length -Sum).Sum
        $staticSizeMB = [math]::Round(($staticBytes / 1MB), 2)
    }

    $serverDir = Join-Path $nextPath "server"
    $serverFilesCount = if (Test-Path $serverDir) { (Get-ChildItem -Path $serverDir -Recurse -File).Count } else { 0 }

    Write-Success -Msg "Verified build artifacts in $nextPath"
    Write-Info -Msg "Total Artifact Size : $totalMB MB ($fileCount files)"
    Write-Info -Msg "Client Static Chunk : $staticSizeMB MB"
    Write-Info -Msg "Server Pages/Chunks : $serverFilesCount files"
} else {
    Write-Failure -Msg ".next output directory not found after build."
    exit 1
}
$Phase5Timer.Stop()
$TotalTimer.Stop()

# ------------------------------------------------------------------------------
# Build Summary Table
# ------------------------------------------------------------------------------
$totalSec = [math]::Round($TotalTimer.Elapsed.TotalSeconds, 2)
$p1Sec = [math]::Round($Phase1Timer.Elapsed.TotalSeconds, 2)
$p2Sec = [math]::Round($Phase2Timer.Elapsed.TotalSeconds, 2)
$p3Sec = [math]::Round($Phase3Timer.Elapsed.TotalSeconds, 2)
$p4Sec = [math]::Round($Phase4Timer.Elapsed.TotalSeconds, 2)
$p5Sec = [math]::Round($Phase5Timer.Elapsed.TotalSeconds, 2)

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] SELENE PRODUCTION BUILD READY!                        " -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  Application     : Selene v$AppVersion (Titan Edition)" -ForegroundColor White
Write-Host "  Distribution    : $nextPath" -ForegroundColor Cyan
Write-Host "  Bundle Footprint: $totalMB MB ($fileCount total files)" -ForegroundColor Cyan
Write-Host "  Total Runtime   : $totalSec seconds" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Execution Timeline:" -ForegroundColor DarkGray
Write-Host "    [1/5] Environment Checks : ${p1Sec}s" -ForegroundColor DarkGray
Write-Host "    [2/5] Clean Sweep        : ${p2Sec}s" -ForegroundColor DarkGray
Write-Host "    [3/5] Quality Sanity     : ${p3Sec}s" -ForegroundColor DarkGray
Write-Host "    [4/5] Next.js Build      : ${p4Sec}s" -ForegroundColor DarkGray
Write-Host "    [5/5] Artifact Telemetry : ${p5Sec}s" -ForegroundColor DarkGray
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  To test the compiled bundle locally: npm start" -ForegroundColor Cyan
Write-Host ""
