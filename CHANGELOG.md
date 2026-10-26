# 🌙 Selene Changelog

All notable changes to the **Selene** technical document & code canvas platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-10-26

### 🌌 The Systems & Scientific Multiplatform Edition: WaveDrom, D2, WebAssembly (WAT), Typst, WebR (R), OpenSCAD 3D, Mobile Dual-Vault License Persistence, and Automated Multiplatform CI/CD

This major milestone completes both Phase 1 and Phase 2 of Selene's expanded multi-language live rendering engines across desktop and mobile, resolves mobile license persistence across app updates and restarts, unifies native Android APK releases into the automated GitHub Actions CI/CD matrix, and achieves complete cross-platform parity:

#### ⚡ 1. Phase 1: Systems, Hardware & Architecture Engines
- **WaveDrom Hardware Waveforms & Register Bitfield Maps (`wavedrom` / `regview`)**: High-precision vector rendering of digital clock cycles, bus transitions, signal states (`1`, `0`, `x`, `z`), cycle grids, protocol timings, and MMIO register bitfield maps with permission flags (`RO`, `RW`, `WO`). Vector SVG on PC and high-performance custom `_WaveDromPainter` on Flutter mobile.
- **D2 Modern Architecture DSL (`d2` / `d2lang`)**: Cloud microservices, system architectures, network dataflow DAGs, nested containers, and custom geometric node rendering (`cylinder`, `hexagon`, `circle`, `package`, `queue`, `rectangle`) with smooth orthogonal/bezier edge routing.
- **WebAssembly Text Format Stack Evaluator (`wat` / `wast`)**: Bytecode S-expression parser, interactive stack input runner (`$a`, `$b`), step-by-step instruction trace, and linear memory hex inspector on both desktop and mobile.
- **Showcase Sample**: `samples/21_wavedrom_d2_and_wat_systems_showcase.md`.

#### 🔬 2. Phase 2: Scientific, Statistical & 3D Parametric Engines
- **Athena's Academic Typesetter (`typst`)**: Publication-grade technical paper authoring with sub-20ms rendering, mathematical formula layout, academic parchment styling, theorem callouts, parameter matrix tables, and font scale controls on PC (`TypstRenderer.tsx`) and mobile canvas.
- **Apollo's Empirical Observatory (`r` / `webr`)**: Ordinary Least Squares (OLS) linear regression modeling, ANOVA variance decomposition, interactive stochastic noise simulation, 95% confidence interval bands, and authentic `summary(lm)` console readouts on PC (`RStatisticalRenderer.tsx`) and mobile canvas (`_RScatterPlotPainter`).
- **Daedalus's 3D Parametric Forge (`openscad` / `scad`)**: Constructive Solid Geometry (CSG) parametric CAD modeling with real-time 3D rotation, pitch/yaw touch drag gestures, directional celestial lighting, wireframe mode, and boolean cut/union AST inspection on PC (`OpenScadRenderer.tsx`) and mobile canvas (`_OpenScad3DPainter`).
- **Showcase Sample**: `samples/22_typst_webr_and_openscad_scientific_showcase.md`.

#### 📱 3. Mobile License Dual-Vault Persistence & App Update Retention
- **Dual-Vault Architecture**: Implemented redundant multi-tier storage in `LicenseService` leveraging both `SharedPreferences` and physical disk anchor vaults (`.selene_license_vault.json`) in application support and documents directories.
- **Auto-Recovery on Launch**: If SharedPreferences is wiped during APK update or reinstallation, all license metadata (`HWID`, `licenseKey`, `licenseType`, `username`, `expiresAt`, `trialInstalledAt`, and cryptographic HMAC signatures) are auto-recovered immediately from the disk anchor vault.
- **OS Auto-Backup Enablement**: Enabled `android:allowBackup="true"` and `android:fullBackupContent="true"` in `AndroidManifest.xml` to preserve application storage across updates.
- **Race Condition Prevention**: Instantiated and initialized `LicenseService` synchronously before `runApp()` to guarantee zero state flicker or unmounted access on app reopen.

#### 🚀 4. Automated CI/CD Android APK Release Workflow & Parity
- **Automated GitHub Actions Android APK Builds**: CI/CD release workflow builds `selene-v0.5.0-android.apk` with Flutter and Java 21, publishing it directly to GitHub Releases alongside desktop distributions.
- **Live Document Telemetry Footer**: Real-time Word Count, Character Count, and Reading Time metrics on mobile canvas.
- **Scriptorium Note Deletion & Autosave Resilience**: Fixed deletion race conditions with programmatic update guards and added 1-tap `UNDO` action.
- **22 Canonical Showcase Samples**: Full parity with 22 canonical samples accessible across desktop and mobile.

---

## [0.4.0] - 2026-10-20

### 🏛️ The Pan-Hellenic & Selene Lunar Titan Release: Polyglot LiveView & SwiftUI, Hermes Relay, Chronos Epoch Timeline, Orbit Link P2P, and Athena's Wisdom Suite

This milestone release expands Selene's technological frontier into 20 polyglot live execution sandboxes, introduces revolutionary peer-to-peer real-time co-authoring, weaves an immutable semantic revision timeline, and infuses a deeply authentic Greek mythological identity and astronomical synodic lunar tracking across the entire platform:

#### ⚡ 1. Phoenix of Olympus & Zephyr Swift Canvas (Phase 1)
- **Phoenix LiveView Interactive Simulation Engine (`heex` / `phoenix`)**:
  - Live in-document execution and reactive template simulation for Elixir / Phoenix LiveView HEEx templates.
  - Interactive assign modification (`@node_id`, `@latency_ms`, `@cpu_load`), `phx-click` event dispatch simulation, and state inspector.
  - Full showcase sample: `samples/16_phoenix_liveview_interactive_telemetry_dashboard.md`.
- **Zephyr Swift Canvas: Declarative SwiftUI Sandbox (`swift` / `swiftui`)**:
  - In-browser reactive SwiftUI view hierarchy simulator rendering declarative stacks (`VStack`, `HStack`, `ZStack`), `@State` variable bindings, `Toggle`, `Button`, `Slider`, and `Text` views.
  - Zero Xcode installation required; live interactive execution right in the literate document.
  - Full showcase sample: `samples/17_swiftui_reactive_declarative_canvas_spec.md`.

#### ⚡ 2. Hermes Relay: Interactive API & GraphQL Playground (Phase 2)
- **Multi-Grammar Request Engine (`http` / `rest` / `curl` / `graphql`)**:
  - Parses RFC 7230 HTTP request documents, raw cURL command snippets, and GraphQL queries into an interactive GUI request console.
  - Dynamic key-value header and query parameter editor with reactive add/edit/disable/remove rows.
  - Dual Execution Modes: Live network dispatches via the browser's Fetch API and offline Celestial Mock Mode with sub-millisecond telemetry.
  - Latency roundtrip timing (`ms`), payload weight measurement (`KB`), and JSON search filter with 1-click clipboard cURL export.
  - Full showcase sample: `samples/18_hermes_relay_api_and_graphql_playground.md`.

#### ⏳ 3. Chronos Timeline: Semantic Revisions & Visual Diff (Phase 3)
- **Cosmic Epoch Revision Control**:
  - In-memory and SQLite-backed snapshot persistence silently capturing document states during authoring.
  - Milestone Tagging (<kbd>Ctrl+S</kbd>): Label milestone checkpoints with human-readable tags (e.g. `[Alpha Architecture Approved]`).
  - Multi-Mode Visual Diffing:
    - **Unified Diff**: Line-by-line comparison with color-coded additions (emerald `+`) and deletions (rose `-`), line number gutters, and code block change counters.
    - **Side-by-Side (Split) Diff**: Responsive dual-column parallel inspection between historical epochs and current live text.
    - **Epoch Preview**: Raw text preview before restoring.
  - Safe Time-Warp Rollbacks: 1-click historical restoration with automatic safeguard checkpoints before rollback.
  - Full showcase sample: `samples/20_chronos_timeline_semantic_revisions_and_visual_diff.md`.

#### 🪐 4. Orbit Link: Zero-Setup P2P WebRTC Collaboration (Phase 4)
- **True Browser-to-Browser Co-Authoring**:
  - Real-time peer-to-peer document synchronization powered by WebRTC data channels and Yjs CRDTs.
  - Zero server database footprint: Keystrokes and text are exchanged directly over end-to-end peer meshes with zero cloud logging.
  - Olympian Callsigns & Presence: Customizable avatars, divine names, and color-coded peer presence indicators.
  - Ephemeral & Persistent Rooms: Instant 1-click invitation link generation for zero-friction peer onboarding.

#### 💡 5. Athena's Wisdom: Olympian Master Guidance & Tips Suite
- **Interactive In-App Guide Modal (<kbd>F1</kbd> / Header Button)**:
  - Complete 9-chapter guide covering Selene architecture, the 20 polyglot sandboxes directory, split-screen ergonomics, and pro tips.
  - Instant search across all tips, instructions, and code specimens.
  - Copyable code fence snippets for every supported engine.
  - Quick action jump links to launch Dual View, Whiteboard, Chronos, and Delphic Oracle directly from the guide.

#### 🏛️ 6. Pan-Hellenic Mythological Elevation & Astronomical Synodic Lunar Tracker
- **Astronomical Synodic Lunar Calendar & Diadem Widget**:
  - Real-time astronomical lunar calculator (`src/lib/lunar-calendar.ts`) calculating synodic moon phase ($29.53058867$-day cycle), illumination percentage, and classical Greek phase nomenclature (*Noumenia*, *Meniskos*, *Dichotomos*, *Amphikyrtos*, *Panselinos*) with Orphic Hymns to Selene.
  - Mounted in the header with celestial illumination glow and interactive popover.
- **The Delphic Oracle**: Elevated AI copilot with Pythian vapor aesthetics, Olympian divination presets, and support for all 20 code stacks.
- **Hephaestus's Subterranean Forge**: Lemnian forge-themed integrated terminal (`selene@olympus:~$`) with embers and quick presets.
- **Daedalus's Drawing Board**: Celestial whiteboard with *Calliope's Stylus*, *Iris's Prismatic Highlighter*, *Apollo's Golden Arrow*, *Euclidean Frame*, and *Selene's Meniskos Orb*.
- **The Dionysian Amphitheater**: Slide presentation deck with theater curtain transitions and *Scroll of Selene* stanza metrics.
- **Hermes' Transmutation & Wings Publishing Suite**: Mythologized paper-to-canvas ingest and 9-format publishing suite.
- **Scriptorium of Selene**: Rebranded workspace sidebar with *Pan-Hellenic Showcases*, *Sacred Scrolls*, and *Mnemosyne Local Vault*.

#### 🛠️ 7. Split-Pane & UI Ergonomic Polish
- **Symmetrical 50/50 Dual Pane Layout**: Fixed flex container sizing in Split MD and Dual View to prevent layout blowout or content squishing.
- **Synchronized Split MD Scrolling**: Bi-directional proportional scroll linking between the TipTap visual canvas and raw GFM textarea.
- **Horizontal Split Fix**: Resolved Tailwind CSS height rule conflict in `SecondaryDocumentViewer` ensuring clean stacked horizontal multi-document layouts.
- **Responsive Epoch Diff**: Enhanced side-by-side split diff in `ChronosTimelineDrawer` with responsive wrapping and scroll bounds.

---

## [0.3.0] - 2026-10-19

### 🚀 Grand Feature Release: Intelligent Canvas, Deep Data OLAP, Desktop Tooling, Publishing Suite & Dual-View Ergonomics

This monumental release delivers all 5 phases of the Selene Advanced Roadmap (v0.3.0 — v0.4.0), establishing Selene as the premier literate technical computing and publishing platform:

#### 🧠 Phase 1: AI & Intelligent Canvas
- **Inline Ghostwriting & Tab-Completion** (`Tab` to Accept, `Esc` to Dismiss, `Alt+G` to Toggle):
  - Intelligent context-aware prose continuation and polyglot code block completion (TSX, Python, SQL, Rust, GLSL).
  - Powered by Gemini 2.5 Flash through hardware-bound vault keys with instant offline heuristic fallbacks.
- **"Explain & Auto-Fix" Lens for Live Sandboxes**:
  - Universal runtime error and syntax exception boundary across WebGL shaders, SQL studios, and Python Pyodide runtimes.
  - Interactive diagnostic card offering human-readable root cause explanations and 1-click AST code repair via `/api/ai/fix`.
- **Multimodal Paper-to-Canvas Ingestion**:
  - Drag-and-drop research paper PDFs, whitepapers, architectural diagrams, and clipboard screenshots.
  - Automated vision extraction translating math formulas into KaTeX, architecture flowcharts into Mermaid, and text into structured GFM.

#### 📊 Phase 2: Deep Data & Analytical Sandboxes
- **Declarative Charting Engine (`chart` / `plot`)**:
  - High-performance responsive vector SVG renderer (`DeclarativeChartRenderer.tsx`) supporting Bar (grouped/stacked), Line (smooth Catmull-Rom), Area, Scatter, Donut/Pie, and Heatmap matrices.
  - Interactive hover tooltips, live chart type switcher, bidirectional JSON specification editor, tabular data inspector, and 1-click SVG/CSV downloads.
- **DuckDB-WASM In-Browser Analytical OLAP Studio (`duckdb` / `parquet` / `olap`)**:
  - In-memory vectorized columnar SQL engine (`DuckDbStudioRenderer.tsx`) executing aggregations (`AVG`, `SUM`, `COUNT`, `MIN`, `MAX`), groupings, filters, and window functions with sub-10ms latency.
  - Built-in multi-thousand row real-world datasets (`telemetry_logs`, `fintech_orders`, `ecommerce_sales`) with schema inspector, query templates, search, pagination, and CSV export.
- **Bi-directional Jupyter Notebook (`.ipynb`) Bridge**:
  - Complete format bridge (`src/lib/ipynb-bridge.ts`) compliant with nbformat v4.5.
  - 1-click **Import `.ipynb`**: Drag & drop onto editor canvas or select in sidebar; converts Markdown and Python cells while preserving figures and output streams.
  - 1-click **Export `.ipynb`**: Dedicated tab in `PublishExportModal.tsx` for 1-click download and clipboard JSON copy.

#### 🖥️ Phase 3: Native Desktop Power-Features
- **Local Folder Binding & Real-Time Disk Sync**:
  - Mount external local directories directly via the HTML5 File System Access API (`src/lib/disk-sync.ts`).
  - Two-way disk synchronization flushing markdown edits directly to local filesystem with real-time status badges.
- **Integrated Git Source Control Drawer**:
  - Dedicated sidebar tab (`GitSourceControlDrawer.tsx`) with staged and unstaged file tracking.
  - Stage/unstage all or individual files, visual unified diff modal (`FileDiff`), and commit authoring with <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.
- **Collapsible Command Runner & Shell Tray**:
  - Bottom drawer shell tray (`CollapsibleCommandRunner.tsx`) toggled via <kbd>Ctrl</kbd>+<kbd>`</kbd> or footer toolbar button.
  - Quick preset tasks (`npm test`, `git status`, `npm run build`), arbitrary CLI execution prompt, ANSI color formatting, and execution telemetry badges.

#### 🌐 Phase 4: Publishing & Sharing Ecosystem (Flagship Pillar)
- **Zero-Dependency Standalone HTML Export ("Single-File Web App")**:
  - Fully portable self-contained `.html` export (`src/lib/html-export.ts`) embedding Tailwind CSS styling, KaTeX fonts, Mermaid SVG diagrams, and interactive sandbox runtimes. Runs 100% offline in any browser with zero servers.
- **Publication-Grade Academic LaTeX & Print PDF Engine**:
  - Standards-compliant LaTeX generator (`src/lib/latex-export.ts`) supporting `article`, `IEEEtran`, `acmart`, and Springer `llncs` templates with equation environments, listings, and callouts.
  - Clean publication print PDF engine (`src/lib/pdf-export.ts`) with custom page sizes, orientations, and dark/light themes.
- **Selene Cloud Share & Interactive Gists (`/share/[id]`)**:
  - Full-stack cloud sharing infrastructure on Google Cloud Run with SQLite/Drizzle persistence (`shared_documents` table).
  - High-performance short URLs (`sh_...`), SHA-256 passphrase hashing for protected documents, configurable expiration timers (1h, 24h, 7d, never), and atomic view counter incrementing.
  - Zero-dependency vector SVG QR code generator (`src/lib/qr-code.ts`) embedded for instant mobile access.
  - Dynamic App Router page (`/share/[id]`) with Suspense boundary for partial prerendering, password unlock screen, expiration alerts, and one-click "Clone into Selene".
- **Public Embeds (`<iframe>` & React) & Standalone Slide Decks**:
  - Dedicated embed generator (`src/lib/embed-generator.ts`) generating responsive HTML `<iframe>` and React TSX snippet codes with `?embed=true` mode for Notion, Docusaurus, and developer documentation portals.
  - Standalone offline HTML presentation deck exporter (`src/lib/slide-deck-export.ts`) with keyboard navigation (<kbd>←</kbd> / <kbd>→</kbd> / <kbd>Space</kbd>) and fullscreen projection.
- **Static Site Generator (SSG) Export**:
  - Specialized formatters (`src/lib/ssg-export.ts`) with YAML/TOML frontmatter and native admonition syntax for Astro Starlight, Nextra, Docusaurus 3, and Hugo.

#### 📐 Phase 5: Canvas Ergonomics & Collaboration
- **Multi-Document Split-Screen (Dual View)**:
  - Dedicated secondary pane component (`src/components/editor/SecondaryDocumentViewer.tsx`) enabling simultaneous authoring and reference across any two workspace documents.
  - Independent document picker in secondary header; supports vertical split (side-by-side) and horizontal split (stacked).
  - Dual View Submodes: Interactive **Rendered Canvas** (KaTeX, Mermaid, DuckDB, Declarative Charts) and editable **Raw Markdown** with instant bi-directional persistence.
  - Proportional **Synchronized Scrolling** engine linking vertical scroll telemetry across primary and secondary buffers.
  - Instant 1-click **Pane Swapping** (<kbd>ArrowLeftRight</kbd>) and global shortcut toggle (<kbd>Alt+D</kbd>).
- **Freehand Whiteboard Annotation & Sketching Overlay**:
  - High-performance transparent drawing canvas (`src/components/whiteboard/WhiteboardOverlay.tsx`) overlaid directly above prose, code sandboxes, equations, and charts.
  - Comprehensive drawing toolset: Freehand Pen, Translucent Highlighter, Architectural Vector Arrows, Geometric Bounding Boxes, Ellipses, and Eraser.
  - Multi-color palette (Cyan, Emerald, Amber, Rose, Violet, White) with 3 stroke weight presets (Fine, Medium, Bold).
  - Full Undo/Redo stack (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>) and Clear Canvas action.
  - **Interaction Passthrough Mode**: Allows interacting with sandboxes and text underneath while sketches remain visible.
  - 1-click **Snapshot Embedding**: Inserts drawings as timestamped images directly into the active document.
  - 1-click **Transparent PNG Export**: Downloads standalone high-resolution sketches.
  - Persistent per-document annotations saved in `localStorage` keyed by document ID.
  - Global shortcut toggle (<kbd>Alt+W</kbd>) and header toolbar button.

#### 📂 19 Audited Showcase Templates & Storage v15 Migration
- Comprehensive starter document gallery covering all 19 technologies and workflow patterns (`01_` through `19_`).
- Upgraded persistent storage migration key to `selene_documents_v15`, ensuring existing user notes remain completely preserved while automatically hydrating new showcases.

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
