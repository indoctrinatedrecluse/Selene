import 'package:flutter/services.dart';

class SampleItem {
  final String id;
  final String filename;
  final String title;
  final String subtitle;
  final String icon;
  final String category;

  const SampleItem({
    required this.id,
    required this.filename,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.category,
  });

  String get assetPath => 'assets/samples/$filename';
}

class SampleService {
  static const List<SampleItem> allSamples = [
    SampleItem(
      id: 'sample-01',
      filename: '01_selene_architecture_and_live_canvas.md',
      title: 'Selene Architecture & Canvas',
      subtitle: 'AST nodes, Sandboxes & Titan lore',
      icon: '🌙',
      category: 'Core Architecture',
    ),
    SampleItem(
      id: 'sample-02',
      filename: '02_react_tailwind_ui_components.md',
      title: 'React & Tailwind UI Components',
      subtitle: 'Interactive UI widgets & hooks',
      icon: '⚡',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-03',
      filename: '03_angular_signals_web_components.md',
      title: 'Angular Signals & Web Components',
      subtitle: 'Reactive state & signals computation',
      icon: '🅰️',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-04',
      filename: '04_flutter_dart_web_canvas.md',
      title: 'Flutter & Dart Web Canvas',
      subtitle: 'Hot-reloading widget tree & rendering',
      icon: '💙',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-05',
      filename: '05_python_pyodide_data_science_notebook.md',
      title: 'Python & Pyodide Data Science',
      subtitle: 'NumPy, Pandas & Pyodide runtime',
      icon: '🐍',
      category: 'Data Science',
    ),
    SampleItem(
      id: 'sample-06',
      filename: '06_php_laravel_blade_engine.md',
      title: 'PHP & Laravel Blade Engine',
      subtitle: 'Blade directives & artisan templates',
      icon: '🐘',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-07',
      filename: '07_ruby_on_rails_erb_engine.md',
      title: 'Ruby on Rails ERB Engine',
      subtitle: 'Hotwire Turbo & ActionView partials',
      icon: '💎',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-08',
      filename: '08_go_hugo_html_template_engine.md',
      title: 'Go & Hugo Template Engine',
      subtitle: 'Static site generation & pipelines',
      icon: '🐹',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-09',
      filename: '09_django_jinja2_python_engine.md',
      title: 'Django & Jinja2 Python Engine',
      subtitle: 'Template tags & context filters',
      icon: '🌐',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-10',
      filename: '10_rust_wasm_yew_leptos.md',
      title: 'Rust WASM (Yew & Leptos)',
      subtitle: 'Fine-grained reactivity in WebAssembly',
      icon: '🦀',
      category: 'Systems & WASM',
    ),
    SampleItem(
      id: 'sample-11',
      filename: '11_sql_sqlite_data_studio.md',
      title: 'SQL & SQLite Data Studio',
      subtitle: 'Relational queries & schema DDL',
      icon: '🗄️',
      category: 'Database & SQL',
    ),
    SampleItem(
      id: 'sample-12',
      filename: '12_webgl_glsl_canvas_shaders.md',
      title: 'WebGL & GLSL Canvas Shaders',
      subtitle: 'Fragment shaders & raymarching',
      icon: '🔮',
      category: 'Graphics & Math',
    ),
    SampleItem(
      id: 'sample-13',
      filename: '13_declarative_charts_and_plots.md',
      title: 'Declarative Charts & Plots',
      subtitle: 'Vega-Lite & Mermaid diagrams',
      icon: '📊',
      category: 'Data Science',
    ),
    SampleItem(
      id: 'sample-14',
      filename: '14_duckdb_wasm_analytical_olap.md',
      title: 'DuckDB WASM Analytical OLAP',
      subtitle: 'Vectorized columnar query processing',
      icon: '🦆',
      category: 'Database & SQL',
    ),
    SampleItem(
      id: 'sample-15',
      filename: '15_jupyter_notebook_colab_bridge.md',
      title: 'Jupyter Notebook & Colab Bridge',
      subtitle: 'Bi-directional .ipynb conversion',
      icon: '📓',
      category: 'Data Science',
    ),
    SampleItem(
      id: 'sample-16',
      filename: '16_local_folder_sync_and_git_source_control.md',
      title: 'Local Folder Sync & Git Control',
      subtitle: 'Desktop disk binding & commit drawer',
      icon: '⚡',
      category: 'Developer Tools',
    ),
    SampleItem(
      id: 'sample-17',
      filename: '17_distributed_api_rfc_specification.md',
      title: 'Distributed API RFC Specification',
      subtitle: 'Architecture diagrams & contracts',
      icon: '📋',
      category: 'Architecture',
    ),
    SampleItem(
      id: 'sample-18',
      filename: '18_publishing_cloud_sharing_and_academic_export.md',
      title: 'Publishing, Cloud & LaTeX Export',
      subtitle: 'Zero-dependency HTML & Gists',
      icon: '🚀',
      category: 'Publishing',
    ),
    SampleItem(
      id: 'sample-19',
      filename: '19_dual_view_split_screen_and_whiteboard_annotations.md',
      title: 'Dual View & Whiteboard Markup',
      subtitle: 'Multi-document split & touch overlay',
      icon: '📐',
      category: 'Creative Canvas',
    ),
    SampleItem(
      id: 'sample-20',
      filename: '20_elixir_phoenix_liveview_showcase.md',
      title: 'Elixir & Phoenix LiveView',
      subtitle: 'HEEx templates & fault-tolerant actors',
      icon: '🔥',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-21',
      filename: '21_swift_swiftui_multiplatform_showcase.md',
      title: 'Swift & SwiftUI Multiplatform',
      subtitle: 'Declarative view hierarchy & Cupertino',
      icon: '💨',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-22',
      filename: '22_hermes_relay_api_and_graphql_showcase.md',
      title: 'Hermes Relay API & GraphQL',
      subtitle: 'Cryptographic relay & schema introspection',
      icon: '⚡',
      category: 'API & Networking',
    ),
    SampleItem(
      id: 'sample-23',
      filename: '23_chronos_timeline_revision_history_showcase.md',
      title: 'Chronos Timeline Revisions',
      subtitle: 'Immutable snapshots & diff trees',
      icon: '⏳',
      category: 'Core Architecture',
    ),
    SampleItem(
      id: 'sample-24',
      filename: '24_orbit_link_p2p_collaboration_showcase.md',
      title: 'OrbitLink P2P Collaboration',
      subtitle: 'WebRTC data channels & CRDT sync',
      icon: '🪐',
      category: 'Collaboration',
    ),
    SampleItem(
      id: 'sample-25',
      filename: '25_wavedrom_d2_and_wat_systems_showcase.md',
      title: 'WaveDrom, D2 & WASM (WAT)',
      subtitle: 'Timing pulses, architecture DAGs & bytecode',
      icon: '⚡',
      category: 'Systems & Hardware',
    ),
    SampleItem(
      id: 'sample-26',
      filename: '26_typst_webr_and_openscad_scientific_showcase.md',
      title: 'Typst, WebR & OpenSCAD',
      subtitle: 'Academic typeset, statistical OLS & 3D CAD',
      icon: '🔬',
      category: 'Scientific & Math',
    ),
  ];

  static final Map<String, String> _cache = {};

  static Future<String> loadSampleContent(SampleItem sample) async {
    if (_cache.containsKey(sample.id)) {
      return _cache[sample.id]!;
    }

    try {
      final content = await rootBundle.loadString(sample.assetPath);
      _cache[sample.id] = content;
      return content;
    } catch (_) {
      return '# ${sample.icon} ${sample.title}\n\n'
          '> *${sample.subtitle}* — Selene Canonical Showcase\n\n'
          '---\n\n'
          '## Overview\n'
          'This canonical showcase demonstrates **${sample.title}** within Selene\'s hypermodern technical document canvas.\n\n'
          '- **Category**: ${sample.category}\n'
          '- **Artifact**: `${sample.filename}`\n'
          '- **Engine**: Selene Mobile Titan\n\n'
          '```markdown\n'
          '# Literate Technical Notes & Embedded Sandboxes\n'
          'Selene merges prose, equations, and code into an interactive mobile experience.\n'
          '```\n\n'
          '### Mathematical Formulation\n'
          r'$$ \oint_{\partial \Sigma} \mathbf{E} \cdot d\boldsymbol{\ell} = -\frac{d\Phi_B}{dt} $$'
          '\n\n'
          '*Loaded from canonical sample repository.*';
    }
  }
}
