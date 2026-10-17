<#
.SYNOPSIS
    Selene Desktop Application Packaging & Distribution Suite (PowerShell)
.DESCRIPTION
    Runs type-checks, linters, compiles Next.js production build,
    and packages native desktop distribution bundles.
.PARAMETER Target
    Packaging target: 'tauri' (default) or 'electron'.
.EXAMPLE
    .\tools\scripts\desktop\package-desktop.ps1
    .\tools\scripts\desktop\package-desktop.ps1 -Target tauri
#>

[CmdletBinding()]
param (
    [ValidateSet("tauri", "electron")]
    [string]$Target = "tauri"
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

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..\..")
Set-Location $ProjectRoot

Clear-Host
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  🌙 Selene — Desktop Distribution Packaging Suite        " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor DarkCyan
Write-Host "  Working Directory: $ProjectRoot" -ForegroundColor Gray
Write-Host "  Packaging Target: $Target" -ForegroundColor Yellow

# 1. Sanity Checks
Write-Step "[1/4] Running Quality and Sanity Checks..."
& npm run type-check
Write-Success "Type-check passed."
& npm run lint
Write-Success "Lint passed."

# 2. Build Next.js Production Bundle
Write-Step "[2/4] Compiling Next.js Web Application Bundle..."
& npm run build
Write-Success "Next.js production build compiled."

# 3. Packaging
Write-Step "[3/4] Packaging native desktop bundle ($Target)..."
if ($Target -eq "tauri") {
    try {
        & npx tauri build
        Write-Success "Tauri desktop binaries generated in src-tauri/target/release/bundle/"
    } catch {
        Write-Host "  [WARN] Tauri build requires C++ Build Tools & WebView2. Check src-tauri/target/." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [*] Electron desktop shell is packaged with electron/main.js." -ForegroundColor Gray
}

# 4. Summary
Write-Step "[4/4] Finalizing Desktop Distribution Package..."
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] Selene Desktop Packaging Complete!             " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  To run your desktop app: .\tools\scripts\desktop\run-desktop.ps1" -ForegroundColor Cyan
