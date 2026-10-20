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
      filename: '02_interactive_web_ui_components.md',
      title: 'Interactive Web UI Components',
      subtitle: 'React, Vue & Svelte sandboxes',
      icon: '⚡',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-03',
      filename: '03_angular_and_flutter_showcase.md',
      title: 'Angular & Flutter Showcase',
      subtitle: 'Reactive state & cross-platform widgets',
      icon: '💙',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-04',
      filename: '04_python_wasm_datascience_notebook.md',
      title: 'Python WASM Data Science',
      subtitle: 'NumPy, Pandas & Pyodide runtime',
      icon: '🐍',
      category: 'Data Science',
    ),
    SampleItem(
      id: 'sample-05',
      filename: '05_presentation_slide_deck_demo.md',
      title: 'Presentation Slide Deck',
      subtitle: 'Marp-compatible Markdown slides',
      icon: '📽️',
      category: 'Presentation',
    ),
    SampleItem(
      id: 'sample-06',
      filename: '06_php_laravel_blade_showcase.md',
      title: 'PHP & Laravel Blade',
      subtitle: 'Blade directives & artisan templates',
      icon: '🐘',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-07',
      filename: '07_ruby_on_rails_erb_showcase.md',
      title: 'Ruby on Rails ERB',
      subtitle: 'Hotwire Turbo & ActionView partials',
      icon: '💎',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-08',
      filename: '08_go_template_hugo_showcase.md',
      title: 'Go Templates & Hugo',
      subtitle: 'Static site generation & pipelines',
      icon: '🐹',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-09',
      filename: '09_django_jinja2_python_showcase.md',
      title: 'Django & Jinja2 Templates',
      subtitle: 'Template tags & context filters',
      icon: '🌐',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-10',
      filename: '10_rust_yew_leptos_showcase.md',
      title: 'Rust Yew & Leptos WASM',
      subtitle: 'Fine-grained reactivity in WebAssembly',
      icon: '🦀',
      category: 'Systems & WASM',
    ),
    SampleItem(
      id: 'sample-11',
      filename: '11_sql_sqlite_libsql_showcase.md',
      title: 'SQL, SQLite & LibSQL',
      subtitle: 'Relational queries & schema DDL',
      icon: '🗄️',
      category: 'Database & SQL',
    ),
    SampleItem(
      id: 'sample-12',
      filename: '12_glsl_webgl_shaders_showcase.md',
      title: 'GLSL & WebGL Shaders',
      subtitle: 'Fragment shaders & raymarching',
      icon: '🔮',
      category: 'Graphics & Math',
    ),
    SampleItem(
      id: 'sample-13',
      filename: '13_declarative_vector_charts_showcase.md',
      title: 'Declarative Vector Charts',
      subtitle: 'Vega-Lite & Mermaid diagrams',
      icon: '📊',
      category: 'Data Science',
    ),
    SampleItem(
      id: 'sample-14',
      filename: '14_duckdb_analytical_olap_showcase.md',
      title: 'DuckDB OLAP Analytics',
      subtitle: 'Vectorized columnar query processing',
      icon: '🦆',
      category: 'Database & SQL',
    ),
    SampleItem(
      id: 'sample-15',
      filename: '15_dual_document_and_whiteboard_showcase.md',
      title: 'Dual Document & Whiteboard',
      subtitle: 'Daedalus touch overlay integration',
      icon: '🎨',
      category: 'Creative Canvas',
    ),
    SampleItem(
      id: 'sample-16',
      filename: '16_elixir_phoenix_liveview_showcase.md',
      title: 'Elixir Phoenix LiveView',
      subtitle: 'HEEx templates & fault-tolerant actors',
      icon: '💧',
      category: 'Backend & Web',
    ),
    SampleItem(
      id: 'sample-17',
      filename: '17_swift_swiftui_multiplatform_showcase.md',
      title: 'Swift & SwiftUI Multiplatform',
      subtitle: 'Declarative view hierarchy & state',
      icon: '🍏',
      category: 'Frontend & UI',
    ),
    SampleItem(
      id: 'sample-18',
      filename: '18_hermes_relay_api_and_graphql_showcase.md',
      title: 'Hermes Relay API & GraphQL',
      subtitle: 'Cryptographic relay & schema introspection',
      icon: '🕊️',
      category: 'API & Networking',
    ),
    SampleItem(
      id: 'sample-19',
      filename: '19_chronos_timeline_revision_history_showcase.md',
      title: 'Chronos Timeline Revisions',
      subtitle: 'Immutable snapshots & diff trees',
      icon: '⏳',
      category: 'Core Architecture',
    ),
    SampleItem(
      id: 'sample-20',
      filename: '20_orbit_link_p2p_collaboration_showcase.md',
      title: 'OrbitLink P2P Collaboration',
      subtitle: 'WebRTC data channels & CRDT sync',
      icon: '🛰️',
      category: 'Collaboration',
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
