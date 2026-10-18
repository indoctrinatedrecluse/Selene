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
