import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/ui/core/theme.dart';

enum TipCategory {
  all,
  overview,
  sandboxes,
  splitPanes,
  whiteboard,
  chronos,
  orbitCollab,
  aiOracle,
  shortcuts,
  proTips,
}

class AthenaWisdomItem {
  final String id;
  final TipCategory category;
  final String icon;
  final String title;
  final String badge;
  final String description;
  final List<String> highlights;
  final String? codeSnippet;
  final String? codeLang;
  final String? mythologyNote;

  const AthenaWisdomItem({
    required this.id,
    required this.category,
    required this.icon,
    required this.title,
    required this.badge,
    required this.description,
    required this.highlights,
    this.codeSnippet,
    this.codeLang,
    this.mythologyNote,
  });
}

final List<AthenaWisdomItem> athenaWisdomCatalog = [
  // 1. Overview
  const AthenaWisdomItem(
    id: 'overview-core',
    category: TipCategory.overview,
    icon: '🏛️',
    title: 'Welcome to Selene: The Living Architectural Canvas',
    badge: 'Core Architecture',
    description:
        'Selene is a next-generation technical notebook and literate computing studio designed for systems architects, engineers, and researchers. Instead of inert markdown documents, Selene renders reactive, live-compiling sandboxes directly within your prose.',
    highlights: [
      'Local-First & Offline-First: All documents and AST nodes persist instantly into the local SQLite vault (Mnemosyne) with zero cloud dependency.',
      'Unified Polyglot AST: Seamlessly blend technical prose, executable code, vector diagrams, mathematical proofs, and interactive stateful widgets.',
      'Client-Side WASM Compilation: Run Python, SQLite, DuckDB, Mermaid, Shaders, and React directly in the sandbox.',
    ],
    mythologyNote:
        'Named in honor of Selene (Σελήνη), the radiant Titan goddess of the Moon, bringing illumination to the darkness of complex software architectures.',
  ),
  const AthenaWisdomItem(
    id: 'overview-quickstart',
    category: TipCategory.overview,
    icon: '⚡',
    title: 'How to Make the Most of Selene',
    badge: 'Quick Start',
    description:
        'Follow these three core pillars to transform your engineering documentation from static text into living software artifacts:',
    highlights: [
      '1. Polyglot Code Fences: Type ```python, ```dart, ```sql, or ```heex on any line to insert interactive code sandboxes with syntax intelligence.',
      r'2. KaTeX Mathematical Typography: Write inline math ($E = mc^2$) or display blocks ($$\int_0^\infty e^{-x^2} dx$$) with Greek typographical fidelity.',
      '3. Multi-View Ergonomics: Seamlessly switch between Rich Visual Canvas, Raw Markdown Source, and Symmetrical Split Mode.',
    ],
  ),

  // 2. 20 Living Sandboxes
  const AthenaWisdomItem(
    id: 'sandboxes-react-vue-svelte',
    category: TipCategory.sandboxes,
    icon: '⚛️',
    title: 'Modern Web Frameworks (React 19, Vue 3, Svelte 5)',
    badge: 'Web Engines',
    description:
        'Write self-contained reactive UI components directly inside fenced code blocks. Selene compiles JSX and templates on-the-fly inside isolated sandbox containers.',
    codeSnippet: '''```react
export default function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <button
      onClick={() => setCount(c => c + 1)}
      className="px-4 py-2 bg-sky-500 text-white rounded-lg"
    >
      Count: {count}
    </button>
  );
}
```''',
    codeLang: 'react',
    highlights: [
      'React 19: Full support for useState, useEffect, useMemo, and inline Tailwind styling.',
      'Vue 3: Single-file component simulation with reactive ref and computed values.',
      'Svelte 5: Declarative state variables and reactive button actions.',
    ],
  ),
  const AthenaWisdomItem(
    id: 'sandboxes-python-wasm',
    category: TipCategory.sandboxes,
    icon: '🐍',
    title: 'Scientific Python & Data Science (Pyodide WASM)',
    badge: 'Python Engine',
    description:
        'Execute Python 3 algorithms, data processing scripts, and mathematical computations with zero server infrastructure using in-browser WebAssembly.',
    codeSnippet: '''```python
import math

def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fibonacci(i) for i in range(12)])
```''',
    codeLang: 'python',
    highlights: [
      'Standard library support: math, json, random, statistics, itertools.',
      'Real-time stdout capture and exception traceback formatting.',
      'Isolated execution runtime preventing global state corruption.',
    ],
  ),
  const AthenaWisdomItem(
    id: 'sandboxes-phoenix-swift',
    category: TipCategory.sandboxes,
    icon: '🦅',
    title: 'Phoenix LiveView & SwiftUI (Phoenix of Olympus & Zephyr Swift)',
    badge: 'Titan Additions',
    description:
        'Preview server-driven Phoenix LiveView templates and declarative SwiftUI iOS/macOS canvas screens natively inside markdown prose.',
    codeSnippet: '''```heex
<div class="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl">
  <h3 class="font-bold text-amber-400">Phoenix LiveView Telemetry</h3>
  <p class="text-xs text-amber-200 mt-1">Assigns: {@node_id} (Ping: {@latency_ms}ms)</p>
  <button phx-click="ping" class="mt-3 px-3 py-1 bg-amber-600 text-white text-xs rounded">
    Dispatch phx-click
  </button>
</div>
```''',
    codeLang: 'heex',
    highlights: [
      'HEEx LiveView: Simulates state assigns (@variable) and phx-click event dispatch.',
      'SwiftUI Canvas: Renders declarative View hierarchies (VStack, HStack, Text, Toggle, Button) with reactive State.',
      'Zero Xcode or Elixir compiler installation required.',
    ],
    mythologyNote:
        'Embodied by the undying Phoenix of Olympus and Zephyrus, God of the gentle West Wind.',
  ),
  const AthenaWisdomItem(
    id: 'sandboxes-hermes-relay',
    category: TipCategory.sandboxes,
    icon: '🪶',
    title: 'Hermes Relay: Interactive HTTP, cURL & GraphQL Runner',
    badge: 'API Gateway',
    description:
        'Transform static API documentation into executable request consoles. Send real fetch requests or inspect mock response telemetry with sub-millisecond execution times.',
    codeSnippet: '''```http
GET /api/health HTTP/1.1
Host: localhost:3000
Accept: application/json
X-Hermes-Relay: celestial-gateway-v4
```''',
    codeLang: 'http',
    highlights: [
      'Multi-grammar parser: Recognizes RFC 7230 HTTP specifications, raw cURL terminal commands, and GraphQL queries.',
      'Dynamic GUI builder: Modify query params, authentication headers, and JSON request bodies reactively.',
      'Bidirectional cURL export: Copy formatted cURL commands directly from your interactive changes.',
    ],
    mythologyNote:
        'Named for Hermes (Ἑρμῆς), the fleet-footed Messenger of Olympus and Herald of the Gods.',
  ),
  const AthenaWisdomItem(
    id: 'sandboxes-sql-duckdb',
    category: TipCategory.sandboxes,
    icon: '🗄️',
    title: 'Relational SQL & Analytical DuckDB OLAP',
    badge: 'Database Engines',
    description:
        'Query relational tables in SQLite WASM or process large analytical Parquet data files with vectorized DuckDB queries right on the canvas.',
    codeSnippet: '''```sql
CREATE TABLE servers (id INTEGER PRIMARY KEY, name TEXT, region TEXT);
INSERT INTO servers VALUES (1, 'olympus-01', 'eu-west'), (2, 'delphi-02', 'us-east');
SELECT region, COUNT(*) as count FROM servers GROUP BY region;
```''',
    codeLang: 'sql',
    highlights: [
      'Interactive data tables with sorting, pagination, and schema inspectors.',
      'DuckDB analytics: Fast columnar aggregations and Parquet file queries.',
      'Zero-latency memory execution with tabular result grids.',
    ],
  ),
  const AthenaWisdomItem(
    id: 'sandboxes-diagrams-math',
    category: TipCategory.sandboxes,
    icon: '📊',
    title: 'Mermaid Architecture Diagrams & KaTeX Math Proofs',
    badge: 'Visual Science',
    description:
        'Draft distributed system sequence diagrams, state machines, entity-relationship models, and mathematical lemmas in pure declarative syntax.',
    codeSnippet: '''```mermaid
sequenceDiagram
    Client->>HermesRelay: GET /api/telemetry
    HermesRelay->>SQLite: Query local vault
    SQLite-->>HermesRelay: Rows returned
    HermesRelay-->>Client: 200 OK (JSON Payload)
```''',
    codeLang: 'mermaid',
    highlights: [
      'Mermaid.js: sequenceDiagram, flowchart TD, classDiagram, stateDiagram-v2, erDiagram.',
      r'KaTeX Mathematics: Block math ($$\oint \mathbf{B} \cdot d\mathbf{\ell} = \mu_0 I$$) and inline notation ($f(x)$) rendered with Greek typographical fidelity.',
      'Declarative Charts: Render line, bar, pie, radar, and scatter plots using ```chart.',
    ],
  ),

  // 3. Split Panes & Views
  const AthenaWisdomItem(
    id: 'split-panes-md',
    category: TipCategory.splitPanes,
    icon: '🪟',
    title: 'Split MD View: Side-by-Side Rich Canvas & Raw Source',
    badge: 'Ergonomics',
    description:
        'Toggle Split mode in the navigation bar to view your Rich TipTap Canvas on the left and the raw GitHub-Flavored Markdown stream on the right with live bi-directional synchronization.',
    highlights: [
      'Live Bi-directional Sync: Changes typed in the raw markdown editor update the visual canvas instantly, and vice-versa.',
      'Synchronized Scroll Lock: Both panes maintain proportional scroll positions as you navigate complex documents.',
      'Adaptive Mobile Stacking: Automatically arranges horizontally on tablets and vertically on phones.',
    ],
  ),
  const AthenaWisdomItem(
    id: 'split-panes-dual-doc',
    category: TipCategory.splitPanes,
    icon: '📑',
    title: 'Dual View: Multi-Document Comparison & RFC Review',
    badge: 'Productivity',
    description:
        'Compare architectural specifications alongside implementation notes. Ideal for reviewing RFCs, design docs, or legacy code while composing fresh chapters.',
    highlights: [
      'Side-by-Side or Stacked layout toggling.',
      'Independent document selection for each pane.',
      '1-tap document swap to switch reference and composition focus.',
    ],
  ),

  // 4. Daedalus's Drawing Board
  const AthenaWisdomItem(
    id: 'whiteboard-daedalus',
    category: TipCategory.whiteboard,
    icon: '🎨',
    title: "Daedalus's Drawing Board: Freehand Vector Markup Overlay",
    badge: 'Creative Canvas',
    description:
        'Tap the palette icon to activate an ethereal drawing canvas draped directly over your document. Annotate code blocks, sketch architectural flows, and point out critical logic with precision tools.',
    highlights: [
      "Calliope's Stylus: Freehand ink pen with smooth vector curves and adjustable stroke width.",
      "Iris's Prismatic Highlighter: Semi-transparent highlighter for emphasizing key sentences or code lines.",
      "Apollo's Golden Arrow: Directional vector arrows with automatic arrowhead calculation for pointing out bugs or dependencies.",
      "Euclidean Frame & Selene's Orb: Geometric rectangle and ellipse boundary tools.",
      'Passthrough Touch Mode: Tap the hand icon to interact with and scroll the document underneath while keeping your sketches visible.',
    ],
    mythologyNote:
        'Named for Daedalus (Δαίδαλος), the consummate craftsman, architect, and inventor of antiquity.',
  ),

  // 5. Chronos Timeline & Diff
  const AthenaWisdomItem(
    id: 'chronos-timeline',
    category: TipCategory.chronos,
    icon: '⏳',
    title: 'Chronos Timeline: Semantic Revisions & Safe Time-Warp Diffing',
    badge: 'Version Control',
    description:
        'Tap the hourglass icon to summon the cosmic epoch inspector. Never lose technical prose, live canvas experiments, or code block modifications.',
    highlights: [
      'Automated Epoch Checkpointing: Selene silently captures document states in the background as you write.',
      'Milestone Tagging: Tag critical versions with human-readable labels (e.g. "[Alpha Architecture Approved]", "[Pre-Refactor Backup]").',
      'Unified Visual Diff: Color-coded line additions (emerald +) and deletions (rose -) with line number gutters.',
      'Time-Warp Safe Rollback: Revert to any historical epoch with 1 tap. Selene automatically creates a safety snapshot before restoring.',
    ],
    mythologyNote:
        'Named for Chronos (Χρόνος), the primordial personification of empirical time and eternity.',
  ),

  // 6. Orbit Link P2P Collab
  const AthenaWisdomItem(
    id: 'orbit-collab',
    category: TipCategory.orbitCollab,
    icon: '🪐',
    title: 'Orbit Link: Zero-Setup P2P WebRTC Real-Time Collaboration',
    badge: 'Co-Authoring',
    description:
        'Connect directly with peer architects and collaborators over peer-to-peer WebRTC mesh channels powered by Yjs CRDTs without third-party servers.',
    highlights: [
      'Direct Browser-to-Device Mesh: Data channels exchange editing deltas directly between peers using end-to-end cryptographic synchronization.',
      'Zero Database Server Footprint: No centralized server logs your keystrokes or stores proprietary document text.',
      '12 Greek Pantheon Personas: Pick a divine avatar and color-coded badge (Apollo, Athena, Hermes, Artemis, Zeus, Poseidon, Hephaestus, Aphrodite, Hyperion, Theia, Atlas, Demeter).',
      '1-Tap Room Sharing: Share ephemeral invitation codes to bring reviewers into your session instantly.',
    ],
  ),

  // 7. Delphic Oracle AI
  const AthenaWisdomItem(
    id: 'ai-delphic-oracle',
    category: TipCategory.aiOracle,
    icon: '🔮',
    title: "The Delphic Oracle & Hermes' Transmutation Suite",
    badge: 'AI Intelligence',
    description:
        'Harness state-of-the-art AI directly within your literate computing workflow to generate architecture specs, diagnose broken code, and transmute legacy drafts into living documents.',
    highlights: [
      "The Delphic Oracle: Context-aware AI copilot with Olympian Divination presets (Hephaestus's Forge, Athena's Wisdom, Zephyrus's Breeze).",
      "Hermes' Transmutation: Ingest research notes, PDF diagrams, or whiteboard sketches and convert them into living interactive markdown documents.",
      'HMAC-Attested Security: Cryptographic request validation guarantees tamper-proof client-to-cloud communications.',
    ],
    mythologyNote:
        'Inspired by the Pythia of the Delphic Oracle, sacred priestess of Apollo and channel of celestial truth.',
  ),

  // 8. Shortcuts & Mobile Ergonomics
  const AthenaWisdomItem(
    id: 'shortcuts-directory',
    category: TipCategory.shortcuts,
    icon: '⌨️',
    title: 'Sacred Keystrokes & Mobile Touch Ergonomics',
    badge: 'Ergonomics',
    description:
        'Master mobile gestures and docked accessory controls to navigate and author at the speed of thought:',
    highlights: [
      'Sticky Keyboard Accessory Bar: 1-tap buttons for Headers, Bold, Italic, Strikethrough, Math, Code, Lists, and Blockquotes docked above your keyboard.',
      'Header Lunar Diadem: Tap the moon icon to inspect real-time synodic phase, illumination, and the Orphic Hymn to Selene.',
      'Double-Tap to Select Word: Fast selection for instant markdown formatting.',
      'Swipe Down from Handle: Seamlessly dismiss sheets back to your editing flow.',
    ],
  ),

  // 9. Olympian Pro-Tips
  const AthenaWisdomItem(
    id: 'pro-tips-best-practices',
    category: TipCategory.proTips,
    icon: '💡',
    title: 'Olympian Pro-Tips for Maximum Productivity',
    badge: 'Master Workflows',
    description:
        'Hardened tips from senior architects and researchers to unlock the full potential of Selene:',
    highlights: [
      "Hermes' Wings Export Suite: Export your documents to 9 different formats—including print-ready PDF with KaTeX math, standalone HTML with bundled sandboxes, and Jupyter Notebooks (.ipynb).",
      'Custom Astronomical Lunar Ephemeris: The lunar tracker computes synodic lunar age based on astronomical epoch math with sub-second precision.',
      'Local-First Sovereignty: Every note, drawing stroke, and version checkpoint is saved immediately to device storage with zero telemetry.',
      'S-Pen & Stylus Acceleration: Daedalus whiteboard features native low-latency stylus and pressure handling.',
    ],
  ),
];

class AthenaWisdomSheet extends StatefulWidget {
  const AthenaWisdomSheet({super.key});

  @override
  State<AthenaWisdomSheet> createState() => _AthenaWisdomSheetState();
}

class _AthenaWisdomSheetState extends State<AthenaWisdomSheet> {
  TipCategory _selectedCategory = TipCategory.all;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<AthenaWisdomItem> get _filteredItems {
    return athenaWisdomCatalog.where((item) {
      final matchesCategory = _selectedCategory == TipCategory.all || item.category == _selectedCategory;
      if (!matchesCategory) return false;

      if (_searchQuery.isEmpty) return true;

      final inTitle = item.title.toLowerCase().contains(_searchQuery);
      final inDesc = item.description.toLowerCase().contains(_searchQuery);
      final inBadge = item.badge.toLowerCase().contains(_searchQuery);
      final inHighlights = item.highlights.any((h) => h.toLowerCase().contains(_searchQuery));
      final inSnippet = item.codeSnippet?.toLowerCase().contains(_searchQuery) ?? false;
      final inMyth = item.mythologyNote?.toLowerCase().contains(_searchQuery) ?? false;

      return inTitle || inDesc || inBadge || inHighlights || inSnippet || inMyth;
    }).toList();
  }

  String _getCategoryLabel(TipCategory cat) {
    switch (cat) {
      case TipCategory.all:
        return 'All Wisdom';
      case TipCategory.overview:
        return '🏛️ Overview';
      case TipCategory.sandboxes:
        return '💻 20 Sandboxes';
      case TipCategory.splitPanes:
        return '🪟 Split Panes';
      case TipCategory.whiteboard:
        return '🎨 Daedalus Board';
      case TipCategory.chronos:
        return '⏳ Chronos Diff';
      case TipCategory.orbitCollab:
        return '🪐 Orbit Collab';
      case TipCategory.aiOracle:
        return '🔮 Delphic Oracle';
      case TipCategory.shortcuts:
        return '⌨️ Ergonomics';
      case TipCategory.proTips:
        return '💡 Pro Tips';
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _filteredItems;
    final maxHeight = MediaQuery.of(context).size.height * 0.88;

    return Container(
      constraints: BoxConstraints(maxHeight: maxHeight),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: SeleneTheme.surfaceElevated,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: SeleneTheme.borderHighlight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SeleneTheme.goldAccent.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
                ),
                child: const Text('💡', style: TextStyle(fontSize: 20)),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Athena's Wisdom",
                      style: TextStyle(
                        color: SeleneTheme.textPrimary,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Olympian Master Guide & 9-Chapter Knowledge Suite',
                      style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 11.5),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: SeleneTheme.goldAccent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'TITAN SUITE',
                  style: TextStyle(
                    color: SeleneTheme.goldAccent,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Search Bar
          TextField(
            controller: _searchController,
            style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'Search wisdom, sandboxes, syntax, or mythology...',
              hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
              prefixIcon: const Icon(Icons.search, size: 18, color: SeleneTheme.textSecondary),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 16, color: SeleneTheme.textSecondary),
                      onPressed: () => _searchController.clear(),
                    )
                  : null,
              filled: true,
              fillColor: SeleneTheme.surface,
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.goldAccent),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Category Chips Carousel
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: TipCategory.values.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: FilterChip(
                    label: Text(_getCategoryLabel(cat)),
                    labelStyle: TextStyle(
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? SeleneTheme.goldAccent : SeleneTheme.textSecondary,
                    ),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() => _selectedCategory = cat);
                    },
                    backgroundColor: SeleneTheme.surface,
                    selectedColor: SeleneTheme.goldAccent.withValues(alpha: 0.2),
                    checkmarkColor: SeleneTheme.goldAccent,
                    side: BorderSide(
                      color: isSelected ? SeleneTheme.goldAccent : SeleneTheme.border,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
                    visualDensity: VisualDensity.compact,
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Items List
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off, size: 36, color: SeleneTheme.textMuted),
                        const SizedBox(height: 8),
                        Text(
                          'No Olympian wisdom matches "$_searchQuery"',
                          style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _WisdomCardWidget(item: item);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _WisdomCardWidget extends StatelessWidget {
  final AthenaWisdomItem item;

  const _WisdomCardWidget({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SeleneTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SeleneTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title & Badge Row
          Row(
            children: [
              Text(item.icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  item.title,
                  style: const TextStyle(
                    color: SeleneTheme.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: SeleneTheme.lunarCyan.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.3)),
                ),
                child: Text(
                  item.badge.toUpperCase(),
                  style: const TextStyle(
                    color: SeleneTheme.lunarCyan,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Description
          Text(
            item.description,
            style: const TextStyle(
              color: SeleneTheme.textSecondary,
              fontSize: 12.5,
              height: 1.45,
            ),
          ),

          const SizedBox(height: 10),

          // Highlights
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: SeleneTheme.surfaceElevated,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: SeleneTheme.borderHighlight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: item.highlights.map((highlight) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ', style: TextStyle(color: SeleneTheme.goldAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                      Expanded(
                        child: Text(
                          highlight,
                          style: const TextStyle(
                            color: SeleneTheme.textPrimary,
                            fontSize: 12,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),

          // Code snippet if present
          if (item.codeSnippet != null) ...[
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF090D16),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: SeleneTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: const BoxDecoration(
                      color: Color(0xFF131A29),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(9)),
                      border: Border(bottom: BorderSide(color: SeleneTheme.border)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          (item.codeLang ?? 'SPECIMEN').toUpperCase(),
                          style: const TextStyle(
                            color: SeleneTheme.lunarCyan,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            Clipboard.setData(ClipboardData(text: item.codeSnippet!));
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Copied ${item.title} specimen snippet!'),
                                duration: const Duration(seconds: 1),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(4),
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            child: Row(
                              children: [
                                Icon(Icons.copy, size: 12, color: SeleneTheme.textSecondary),
                                SizedBox(width: 4),
                                Text(
                                  'Copy Specimen',
                                  style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 10.5),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: SelectableText(
                      item.codeSnippet!,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: SeleneTheme.textPrimary,
                        fontSize: 11.5,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Mythology Note if present
          if (item.mythologyNote != null) ...[
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🏛️ ', style: TextStyle(fontSize: 12)),
                Expanded(
                  child: Text(
                    item.mythologyNote!,
                    style: const TextStyle(
                      color: SeleneTheme.goldAccent,
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
