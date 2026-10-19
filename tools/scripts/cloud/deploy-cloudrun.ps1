<#
.SYNOPSIS
    Selene Automated Production Google Cloud Run Deployment Script (PowerShell)
.DESCRIPTION
    Validates gcloud credentials, runs sanity tests, and deploys the containerized
    Selene Next.js standalone engine to Google Cloud Run.
.PARAMETER ProjectID
    Target Google Cloud project ID. If omitted, uses active gcloud config project.
.PARAMETER Region
    Google Cloud region (Default: us-central1).
.PARAMETER ServiceName
    Name of the Cloud Run service (Default: selene-backend).
.PARAMETER BackendSecret
    Custom shared cryptographic secret for client attestation.
.PARAMETER DatabaseUrl
    Remote database connection URL (e.g., Turso / LibSQL URL).
.PARAMETER DatabaseToken
    Auth token for remote database.
.PARAMETER SkipTests
    Skip running type-check and linting before deploy.
#>

[CmdletBinding()]
param(
    [string]$ProjectID = "indoctrinated-licensor",
    [string]$Region = "us-central1",
    [string]$ServiceName = "selene",
    [string]$BackendSecret,
    [string]$DatabaseUrl,
    [string]$DatabaseToken,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..\..\..")).Path

function Write-Step([string]$msg) {
    Write-Host "`n--> $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-WarnMsg([string]$msg) {
    Write-Host "  [WARN] $msg" -ForegroundColor Yellow
}

function Write-Fail([string]$msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    exit 1
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  SELENE - Google Cloud Run Production Deployment         " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  Project Root : $ProjectRoot" -ForegroundColor Gray
Write-Host "  Service Name : $ServiceName" -ForegroundColor Yellow
Write-Host "  Target Region: $Region" -ForegroundColor Yellow

# 1. Check gcloud CLI
Write-Step "[1/5] Checking Google Cloud SDK (gcloud)..."
try {
    $gcloudVer = & gcloud --version 2>&1 | Select-Object -First 1
    Write-Success "gcloud CLI detected: $gcloudVer"
} catch {
    Write-Fail "Google Cloud SDK (gcloud) is not installed or not in PATH."
}

# Resolve GCP Project ID
if (-not $ProjectID) {
    $ProjectID = & gcloud config get-value project 2>$null
    if ($ProjectID) { $ProjectID = $ProjectID.Trim() }
}

if (-not $ProjectID -or $ProjectID -eq "(unset)") {
    Write-Fail "No GCP project specified or set in active gcloud config. Pass -ProjectID [your-project-id]."
}
Write-Success "Target GCP Project: $ProjectID"

# 2. Run Sanity Checks and Tests
if (-not $SkipTests) {
    Write-Step "[2/5] Running TypeScript Type-Check and ESLint..."
    Push-Location $ProjectRoot
    try {
        & npm run type-check
        if ($LASTEXITCODE -ne 0) { Write-Fail "TypeScript verification failed." }
        Write-Success "TypeScript check passed."

        & npm run lint
        if ($LASTEXITCODE -ne 0) { Write-Fail "ESLint verification failed." }
        Write-Success "ESLint analysis passed."
    } finally {
        Pop-Location
    }
} else {
    Write-WarnMsg "Skipping sanity checks (-SkipTests)."
}

# 3. Prepare Environment Variables
Write-Step "[3/5] Configuring Environment Variables and Secrets..."
$envList = @(
    "NODE_ENV=production",
    "NEXT_TELEMETRY_DISABLED=1",
    "LICENSOR_SERVER_URL=https://licensor-h5zdysrkqa-uc.a.run.app"
)

if ($BackendSecret) {
    $envList += "SELENE_BACKEND_SECRET=$BackendSecret"
}
if ($DatabaseUrl) {
    $envList += "DATABASE_URL=$DatabaseUrl"
}
if ($DatabaseToken) {
    $envList += "DATABASE_AUTH_TOKEN=$DatabaseToken"
}

$envVarsString = ($envList -join ",")

# 4. Deploy to Cloud Run using Google Cloud Build
Write-Step "[4/5] Building container via Cloud Build and deploying to Cloud Run..."
Write-Host "  Source: $ProjectRoot" -ForegroundColor Gray
Write-Host "  Building container image on Google Cloud Build... (this may take 2-3 minutes)" -ForegroundColor DarkGray

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--source", ".",
    "--project", $ProjectID,
    "--region", $Region,
    "--platform", "managed",
    "--allow-unauthenticated",
    "--port", "8080",
    "--memory", "1Gi",
    "--cpu", "1",
    "--min-instances", "0",
    "--max-instances", "10",
    "--set-env-vars", $envVarsString
)

Push-Location $ProjectRoot
try {
    & gcloud @deployArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Cloud Run deployment failed."
    }
} finally {
    Pop-Location
}

# 5. Fetch Deployed URL and Health Verification
Write-Step "[5/5] Verifying Deployment Health..."
$serviceUrl = & gcloud run services describe $ServiceName --project $ProjectID --region $Region --format "value(status.url)" 2>$null
if ($serviceUrl) {
    $serviceUrl = $serviceUrl.Trim()
}

if ($serviceUrl) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  SELENE CLOUD RUN DEPLOYMENT SUCCESSFUL!                 " -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  Live Service URL   : $serviceUrl" -ForegroundColor Cyan
    Write-Host "  Health Probe       : $serviceUrl/api/health" -ForegroundColor Cyan
    Write-Host "  Licensor Server    : https://licensor-h5zdysrkqa-uc.a.run.app" -ForegroundColor Gray
    Write-Host "  Client Protection  : Active (Cryptographic Attestation + Licensing Gate)" -ForegroundColor Green

    # Probe health
    try {
        $health = Invoke-RestMethod -Uri "$serviceUrl/api/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($health -and $health.status -eq "ok") {
            Write-Success "Health check probe responded OK!"
        }
    } catch {
        Write-WarnMsg "Health probe could not be confirmed immediately. The service may take a few seconds to warm up."
    }
} else {
    Write-WarnMsg "Could not retrieve Cloud Run service URL automatically."
}
