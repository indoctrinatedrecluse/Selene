# 🌙 Selene Changelog

All notable changes to the **Selene** technical document & code canvas platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-10-18

### 🌟 Major Feature Release: Polyglot Live Renders, AI Canvas Copilot & Visual Diff Suite

This release delivers the complete Sprint 2 & Sprint 3 capabilities across the Selene canvas platform:

#### ✨ Selene AI Canvas Copilot (Hardware-Bound Vault Integration)
- **Direct Vault Credential Access**: Automatically decrypts Google Gemini API keys stored in `HKCU\Software\Selene\Vault` using hardware-bound AES-256-GCM authenticated encryption.
- **Multi-Modal Generation On Demand**: Generates Mermaid diagrams (Flowcharts, Sequences, Architecture, ERD), KaTeX LaTeX formulas, and multi-stack UI snippets from natural language prompts.
- **Zero-Config Offline Fallback**: Features built-in heuristic template generation for instant offline usability when no external API key is configured.
- **Global Shortcut & Header Bar Access**: Accessible via `Ctrl+Shift+A` or the glowing `AI Copilot` pill in the navigation header, with 1-click canvas insertion.

#### 🔍 Visual Diff Inspector in Revision History Drawer
- **Line-by-Line LCS Diff Algorithm** (`src/lib/diff-engine.ts`): Computes precise insertions, deletions, and unchanged segments with line number tracking and statistics.
- **Dual Diff Views**:
  - *Unified Diff View*: Inline view with green additions (`+`), red deletions (`-`), and line numbers.
  - *Side-by-Side Split View*: Dual-pane synchronized comparison between selected revisions and current editor content or previous snapshots.
- **1-Click Rollback**: Restore any past version directly from the diff inspector interface.

#### 🦀 Rust WebAssembly (Yew & Leptos) Live Render Engine (`RustWasmRenderer.tsx`)
- **RSX Macro Compilation**: Parses and renders Rust `html! { ... }` (Yew) and `view! { ... }` (Leptos) macros into reactive sandboxed elements with Tailwind CSS.
- **Linear Memory & Telemetry Tracking**: Real-time display of memory allocation and thread safety status.
- **Dual Execution Runtime**: Instant in-browser WASM sandbox + local Trunk/Cargo dev server bridge on port 8080.
- **Visual Property Inspector Integration**: Bi-directional AST synchronization for titles, counter states, padding, corners, and themes.

#### 🗄️ SQL & LibSQL In-Browser Data Studio (`SqlDataStudioRenderer.tsx`)
- **Interactive Relational Query Studio**: In-browser execution of `SELECT`, `JOIN`, `GROUP BY`, and aggregate SQL queries over pre-seeded space mission datasets.
- **Interactive Results Grid**: Real-time column sorting, live substring filtering, execution latency badges, and 1-click CSV data export.
- **Schema Explorer**: Collapsible panel listing active table structures (`celestial_missions`, `telemetry_nodes`, `crew_manifest`).

#### 🌌 WebGL & GLSL Canvas Shader Engine (`ShaderCanvasRenderer.tsx`)
- **Hardware-Accelerated Fragment Shaders**: Full WebGL2/WebGL1 GPU rendering loop over HTML5 `<canvas>`.
- **Standard Shader Uniforms**: Supplies `u_time`, `u_resolution`, and normalized `u_mouse` cursor coordinates.
- **Playback Controls**: Play, pause, time reset, and real-time FPS performance monitoring.
- **Built-in Curated Presets**: Cosmic Lunar Nebula (FBM Plasma), Raymarched Titan Orb (3D Sphere SDF), and Cyber Grid Waves.

#### 🐹 Go (Hugo) & 🐍 Django (Jinja2) Live Engines
- **Go `html/template` Engine** (`GoTemplateRenderer.tsx`): Evaluates Go variables, loops (`range`), conditionals (`if eq`), filters (`upper`, `len`), and embedded JSON context blocks.
- **Django & Jinja2 Engine** (`DjangoJinjaRenderer.tsx`): Evaluates Django Template Language and Jinja2 variables, tags (`{% for %}`), and filters (`|upper`, `|length`).
- **Local Server Bridges**: Connect directly to Go servers (port 8080) and Django/FastAPI servers (port 8000).

#### 🐘 PHP (Laravel) & 💎 Ruby (Rails) Live Engines
- **Laravel Blade Engine** (`PhpLaravelRenderer.tsx`): In-browser Blade directives with Alpine.js 3.x reactivity.
- **Rails ERB Engine** (`RubyRailsRenderer.tsx`): In-browser ERB scriptlets with Hotwire Turbo Frames and Stimulus simulation.

#### 📁 Comprehensive 12-Document Showcase Gallery & v10 Storage Migration
- Curated sample documents in `samples/` and `STARTER_TEMPLATES` covering all 12 live stacks.
- Upgraded persistent storage migration key to `selene_documents_v10`, ensuring existing user notes remain completely preserved while hydrating new showcases.

---

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
