# 🌙 Selene Product Showcase & Sample Gallery

This directory contains curated, production-grade sample documents demonstrating Selene's full spectrum of capabilities across live frameworks, WebAssembly computation, vector diagrams, and slide decks.

---

## 📂 Included Samples

1. [`01_selene_architecture_and_live_canvas.md`](./01_selene_architecture_and_live_canvas.md)
   - Technical architecture overview.
   - Live React + Tailwind sandbox with interactive Tweak Props visual inspector.
   - Mermaid.js sequence diagram with SVG rendering.
   - High-performance KaTeX math formula.

2. [`02_interactive_web_ui_components.md`](./02_interactive_web_ui_components.md)
   - Metric throughput counter card (React 19 + Tailwind v4).
   - Single File Component (Vue 3 Composition API).
   - Reactive compiler snippet (Svelte 5).

3. [`03_angular_and_flutter_showcase.md`](./03_angular_and_flutter_showcase.md)
   - Apollo Guidance Computer component (Angular Ivy with scoped CSS).
   - Selene Lunar Station interactive widget (Flutter 3.x / Dart CanvasKit WebAssembly).

4. [`04_python_wasm_datascience_notebook.md`](./04_python_wasm_datascience_notebook.md)
   - Apollo/Artemis Trans-Lunar Injection (TLI) orbit simulation with Matplotlib figure generation.
   - Monte Carlo Pi & lunar crater impact estimation with NumPy (200,000 samples).
   - Lunar Rover telemetry time series DataFrame with Pandas.

5. [`05_presentation_slide_deck_demo.md`](./05_presentation_slide_deck_demo.md)
   - Multi-slide presentation deck.
   - Live running widgets executing directly on slides.
   - Press **Deck Mode** or `F5` to present.

6. [`06_php_laravel_blade_showcase.md`](./06_php_laravel_blade_showcase.md)
   - PHP 8.3 & Laravel 11 Blade engine integration.
   - In-browser Blade directive parsing (`@php`, `@foreach`, `@if`, `{{ }}`).
   - Client-side Alpine.js 3.x reactivity & Tailwind CSS styling.
   - Dual-runtime support (in-browser sandbox & local `php artisan serve` bridge).

7. [`07_ruby_on_rails_erb_showcase.md`](./07_ruby_on_rails_erb_showcase.md)
   - Ruby 3.3 & Rails 8.0 ERB engine integration.
   - In-browser ERB scriptlet and helper parsing (`<%= turbo_frame_tag %>`, `<%= number_to_currency %>`, `<%= pluralize %>`).
   - Hotwire Turbo Frames and Stimulus controller simulation.
   - Dual-runtime support (in-browser sandbox & local `bin/rails server` Puma bridge).

8. [`08_go_template_hugo_showcase.md`](./08_go_template_hugo_showcase.md)
   - Go 1.23 `html/template` & Hugo static site template engine integration.
   - In-browser parser for variables (`{{ .Field }}`), loops (`{{ range }}`), conditionals (`{{ if }}`), and pipeline filters (`upper`, `len`).
   - Embedded mock context evaluation with 0ms latency.
   - Dual-runtime support (in-browser sandbox & local Go HTTP server bridge on port 8080).

9. [`09_django_jinja2_python_showcase.md`](./09_django_jinja2_python_showcase.md)
   - Python 3.12, Django Template Language (DTL), and Jinja2 engine integration.
   - In-browser parser for template filters (`|upper`, `|length`), control tags (`{% for %}`, `{% if %}`), and context variables.
   - Fast client-side sandbox execution with Tailwind CSS styling.
   - Dual-runtime support (in-browser sandbox & local Django / FastAPI server bridge on port 8000).

10. [`10_rust_yew_leptos_showcase.md`](./10_rust_yew_leptos_showcase.md)
    - Rust WebAssembly (`wasm32-unknown-unknown`) component live execution.
    - Evaluates Yew `html! { ... }` and Leptos `view! { ... }` macros with fine-grained reactivity.
    - Zero GC overhead, thread-safety verification, and linear memory telemetry.
    - Dual-runtime support (in-browser sandbox & local `trunk serve` bridge on port 8080).

11. [`11_sql_sqlite_libsql_showcase.md`](./11_sql_sqlite_libsql_showcase.md)
    - In-browser SQL & LibSQL Data Studio with relational query execution.
    - Real-time evaluation of `SELECT`, `JOIN`, `GROUP BY`, and aggregate functions with sub-millisecond latency.
    - Interactive results grid with column sorting, live row filtering, and CSV export.
    - Pre-seeded with `celestial_missions`, `telemetry_nodes`, and `crew_manifest`.

12. [`12_glsl_webgl_shaders_showcase.md`](./12_glsl_webgl_shaders_showcase.md)
    - Hardware-accelerated WebGL fragment shader canvas.
    - Interactive uniforms: `u_time`, `u_resolution`, `u_mouse`.
    - Live animation controls, pause/play, time reset, and live FPS counter.
    - Preloaded with cosmic nebula, raymarched sphere, and cyber grid presets.

13. [`13_declarative_vector_charts_showcase.md`](./13_declarative_vector_charts_showcase.md)
    - Pure SVG multi-series visualization engine (bar, line, area, scatter, donut, pie, and heatmap).
    - Declarative JSON specifications with interactive tooltips, custom color palettes, and cubic-bezier curves.
    - Publication-ready SVG and CSV data exports directly from the chart header.

14. [`14_duckdb_analytical_olap_showcase.md`](./14_duckdb_analytical_olap_showcase.md)
    - Sub-10ms in-browser columnar vector processing and analytical SQL engine (DuckDB OLAP).
    - Preloaded with `telemetry_logs`, `fintech_orders`, and `ecommerce_sales` high-density datasets.
    - Complex analytical SQL queries: `AVG`, `MAX`, `MIN`, `COUNT(*)`, `GROUP BY`, `ORDER BY`, `LIMIT`.
    - Real-time column sorting, search filtering, pagination, and CSV data exports.

15. [`15_dual_document_and_whiteboard_showcase.md`](./15_dual_document_and_whiteboard_showcase.md)
    - Side-by-side Dual Document canvas with vertical and horizontal split views.
    - Synchronized scroll locking across parallel documents for seamless side-by-side reading and editing.
    - Freeform Whiteboard drawing overlay with pen, highlighter, shapes, arrow annotations, and PNG export.

16. [`16_elixir_phoenix_liveview_showcase.md`](./16_elixir_phoenix_liveview_showcase.md)
    - Phoenix of Olympus: Elixir 1.16 & Phoenix 1.7 LiveView HEEx engine integration.
    - In-browser compiler for assigns (`@cluster`), maps (`%{}`), loops (`<%= for %>`), conditionals (`<%= if %>`), and interactive `phx-click` events.
    - Dual-runtime support (in-browser sandbox & local `mix phx.server` on port 4000).

17. [`17_swift_swiftui_multiplatform_showcase.md`](./17_swift_swiftui_multiplatform_showcase.md)
    - Zephyr Swift Canvas: Apple Swift & SwiftUI multiplatform declarative UI engine.
    - In-browser parser for `@State` reactive bindings, `VStack`/`HStack`/`ZStack` view hierarchies, SF Symbols, and Cupertino dark mode components.
    - Dual-runtime support (in-browser sandbox & local Swift server on port 8080).

18. [`18_hermes_relay_api_and_graphql_showcase.md`](./18_hermes_relay_api_and_graphql_showcase.md)
    - Hermes Relay: Interactive API, REST, cURL & GraphQL playground engine.
    - Dynamic headers & query parameter editors, latency telemetry, JSON formatting, search filter, and cURL generation.
    - Dual-runtime support (live browser Fetch & offline Olympus Gateway mock mode).

19. [`19_chronos_timeline_revision_history_showcase.md`](./19_chronos_timeline_revision_history_showcase.md)
    - Chronos Timeline: Semantic document revision history & visual diff drawer.
    - Automated background checkpoints, milestone tagging, Myers-inspired visual diffing (unified & side-by-side), and time-warp restore with pre-rollback safety.

---

## 🚀 How to Open in Selene

- **In the Web App**:
  - Click **Open File** (`Ctrl+O`) in the top navigation bar and select any `.md` file from this folder.
- **In Desktop Shell** (Tauri / Electron):
  - Use `File -> Open Local File...` (`Ctrl+O`) or click the **Open** button in the header.
- **Via Terminal**:
  ```bash
  # Launch desktop app and load directly
  ./tools/scripts/desktop/run-desktop.ps1
  ```
