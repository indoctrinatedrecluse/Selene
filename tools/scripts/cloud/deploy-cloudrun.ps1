<#
.SYNOPSIS
    Selene Automated Production Google Cloud Run Deployment Script (PowerShell)
.DESCRIPTION
    Validates gcloud credentials, inspects project telemetry, executes pre-flight
    sanity checks, orchestrates container compilation via Google Cloud Build,
    deploys the Next.js standalone engine to Cloud Run, and executes live health probes.
.PARAMETER ProjectID
    Target Google Cloud project ID (Default: 'indoctrinated-licensor').
.PARAMETER Region
    Google Cloud region (Default: 'us-central1').
.PARAMETER ServiceName
    Name of the Cloud Run service (Default: 'selene').
.PARAMETER BackendSecret
    Custom shared cryptographic secret for client attestation.
.PARAMETER DatabaseUrl
    Remote database connection URL (e.g., Turso / LibSQL URL).
.PARAMETER DatabaseToken
    Auth token for remote database.
.PARAMETER SkipTests
    Skip running type-check and linting before deploy.
.PARAMETER Cpu
    Allocated vCPU per container instance (Default: 1).
.PARAMETER Memory
    Allocated RAM per container instance (Default: '1Gi').
.PARAMETER MinInstances
    Minimum instance scale (Default: 0 for serverless scale-to-zero).
.PARAMETER MaxInstances
    Maximum instance scale (Default: 10).
.PARAMETER DryRun
    Preview configuration and pre-flight checks without triggering deployment.
.PARAMETER VerboseOutput
    Enable verbose debugging telemetry.
.EXAMPLE
    .\tools\scripts\cloud\deploy-cloudrun.ps1
    .\tools\scripts\cloud\deploy-cloudrun.ps1 -ProjectID indoctrinated-licensor -SkipTests
#>

[CmdletBinding()]
param(
    [string]$ProjectID = "indoctrinated-licensor",
    [string]$Region = "us-central1",
    [string]$ServiceName = "selene",
    [string]$BackendSecret,
    [string]$DatabaseUrl,
    [string]$DatabaseToken,
    [int]$Cpu = 1,
    [string]$Memory = "1Gi",
    [int]$MinInstances = 0,
    [int]$MaxInstances = 10,
    [switch]$SkipTests,
    [switch]$DryRun,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"
$TotalTimer = [System.Diagnostics.Stopwatch]::StartNew()

# ------------------------------------------------------------------------------
# Locate Project Root and Read Metadata
# ------------------------------------------------------------------------------
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..\..\..")).Path

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
    if ($statusOut) { $GitDirty = " [uncommitted changes detected]" }
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
    if ($DurationSec -ge 0) { $dur = " ($([math]::Round($DurationSec, 2))s)" }
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
Write-Host "  SELENE - Google Cloud Run Production Deployment Suite           " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor DarkCyan
Write-Host "  Target Release : Selene v$AppVersion (Titan Edition)" -ForegroundColor White
Write-Host "  Source Path    : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "  Git Metadata   : $GitBranch ($GitCommit)$GitDirty" -ForegroundColor DarkGray
Write-Host "  Target Project : $ProjectID" -ForegroundColor Yellow
Write-Host "  Service Name   : $ServiceName" -ForegroundColor Yellow
Write-Host "  Compute Region : $Region" -ForegroundColor Yellow
Write-Host "  Sizing Specs   : $Cpu vCPU / $Memory RAM / Scale: $MinInstances to $MaxInstances" -ForegroundColor DarkGray
$dryRunLabel = if ($DryRun) { "ACTIVE (No Cloud Run Changes)" } else { "Disabled" }
Write-Host "  Dry Run Mode   : $dryRunLabel" -ForegroundColor DarkGray
Write-Host "==================================================================" -ForegroundColor DarkCyan

# ------------------------------------------------------------------------------
# 1. Google Cloud SDK and Account Verification
# ------------------------------------------------------------------------------
Write-StepHeader -Step "1/5" -Title "Google Cloud SDK and Account Verification"
try {
    $gcloudVer = (& gcloud --version 2>&1 | Select-Object -First 1).Trim()
    Write-Success -Msg "gcloud CLI verified: $gcloudVer"
} catch {
    Write-Fail -Msg "Google Cloud SDK (gcloud) is not installed or not in PATH. Please install from https://cloud.google.com/sdk"
}

# Check active auth account
try {
    $activeAccount = (& gcloud auth list --filter='status:ACTIVE' --format='value(account)' 2>$null).Trim()
    if ($activeAccount) {
        Write-Success -Msg "Active GCP Identity: $activeAccount"
    } else {
        Write-WarnMsg -Msg "No active account marked in gcloud. Running 'gcloud auth login' may be required."
    }
} catch {}

# Resolve GCP Project ID
if (-not $ProjectID) {
    $ProjectID = (& gcloud config get-value project 2>$null).Trim()
}

if (-not $ProjectID -or $ProjectID -eq "(unset)") {
    Write-Fail -Msg "No GCP project specified or set in active gcloud config. Pass -ProjectID [your-project-id]."
}
Write-Success -Msg "Confirmed GCP Project ID: $ProjectID"

# ------------------------------------------------------------------------------
# 2. Quality and Sanity Test Suite
# ------------------------------------------------------------------------------
Write-StepHeader -Step "2/5" -Title "Quality and Sanity Pre-Flight Verification"
if (-not $SkipTests) {
    $sanityTimer = [System.Diagnostics.Stopwatch]::StartNew()
    Push-Location $ProjectRoot
    try {
        Write-Host "  --> Executing TypeScript Type-Check (tsc --noEmit)..." -ForegroundColor Cyan
        & npm run type-check
        if ($LASTEXITCODE -ne 0) { Write-Fail -Msg "TypeScript verification failed." }
        Write-Success -Msg "TypeScript static typing verified."

        Write-Host "  --> Executing ESLint static analysis (eslint)..." -ForegroundColor Cyan
        & npm run lint
        if ($LASTEXITCODE -ne 0) { Write-Fail -Msg "ESLint verification failed." }
        Write-Success -Msg "ESLint lint rules verified."
    } finally {
        Pop-Location
    }
    $sanityTimer.Stop()
    Write-Success -Msg "All sanity checks passed" -DurationSec ($sanityTimer.Elapsed.TotalSeconds)
} else {
    Write-WarnMsg -Msg "Pre-flight sanity checks bypassed (-SkipTests)."
}

# ------------------------------------------------------------------------------
# 3. Environment Variables and Secret Ingestion
# ------------------------------------------------------------------------------
Write-StepHeader -Step "3/5" -Title "Configuring Environment Variables and Secrets"
$envList = @(
    "NODE_ENV=production",
    "NEXT_TELEMETRY_DISABLED=1",
    "LICENSOR_SERVER_URL=https://licensor-h5zdysrkqa-uc.a.run.app"
)

if ($BackendSecret) {
    $maskedSecret = if ($BackendSecret.Length -gt 6) { $BackendSecret.Substring(0, 3) + "..." + $BackendSecret.Substring($BackendSecret.Length - 3) } else { "***" }
    Write-Info -Msg "Injecting Custom Backend Secret: $maskedSecret"
    $envList += "SELENE_BACKEND_SECRET=$BackendSecret"
} else {
    Write-Info -Msg "Using built-in Cryptographic Attestation Secret"
}

if ($DatabaseUrl) {
    Write-Info -Msg "Configuring Remote LibSQL Database: $DatabaseUrl"
    $envList += "DATABASE_URL=$DatabaseUrl"
} else {
    Write-Info -Msg "Using Container Serverless SQLite persistence (/tmp/selene.db)"
}

if ($DatabaseToken) {
    Write-Info -Msg "Configuring Database Auth Token [MASKED]"
    $envList += "DATABASE_AUTH_TOKEN=$DatabaseToken"
}

$envVarsString = ($envList -join ",")
Write-Success -Msg "Configured $($envList.Count) production environment variables"

# ------------------------------------------------------------------------------
# 4. Container Build and Cloud Run Deployment
# ------------------------------------------------------------------------------
Write-StepHeader -Step "4/5" -Title "Compiling Container via Cloud Build and Deploying"

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--source", ".",
    "--project", $ProjectID,
    "--region", $Region,
    "--platform", "managed",
    "--allow-unauthenticated",
    "--port", "8080",
    "--memory", $Memory,
    "--cpu", "$Cpu",
    "--min-instances", "$MinInstances",
    "--max-instances", "$MaxInstances",
    "--set-env-vars", $envVarsString
)

if ($DryRun) {
    Write-WarnMsg -Msg "DRY-RUN: Command that would be executed:"
    Write-Host "  gcloud $($deployArgs -join ' ')" -ForegroundColor DarkGray
    Write-Success -Msg "Dry-run check completed successfully. Exiting."
    exit 0
}

Write-Info -Msg "Submitting build context to Google Cloud Build..."
Write-Info -Msg "Google Cloud Build will parse Dockerfile and compile Next.js standalone image."
Write-Info -Msg "Estimated execution time: 2-3 minutes..."

$deployTimer = [System.Diagnostics.Stopwatch]::StartNew()
Push-Location $ProjectRoot
try {
    & gcloud @deployArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Fail -Msg "Google Cloud Run deployment failed. Check Cloud Build logs in GCP Console."
    }
} finally {
    Pop-Location
}
$deployTimer.Stop()
Write-Success -Msg "Cloud Run service deployment completed" -DurationSec ($deployTimer.Elapsed.TotalSeconds)

# ------------------------------------------------------------------------------
# 5. Deployment Verification and Live Telemetry Probe
# ------------------------------------------------------------------------------
Write-StepHeader -Step "5/5" -Title "Live Health Probe and Telemetry Verification"

$serviceUrl = (& gcloud run services describe $ServiceName --project $ProjectID --region $Region --format='value(status.url)' 2>$null)
if ($serviceUrl) { $serviceUrl = $serviceUrl.Trim() }

$activeRevision = (& gcloud run services describe $ServiceName --project $ProjectID --region $Region --format='value(status.latestReadyRevisionName)' 2>$null)
if ($activeRevision) { $activeRevision = $activeRevision.Trim() }

$TotalTimer.Stop()

if ($serviceUrl) {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] SELENE CLOUD RUN DEPLOYMENT LIVE!                     " -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host "  Application      : Selene v$AppVersion (Titan Edition)" -ForegroundColor White
    Write-Host "  Active Revision  : $activeRevision" -ForegroundColor Cyan
    Write-Host "  Live Service URL : $serviceUrl" -ForegroundColor Cyan
    Write-Host "  Health Endpoint  : $serviceUrl/api/health" -ForegroundColor Cyan
    Write-Host "  Total Deploy Time: $([math]::Round($TotalTimer.Elapsed.TotalSeconds, 2)) seconds" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------------" -ForegroundColor DarkCyan

    # Probe live health endpoint
    Write-Host "  --> Dispatching HTTP probe to $serviceUrl/api/health..." -ForegroundColor Cyan
    $probeTimer = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $healthResponse = Invoke-RestMethod -Uri "$serviceUrl/api/health" -TimeoutSec 15 -ErrorAction Stop
        $probeTimer.Stop()
        if ($healthResponse -and $healthResponse.status -eq "ok") {
            Write-Success -Msg "Health check probe responded OK in $([math]::Round($probeTimer.Elapsed.TotalMilliseconds, 1))ms!"
            Write-Info -Msg "Reported Service Version: v$($healthResponse.version)"
            Write-Info -Msg "Server Timestamp        : $($healthResponse.timestamp)"
        } else {
            Write-WarnMsg -Msg "Probe returned unexpected payload: $($healthResponse | ConvertTo-Json -Compress)"
        }
    } catch {
        $probeTimer.Stop()
        Write-WarnMsg -Msg "Initial health probe timed out after $([math]::Round($probeTimer.Elapsed.TotalSeconds, 1)) seconds. Container may be completing initial warm-up."
    }
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""
} else {
    Write-WarnMsg -Msg "Could not automatically resolve Cloud Run URL. Check Google Cloud Console."
}
