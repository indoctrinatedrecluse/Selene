# 🌙 Selene Changelog

All notable changes to the **Selene** technical document & code canvas platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - Sprint 1: Full-Stack Polyglot Live Renders (PHP/Laravel & Ruby on Rails)

### 🐘 PHP 8.3 & Laravel 11 Blade Live Render Engine (`PhpLaravelRenderer.tsx`)
- **Native In-Browser Blade Compiler**: In-memory compilation of Blade directives including `@php ... @endphp`, `@foreach ($collection as $item) ... @endforeach`, `@if (...) ... @elseif (...) ... @else ... @endif`, `{{ $variable }}`, `{{ strtoupper(...) }}`, and `{{ count(...) }}`.
- **Client-Side Alpine.js 3.x Execution**: Embedded Alpine.js runtime inside an isolated iframe sandbox enabling real-time tab switching, counters, and reactive attributes with 0ms latency.
- **Dual Execution Modes**:
  - *Blade Engine*: 100% offline in-browser playground.
  - *Artisan Serve Bridge*: Seamless live iframe connection to local `php artisan serve` (port 8000) with automatic server health pinging.
- **Responsive Device Previews & Layouts**: Desktop, Tablet, and Mobile phone views, plus Split, Canvas, and Code editor modes.
- **Built-in Curated Presets**:
  - ⚡ *Laravel Metric Card*: Dynamic telemetry with Alpine.js tabs and service loop.
  - 📦 *Eloquent Collection Table*: `App\Models\CelestialTeam::all()` simulation with status badges.

### 💎 Ruby 3.3 & Rails 8.0 ERB Live Render Engine (`RubyRailsRenderer.tsx`)
- **Native In-Browser ERB Compiler**: Evaluates Ruby variable definitions (`<% @var = ... %>`), iteration loops (`<% @collection.each do |item| %> ... <% end %>`), conditionals (`<% if ... %> ... <% else %> ... <% end %>`), and string interpolations (`<%= @var %>`, `<%== @var %>`).
- **Rails View Helpers & Hotwire Turbo Frames**: Native simulation of `<%= turbo_frame_tag "id" do %>`, `<%= number_to_currency(...) %>`, `<%= pluralize(...) %>`, and `<%= @status.upcase %>`.
- **Stimulus Controller Simulation**: Interactive `data-controller`, `data-action`, and `data-target` event listeners running live in the sandboxed preview.
- **Dual Execution Modes**:
  - *ERB Engine*: 100% offline in-browser execution.
  - *Puma Server Bridge*: Real-time bridge to local `bin/rails server` (port 3000) with active status monitoring.
- **Responsive Previews & Layouts**: Desktop, Tablet, and Mobile frames with split, canvas, and code views.
- **Built-in Curated Presets**:
  - 🚀 *Rails Hotwire / Turbo Frame Card*: Real-time stream dispatcher and status metrics.
  - 💎 *ActiveRecord Query Table*: `Deployment.recent.includes(:author)` relation with formatted columns.

### 📁 Showcase Documents & Language Integration
- Added dedicated showcase sample documents in `samples/`:
  - `06_php_laravel_blade_showcase.md` (`🐘`)
  - `07_ruby_on_rails_erb_showcase.md` (`💎`)
- Updated `LiveCodeBlockView.tsx` with automatic routing for `blade`, `php`, `laravel`, `erb`, `rails`, and `ruby`.
- Added starter snippets and language options to `stack-templates.ts`.
- Implemented persistent storage migration (`selene_documents_v8`) preserving existing documents while delivering new starter showcases.

## [0.1.0] - 2026-10-18

### 🌟 Initial Major Milestone Release — "Titan Edition"

This release marks the culmination of the core roadmap pillars for Selene: Universal Visual Property Inspection, Publication & Export Suite, WebAssembly Computational Notebooks, and Native Desktop Packaging.

#### 🛠️ Left Sidebar & File Tree Visibility Resolution
- **Eliminated Flex Collapse Bug**: Refactored `WorkspaceSidebar.tsx` file row structure from nested `min-w-0 flex-1 truncate` to guaranteed `flex items-center gap-2 min-w-0 flex-1` layout, ensuring document titles, folder headers (`samples/`, `documents/`), and file icons (`🌙`, `🎨`, `📄`) never squash to 0 width.
- **Solid High-Contrast Background & Z-Index Elevation**: Set sidebar backdrop to `#070b16` with crisp `border-slate-800` and `relative z-20` stacking to prevent stars, canvas, or sticky toolbars from bleeding through or overlaying the explorer.
- **Defensive Data Hydration**: Added automatic title healing (`doc.title || "Untitled Document"`) and icon healing in `workspace-store.ts` to guarantee clean rendering on startup.
- **Cloud Run Deployment**: Upgraded live service on project `indoctrinated-licensor` to revision `selene-00003-qvc`.

#### 🎛️ Phase 1: Universal No-Code "Visual Tweak Props & Inspector" (Bi-Directional AST Sync)
- **Bi-Directional AST Synchronization Engine** (`src/lib/ast-transformer.ts`):
  - In-memory parsing, token extraction, and code patching across 5 frameworks: **React (TSX/JSX)**, **Vue 3 SFC**, **Svelte 4/5**, **Angular Ivy**, and **Vanilla HTML/Tailwind**.
  - Dynamic AST extraction of visual properties: Background surfaces, gradients, text colors, padding, corner radiuses, borders, elevations, and text node content.
  - Live AST code generation updating source code without losing state or comments.
- **Universal Visual Property Inspector** (`UniversalPropertyInspector.tsx`):
  - 4-tab visual inspector modal:
    - 🎨 *Theme & Surface*: Solid backgrounds, cosmic gradients, lunar borders, drop shadows.
    - 📐 *Layout & Geometry*: Padding scales, corner radiuses, flex direction, alignments.
    - ✍️ *Content & Typography*: Title, body, text sizes, font weights, text colors.
    - ⚡ *State & Logic*: Interactive counter values and reactive state adjustments.
  - Live bi-directional sync back to TipTap ProseMirror document state and Sandpack editor.

#### 📄 Phase 2: Universal Document Publishing & Export Suite
- **Vector Print & Publication PDF Engine** (`src/lib/pdf-export.ts`):
  - High-fidelity vector printing engine rendering KaTeX equations, high-DPI Mermaid SVGs, and formatted prose into print-optimized layouts.
  - Print page-break optimization preventing awkward splits across code cells and diagram nodes.
- **Standalone Offline Single-File HTML Exporter** (`src/lib/html-export.ts`):
  - Bundles Tailwind CSS runtime, KaTeX stylesheet and font assets, and Mermaid.js into a single self-contained `.html` file that opens offline in any browser without a web server.
- **Full-Screen Interactive Presentation Slide Deck** (`src/components/presentation/SlideDeckViewer.tsx`):
  - Turns any markdown document into a presentation slide deck with `/slides` commands (`---`).
  - Slide presenter mode with elapsed timer, slide progress bar, thumbnail drawer, and keyboard navigation (`Left`, `Right`, `Space`, `F`, `Escape`).
  - Live running widgets on presentation slides: React sandboxes, Flutter Web canvases, Python notebooks, and Mermaid diagrams execute interactively on slides!
- **Universal Publish & Export Modal** (`PublishExportModal.tsx`):
  - 4-tab export dialog: PDF, Standalone HTML, Interactive Slide Deck, and Clean GFM Markdown.

#### 🐍 Phase 3: In-Browser Data Science & Computational Notebooks (Pyodide WASM)
- **Pyodide WebAssembly Python Kernel** (`src/lib/pyodide-engine.ts`):
  - 100% in-browser WebAssembly Python 3.12 runtime with zero server or Docker dependencies.
  - Dynamic on-demand scientific package loading (`loadPackagesFromImports`) for **NumPy**, **Pandas**, **Matplotlib**, and **SciPy**.
  - Dual-channel stdout / stderr capture with execution timer.
  - Headless Matplotlib graphics pipeline (`Agg` backend) auto-formatting dark celestial styling (`#090d16`, `#0f172a`, `#38bdf8`) and extracting plots as high-DPI (140 DPI) base64 PNGs.
- **Interactive Computational Cell** (`src/components/render-engine/PythonNotebookRenderer.tsx`):
  - Multi-line code editor with `Ctrl+Enter` execution shortcut, output clearing, and plot download.
  - Curated presets:
    - 🌙 *Lunar Orbit Trajectory*: Apollo/Artemis TLI free-return orbit visualization.
    - 🎲 *Monte Carlo Pi & Crater Density Estimator*: 200,000-sample statistical simulation.
    - 📊 *Lunar Rover Telemetry*: Multi-sensor time series processing with Pandas DataFrames.
- **Slash Command Integration**:
  - Added `/python` (`Live Python WASM Cell`) command to slash menu.

#### 🖥️ Phase 4: Native Desktop Packaging (Tauri v2 & Electron Offline Shell)
- **Tauri v2 Native Rust Shell** (`src-tauri/`):
  - Tauri v2 configuration with system dialogs, file I/O, notifications, and shell integration.
  - Sub-50MB memory footprint and native OS WebView2/WebKit execution.
- **Electron Companion Desktop Shell** (`electron/`):
  - Zero-compile instant desktop shell with native menu bars (File, Edit, View, Help).
  - Automated local Next.js dev server detection and fallback.
  - Preload context bridge exposing `window.seleneDesktop`.
- **Universal Desktop Bridge** (`src/lib/desktop-bridge.ts`):
  - Unified file I/O abstraction across Tauri v2, Electron, and modern Web File System Access API (`showOpenFilePicker` / `showSaveFilePicker`).
  - Native file open (`Ctrl+O`) and save (`Ctrl+S`) direct to local disk.
- **Top Bar Desktop Integration**:
  - Native Open File and Save Disk buttons in the editor header.
  - Desktop Shell Indicator badge (`Desktop (Tauri/Electron)`).
- **Desktop Automation Scripts** (`tools/scripts/desktop/`):
  - `run-desktop.ps1` & `run-desktop.sh`: Starts server and launches desktop application.
  - `package-desktop.ps1` & `package-desktop.sh`: Compiles and packages native distribution binaries.

#### 🏛️ Mythological Greek Lunar Branding & Aesthetic
- Re-imagined brand identity celebrating **Selene (Σελήνη)**, Titaness of the Moon.
- Ambient celestial background with 5 real-time modes: *Titan Aura*, *Midnight Orbit*, *Full Moon Radiance*, *New Moon Stealth*, and *Starlit Firmament*.
- Interactive **Titan Lore Modal** (`SeleneLoreModal.tsx`) detailing mythological heritage and Homeric Hymns.
- High-res vector crescent moon crown logo with Star of Nocturnal Clarity.

#### 🧩 Live Sandbox Engine & Framework Support
- Multi-framework live execution:
  - **React 19 + Tailwind CSS v4**
  - **Vue 3 SFC**
  - **Svelte 4/5**
  - **Angular Ivy**
  - **Flutter 3.x / Dart CanvasKit WebAssembly**
  - **Vanilla HTML / CSS**
- Live Project Dev Server Tunnel ("Project Mode") for real repository navigation and live HMR.

#### 🔐 Licensing Subsystem & Device Authority
- **Cryptographic Licensing & Node-Locking**:
  - Integrated with **[Licensor](https://licensor-h5zdysrkqa-uc.a.run.app)** central validation authority.
  - Multi-tier support across 3 distinct license patterns:
    - 👑 **Admin Edition (`ADM-xxxx-xxxx-xxxx`)**: Celestial gold badge, automatic HWID node-locking, zero password prompt required.
    - 💻 **Developer Edition (`DEV-xxxx-xxxx-xxxx`)**: Elevated neon developer styling, credential authentication, and AST inspector tools.
    - 🛡️ **User Edition (`USER-xxxx-xxxx-xxxx`)**: Polished cyan/emerald glassmorphic badge and seat activation.
  - **Tamper-Proof 60-Day Evaluation Trial**:
    - Automatic 60-day trial mode when unallocated.
    - Cryptographic HMAC-SHA256 signature verification over device HWID and installation timestamp.
    - Clock rollback and time-travel tampering detection.
    - Secondary anchor synchronization in local user data to prevent trial resets upon registry removal.
    - Automatic graceful time-lock barrier when evaluation period concludes.
  - **Windows Registry (`HKCU\Software\Selene`) Persistence**:
    - Stores encrypted license keys, HWID, seat lease, and validation heartbeat permanently across application updates and uninstalls.
  - **Hardware-Bound AES-256-GCM Cryptographic Vault** (`src/lib/security/secure-vault.ts`):
    - Hardware-tied key derivation using PBKDF2 (100,000 rounds of SHA-512) keyed to the machine HWID (`MachineGuid` + CPU details) and Windows user security identifier.
    - License keys are encrypted with authenticated AES-256-GCM (`EncryptedLicenseKey`) in `HKCU\Software\Selene` — never stored in plaintext.
    - **AI API Key Protection**: Dedicated secure storage vault in `HKCU\Software\Selene\Vault` for **Google Gemini**, **OpenAI**, and **Anthropic Claude** API credentials.
    - Built-in tamper detection via GCM authentication tags and PBKDF2 salt isolation.
  - **License Manager & AI Security Vault Modal** (`SeleneLicenseModal.tsx`):
    - Accessible via header badge or **Help -> Manage License & Device...**.
    - Digit masking with reveal toggle, 1-click HWID clipboard copy, and "Remove License & Revert to Trial" capability.
    - Dedicated **AI Security Vault** tab with masked key displays, eye-reveal toggles, and hardware-vault key storage/deletion controls.
  - **Client Application Attestation & Backend Gatekeeper** (`src/middleware.ts`, `src/lib/security/attestation.ts`, `src/lib/api-client.ts`):
    - Enforces that backend API endpoints strictly accept requests originating from the authentic Selene client application (Tauri desktop, Electron shell, or authenticated Web frontend).
    - Requires valid cryptographic HMAC-SHA256 signatures (`X-Selene-Signature`), application attestation ID (`X-Selene-App-ID`), anti-replay timestamps (`X-Selene-Timestamp`), and verified active license attestation tokens (`X-Selene-License-Token`).
    - Automatically blocks unauthorized cURL scripts, Postman probes, web scrapers, and unlicensed callers with `401 Unauthorized` or `403 Forbidden`.

#### ☁️ Google Cloud Run Backend Containerization
- **Live Production Service**: [https://selene-h5zdysrkqa-uc.a.run.app](https://selene-h5zdysrkqa-uc.a.run.app)
- **Multi-Stage Container** (`Dockerfile`): Next.js standalone build running under dedicated non-root user (`nextjs:nodejs`), sub-100MB footprint, and instant cold-start response.
- **Container Health Probes** (`src/app/api/health/route.ts`): Liveness and readiness endpoints for Cloud Run and load balancers.
- **Automated Deployment Suite** (`tools/scripts/cloud/`):
  - `deploy-cloudrun.ps1` (PowerShell) & `deploy-cloudrun.sh` (Bash) for 1-click builds and Cloud Run deployment.
  - Integrated `npm run deploy:cloudrun` script.
- **Desktop Cloud Bridge** (`desktop-dist/index.html`): Configured to default to `https://selene-h5zdysrkqa-uc.a.run.app` with instant local dev toggle.

#### 📄 Proprietary License Transition
- Updated license terms to **Proprietary Source-Available License**.
- Copyright © 2026 **Abhishek Mitra (indoctrinatedrecluse)**. All rights reserved.
- Modification, transformation, redistribution, or commercial use strictly requires explicit prior written approval.

#### 👥 Real-Time Collaboration & Persistence
- Multiplayer CRDT editing powered by **Yjs** and **y-webrtc**.
- Document storage with SQLite / LibSQL database persistence and automatic localStorage fallback.

#### 🛠️ Polish, Explorer Architecture & Canvas Ambiance
- **Workspace Explorer & File Manager** (`src/components/editor/WorkspaceSidebar.tsx`):
  - Fixed CSS flexbox truncation bug ensuring document and folder titles never collapse and always display with high contrast and full width (`flex-1 min-w-0`).
  - Hierarchical folder structure separating `samples/` product showcase from user `documents/`.
  - Added custom folder creation (`+ Folder`), inline renaming (`Edit2`), and real-time multi-folder search.
- **Three Distinct Lunar Canvas Ambiance Themes** (`SeleneLunarBackground.tsx`, `SeleneEditor.tsx`):
  - *Titan Aura*: Sapphire night sky (`#060913`), pulsing cyan/sapphire lunar corona halo, and 75 drifting stardust particles.
  - *Starry Cosmos*: Deep interstellar violet void (`#080214`), vibrant galactic nebulae, 140+ dense galaxy stars with cross-flares, and animated meteor shooting stars.
  - *Midnight Dark*: Pure pitch obsidian (`#020305`), architectural 28px coordinate dot-matrix grid, and cold silver moonlit rim silhouette with 0% CPU overhead.
  - Global container, header, and footer theme adaptation with 1-click header switcher and `localStorage` persistence.
- **Engine Loading Screen & Sensitive URL Redaction** (`desktop-dist/index.html`, `electron/splash.html`, `SeleneLicenseModal.tsx`):
  - Redacted internal backend endpoints from initial desktop loading splash screens in favor of clean, user-friendly status messages ("Loading Selene polymorphic engine...").
  - Formatted network and license errors into human-readable alerts without exposing infrastructure URLs or stack traces.
