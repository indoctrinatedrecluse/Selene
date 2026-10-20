# 🛠️ Selene Developer & Operations Toolchain

> **Cross-Platform Engineering Scripts, Build Pipelines & Deployment Automation**  
> *Providing high-transparency, verbose telemetry across web, desktop, and Google Cloud Run environments.*

---

## 📂 Directory Layout

```
tools/
├── README.md                          # Comprehensive tooling & automation guide
└── scripts/
    ├── version-sync.js                # Universal multi-target version synchronizer
    ├── build/
    │   ├── build.ps1                  # Production build & quality sanity suite (PowerShell)
    │   └── build.sh                   # Production build & quality sanity suite (Bash)
    ├── cloud/
    │   ├── deploy-cloudrun.ps1        # Google Cloud Run production deployment (PowerShell)
    │   └── deploy-cloudrun.sh         # Google Cloud Run production deployment (Bash)
    ├── desktop/
    │   ├── package-desktop.ps1        # Native desktop packager for Tauri v2 & Electron (PowerShell)
    │   ├── package-desktop.sh         # Native desktop packager for Tauri v2 & Electron (Bash)
    │   ├── run-desktop.ps1            # Native desktop launcher with auto-server boot (PowerShell)
    │   └── run-desktop.sh             # Native desktop launcher with auto-server boot (Bash)
    └── run/
        ├── run.ps1                    # Next.js Turbopack dev server with LAN endpoints (PowerShell)
        └── run.sh                     # Next.js Turbopack dev server with LAN endpoints (Bash)
```

---

## 🌙 1. Universal Version Synchronizer (`version-sync.js`)

Ensures atomic, single-source-of-truth versioning across all 10 repositories and manifests:
1. `package.json`
2. `src/lib/version.ts`
3. `src-tauri/tauri.conf.json`
4. `src-tauri/Cargo.toml`
5. `desktop-dist/index.html`
6. `electron/splash.html`
7. `package-lock.json`
8. `.github/workflows/release.yml`
9. `README.md`
10. `electron/main.js`

### Usage:
```bash
# Verify all targets match package.json version
node tools/scripts/version-sync.js --verbose

# Bump and propagate new semantic version everywhere
node tools/scripts/version-sync.js 0.5.0

# Preview changes without modifying files on disk
node tools/scripts/version-sync.js 0.5.0 --dry-run
```

---

## ⚡ 2. Production Build & Quality Sanity Suite (`build/`)

Runs pre-flight diagnostics, cleans build caches, executes TypeScript type-checking (`tsc --noEmit`), runs ESLint static analysis (`eslint`), compiles the optimized Next.js bundle via Turbopack, and prints complete artifact sizing telemetry.

### PowerShell:
```powershell
# Standard production build with sanity tests
.\tools\scripts\build\build.ps1

# Full clean sweep + verbose artifact inspection
.\tools\scripts\build\build.ps1 -Clean

# Rapid compilation (skip quality checks)
.\tools\scripts\build\build.ps1 -SkipTests
```

### Bash (Linux / macOS / WSL):
```bash
# Standard production build
./tools/scripts/build/build.sh

# Clean build and bypass tests
./tools/scripts/build/build.sh --clean --skip-tests
```

---

## ☁️ 3. Google Cloud Run Deployment Suite (`cloud/`)

Validates Google Cloud SDK credentials and active identity, executes pre-flight tests, packages the Next.js standalone container via Google Cloud Build, provisions or updates the Cloud Run service, and runs live HTTP health probes with millisecond response timing.

### PowerShell:
```powershell
# Deploy to default project (indoctrinated-licensor in us-central1)
.\tools\scripts\cloud\deploy-cloudrun.ps1

# Dry-run preview of deployment configuration
.\tools\scripts\cloud\deploy-cloudrun.ps1 -DryRun -SkipTests

# Deploy with custom resources and remote database
.\tools\scripts\cloud\deploy-cloudrun.ps1 `
    -ProjectID indoctrinated-licensor `
    -Region us-central1 `
    -ServiceName selene `
    -Memory 2Gi `
    -Cpu 2 `
    -DatabaseUrl "libsql://selene-db.turso.io" `
    -DatabaseToken "YOUR_TOKEN"
```

### Bash (Linux / macOS / WSL):
```bash
# Deploy to production
./tools/scripts/cloud/deploy-cloudrun.sh

# Preview deployment command without deploying
./tools/scripts/cloud/deploy-cloudrun.sh --dry-run --skip-tests
```

---

## 🖥️ 4. Native Desktop Packaging & Launching (`desktop/`)

### A. Packaging Desktop Distributions (`package-desktop`)
Compiles production bundles and generates native distribution packages:
- **Tauri v2 (Rust)**: `.msi` and `.exe` on Windows; `.dmg` on macOS; `.AppImage` and `.deb` on Linux.
- **Electron**: Configures and packages cross-platform Electron shell.

```powershell
# Package Tauri v2 binaries (default)
.\tools\scripts\desktop\package-desktop.ps1 -Target tauri

# Package Electron shell
.\tools\scripts\desktop\package-desktop.ps1 -Target electron
```

### B. Launching Desktop Applications (`run-desktop`)
Checks toolchains, automatically starts the local Next.js Turbopack development server in the background (monitoring for readiness), launches the native desktop window, and gracefully stops the background server upon application exit.

```powershell
# Launch instantly with Electron shell
.\tools\scripts\desktop\run-desktop.ps1

# Launch with Tauri v2 (Rust WebView2)
.\tools\scripts\desktop\run-desktop.ps1 -Engine tauri
```

---

## 🚀 5. Development Server Launcher (`run/`)

Verifies Node.js (v18+) and npm, checks for port occupancy (reporting process ID if occupied), inspects local IPv4 interfaces to display both localhost and LAN URLs (for mobile/tablet testing), and boots the Next.js Turbopack development server.

```powershell
# Start on default port 3000
.\tools\scripts\run\run.ps1

# Start on custom port with cache purge
.\tools\scripts\run\run.ps1 -Port 3001 -Clean
```

```bash
# Linux / macOS / WSL
./tools/scripts/run/run.sh -p 3000
```
