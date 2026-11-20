import fs from "fs";
import path from "path";
import { STARTER_TEMPLATES } from "../src/lib/workspace-store";

console.log(`Starting sync for ${STARTER_TEMPLATES.length} canonical showcase templates...`);

const mobileDir = path.resolve("mobile/assets/samples");
const pcDir = path.resolve("samples");

if (!fs.existsSync(mobileDir)) {
  fs.mkdirSync(mobileDir, { recursive: true });
}
if (!fs.existsSync(pcDir)) {
  fs.mkdirSync(pcDir, { recursive: true });
}

// 1. Clean existing sample files in root samples/ that are obsolete
const pcExisting = fs.readdirSync(pcDir).filter((f) => f.endsWith(".md") && f !== "README.md");
for (const f of pcExisting) {
  const isCanonical = STARTER_TEMPLATES.some((t) => t.title === f);
  if (!isCanonical) {
    console.log(`Removing obsolete root sample: ${f}`);
    fs.unlinkSync(path.join(pcDir, f));
  }
}

// 2. Write all 26 canonical showcase documents to both directories
for (const [idx, t] of STARTER_TEMPLATES.entries()) {
  let content = t.content;

  // Ensure content does not start with stray backtick
  if (content.startsWith("`#") || content.startsWith("`")) {
    content = content.replace(/^`+/, "");
  }

  // Ensure escaped backticks are normalized to standard markdown triple-backticks
  content = content.replace(/\\`\\`\\`/g, "```");
  content = content.replace(/\\`/g, "`");

  // Ensure line endings are standard unix newlines
  content = content.replace(/\r\n/g, "\n");

  // Ensure trailing newline
  if (!content.endsWith("\n")) {
    content += "\n";
  }

  const mobileFilePath = path.join(mobileDir, t.title);
  const pcFilePath = path.join(pcDir, t.title);

  fs.writeFileSync(mobileFilePath, content, "utf8");
  fs.writeFileSync(pcFilePath, content, "utf8");

  console.log(`[${idx + 1}/26] Synchronized "${t.title}" (${content.length} bytes, ${content.split("\n").length} lines)`);
}

// 3. Write comprehensive README.md in both directories
const readmeContent = `# 🌙 Selene Canonical Showcase & Polymorphic Engine Gallery

This directory contains the 26 canonical, production-grade technical showcase documents demonstrating Selene's complete spectrum of AST-native authoring, live WebAssembly sandboxes, hardware timing waveforms, vector graphics, and multiplatform frameworks.

---

## 📂 Canonical Showcase Index (26 Exhibits)

| # | Filename | Exhibit Name | Core Engine / Stack |
| :---: | :--- | :--- | :--- |
| **01** | \`01_selene_architecture_and_live_canvas.md\` | Selene Architecture & Canvas | React 19 + Tailwind, Mermaid AST, KaTeX Math |
| **02** | \`02_react_tailwind_ui_components.md\` | React & Multi-Stack Web UI | React 19, Vue 3.5, Svelte 5, Angular 19, Flutter |
| **03** | \`03_angular_signals_web_components.md\` | Angular Ivy & Signals Showcase | Angular 19 Zoneless Signals Component |
| **04** | \`04_flutter_dart_web_canvas.md\` | Flutter & Dart Web Showcase | Flutter Material 3 Hardware Simulation |
| **05** | \`05_python_pyodide_data_science_notebook.md\` | Python & Pyodide Data Science | Pyodide Python 3.12, NumPy, Matplotlib, Pandas |
| **06** | \`06_php_laravel_blade_engine.md\` | PHP & Laravel 11 Blade Engine | Laravel 11 Blade Directives & Artisan Runtime |
| **07** | \`07_ruby_on_rails_erb_engine.md\` | Ruby on Rails 8.0 & ERB Engine | Rails 8 Hotwire Turbo Frames & ActionView |
| **08** | \`08_go_hugo_html_template_engine.md\` | Go Template & Hugo Engine | Go 1.23 html/template Pipelines & Hugo SSG |
| **09** | \`09_django_jinja2_python_engine.md\` | Django & Jinja2 Template Engine | Django 5.1 & Jinja2 Context Interpolation |
| **10** | \`10_rust_wasm_yew_leptos.md\` | Rust WebAssembly (Yew & Leptos) | Rust WASM32 Fine-Grained Reactive Engine |
| **11** | \`11_sql_sqlite_data_studio.md\` | SQL & LibSQL In-Browser Studio | In-Memory SQLite/LibSQL Relational DDL & Queries |
| **12** | \`12_webgl_glsl_canvas_shaders.md\` | WebGL Canvas Shader Engine | GLSL Raymarching Fragment Shader (60 FPS) |
| **13** | \`13_declarative_charts_and_plots.md\` | Declarative Charting & Plots | Bar, Line, Area, and Donut SVG Canvas Charts |
| **14** | \`14_duckdb_wasm_analytical_olap.md\` | DuckDB-WASM Analytical OLAP | Vectorized Columnar SIMD Processing & Parquet |
| **15** | \`15_jupyter_notebook_colab_bridge.md\` | Jupyter Notebook & Colab Bridge | Dual-Directional .ipynb Computational Cells |
| **16** | \`16_local_folder_sync_and_git_source_control.md\` | Local Folder Sync & Git Control | Desktop File System Binding & Git Branch/Commit |
| **17** | \`17_distributed_api_rfc_specification.md\` | Distributed API RFC Specification | Telemetry Contracts & Architecture Diagrams |
| **18** | \`18_publishing_cloud_sharing_and_academic_export.md\` | Publishing, Cloud & LaTeX Export | Zero-Dependency HTML, Gists & KaTeX Formulations |
| **19** | \`19_dual_view_split_screen_and_whiteboard_annotations.md\` | Dual View & Whiteboard Markup | Multi-Document Parallel Panes & Touch Overlay |
| **20** | \`20_elixir_phoenix_liveview_showcase.md\` | Elixir & Phoenix LiveView | Phoenix of Olympus HEEx Real-Time Telemetry |
| **21** | \`21_swift_swiftui_multiplatform_showcase.md\` | Swift & SwiftUI Multiplatform | Zephyr Swift Cupertino View Trees & State Toggles |
| **22** | \`22_hermes_relay_api_and_graphql_showcase.md\` | Hermes Relay API & GraphQL | HTTP, cURL, and GraphQL Gateway Playground |
| **23** | \`23_chronos_timeline_revision_history_showcase.md\` | Chronos Timeline Revisions | Immutable Epoch Snapshots & Semantic Diff Inspector |
| **24** | \`24_orbit_link_p2p_collaboration_showcase.md\` | Orbit Link P2P Collaboration | WebRTC CRDT Peer Mesh & Pantheon Personas |
| **25** | \`25_wavedrom_d2_and_wat_systems_showcase.md\` | WaveDrom, D2 & WASM (WAT) | SPI Digital Timing, Architecture DAGs & Bytecode |
| **26** | \`26_typst_webr_and_openscad_scientific_showcase.md\` | Typst, WebR & OpenSCAD | Athena Academic Paper, OLS Regression & 3D CAD |

---

*Authored for the Selene Hypermodern Technical Document & Code Canvas.*
`;

fs.writeFileSync(path.join(mobileDir, "README.md"), readmeContent, "utf8");
fs.writeFileSync(path.join(pcDir, "README.md"), readmeContent, "utf8");

console.log("Synchronization complete! 26 showcase files + README.md written to both mobile and PC directories.");
