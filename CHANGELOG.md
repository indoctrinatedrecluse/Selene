# 🌙 Selene Changelog

All notable changes to the **Selene** technical document & code canvas platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-18

### 🌟 Initial Major Milestone Release — "Titan Edition"

This release marks the culmination of the 4 core roadmap pillars for Selene: Universal Visual Property Inspection, Publication & Export Suite, WebAssembly Computational Notebooks, and Native Desktop Packaging.

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
    - Stores license keys, HWID, seat lease, and validation heartbeat permanently across application updates and uninstalls.
  - **License Manager & Device Authority Modal** (`SeleneLicenseModal.tsx`):
    - Accessible via header badge or **Help -> Manage License & Device...**.
    - Digit masking with reveal toggle, 1-click HWID clipboard copy, and "Remove License & Revert to Trial" capability.

#### 📄 Proprietary License Transition
- Updated license terms to **Proprietary Source-Available License**.
- Copyright © 2026 **Abhishek Mitra (indoctrinatedrecluse)**. All rights reserved.
- Modification, transformation, redistribution, or commercial use strictly requires explicit prior written approval.

#### 👥 Real-Time Collaboration & Persistence
- Multiplayer CRDT editing powered by **Yjs** and **y-webrtc**.
- Document storage with SQLite / LibSQL database persistence and automatic localStorage fallback.
