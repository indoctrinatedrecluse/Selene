"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Columns,
  Code2,
  Terminal,
  History,
  Users,
  PenTool,
  Lightbulb,
  Check,
  Copy,
  ChevronRight,
  Zap,
  Compass,
} from "lucide-react";

interface AthenaTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDualView?: () => void;
  onOpenWhiteboard?: () => void;
  onOpenChronos?: () => void;
  onOpenDelphicOracle?: () => void;
}

type TipCategory =
  | "overview"
  | "sandboxes"
  | "split-panes"
  | "whiteboard"
  | "chronos"
  | "orbit-collab"
  | "ai-oracle"
  | "shortcuts"
  | "pro-tips";

interface TipItem {
  id: string;
  category: TipCategory;
  title: string;
  badge?: string;
  description: string;
  codeSnippet?: string;
  codeLang?: string;
  highlights: string[];
  mythologyNote?: string;
}

const TIPS_CATALOG: TipItem[] = [
  // Overview
  {
    id: "overview-core",
    category: "overview",
    title: "Welcome to Selene: The Living Architectural Canvas",
    badge: "Core Architecture",
    description:
      "Selene is a next-generation technical notebook and literate computing studio designed for systems architects, engineers, and researchers. Instead of inert markdown documents, Selene renders reactive, live-compiling sandboxes directly within your prose.",
    highlights: [
      "Local-First & Offline-First: All documents and AST nodes persist instantly into the local SQLite vault (Mnemosyne) with zero cloud dependency.",
      "Unified Polyglot AST: Seamlessly blend technical prose, executable code, vector diagrams, mathematical proofs, and interactive stateful widgets.",
      "Client-Side WASM Compilation: Run Python, SQLite, DuckDB, Mermaid, Shaders, and React directly in the browser sandbox.",
    ],
    mythologyNote:
      "Named in honor of Selene (Σελήνη), the radiant Titan goddess of the Moon, bringing illumination to the darkness of complex software architectures.",
  },
  {
    id: "overview-quickstart",
    category: "overview",
    title: "How to Make the Most of Selene",
    badge: "Quick Start",
    description:
      "Follow these three core pillars to transform your engineering documentation from static text into living software artifacts:",
    highlights: [
      "1. Slash Commands (/): Type '/' on any empty line to summon the Olympian menu—insert interactive code sandboxes, callout admonitions, or KaTeX formulas instantly.",
      "2. Live Sandboxes: Edit live code blocks and watch them re-render in sub-milliseconds with built-in property inspectors and error recovery.",
      "3. Multi-Pane Ergonomics: Use Split MD (Canvas + Raw Markdown) or Dual View (Side-by-Side multi-document comparison) to review RFCs and write code simultaneously.",
    ],
  },

  // 20 Sandboxes
  {
    id: "sandboxes-react-vue-svelte",
    category: "sandboxes",
    title: "Modern Web Frameworks (React 19, Vue 3, Svelte 5)",
    badge: "Web Engines",
    description:
      "Write self-contained reactive UI components directly inside fenced code blocks. Selene compiles JSX and templates on-the-fly inside isolated sandbox containers.",
    codeSnippet: "```react\nexport default function Counter() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <button\n      onClick={() => setCount(c => c + 1)}\n      className=\"px-4 py-2 bg-sky-500 text-white rounded-lg\"\n    >\n      Count: {count}\n    </button>\n  );\n}\n```",
    codeLang: "react",
    highlights: [
      "React 19: Full support for useState, useEffect, useMemo, and inline Tailwind styling.",
      "Vue 3: Single-file component simulation with reactive ref and computed values.",
      "Svelte 5: Declarative state variables and reactive button actions.",
    ],
  },
  {
    id: "sandboxes-python-wasm",
    category: "sandboxes",
    title: "Scientific Python & Data Science (Pyodide WASM)",
    badge: "Python Engine",
    description:
      "Execute Python 3 algorithms, data processing scripts, and mathematical computations with zero server infrastructure using in-browser WebAssembly.",
    codeSnippet: "```python\nimport math\n\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint([fibonacci(i) for i in range(12)])\n```",
    codeLang: "python",
    highlights: [
      "Standard library support: math, json, random, statistics, itertools.",
      "Real-time stdout capture and exception traceback formatting.",
      "Isolated execution runtime preventing global state corruption.",
    ],
  },
  {
    id: "sandboxes-phoenix-swift",
    category: "sandboxes",
    title: "Phoenix LiveView & SwiftUI (Phoenix of Olympus & Zephyr Swift)",
    badge: "Titan Additions",
    description:
      "Preview server-driven Phoenix LiveView templates and declarative SwiftUI iOS/macOS canvas screens natively inside markdown prose.",
    codeSnippet: "```heex\n<div class=\"p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl\">\n  <h3 class=\"font-bold text-amber-400\">Phoenix LiveView Telemetry</h3>\n  <p class=\"text-xs text-amber-200 mt-1\">Assigns: {@node_id} (Ping: {@latency_ms}ms)</p>\n  <button phx-click=\"ping\" class=\"mt-3 px-3 py-1 bg-amber-600 text-white text-xs rounded\">\n    Dispatch phx-click\n  </button>\n</div>\n```",
    codeLang: "heex",
    highlights: [
      "HEEx LiveView: Simulates state assigns (@variable) and phx-click event dispatch.",
      "SwiftUI Canvas: Renders declarative View hierarchies (VStack, HStack, Text, Toggle, Button) with reactive State.",
      "Zero Xcode or Elixir compiler installation required.",
    ],
    mythologyNote:
      "Embodied by the undying Phoenix of Olympus and Zephyrus, God of the gentle West Wind.",
  },
  {
    id: "sandboxes-hermes-relay",
    category: "sandboxes",
    title: "Hermes Relay: Interactive HTTP, cURL & GraphQL Runner",
    badge: "API Gateway",
    description:
      "Transform static API documentation into executable request consoles. Send real fetch requests or inspect mock response telemetry with sub-millisecond execution times.",
    codeSnippet: "```http\nGET /api/health HTTP/1.1\nHost: localhost:3000\nAccept: application/json\nX-Hermes-Relay: celestial-gateway-v4\n```",
    codeLang: "http",
    highlights: [
      "Multi-grammar parser: Recognizes RFC 7230 HTTP specifications, raw cURL terminal commands, and GraphQL queries.",
      "Dynamic GUI builder: Modify query params, authentication headers, and JSON request bodies reactively.",
      "Bidirectional cURL export: Copy formatted cURL commands directly from your interactive changes.",
    ],
    mythologyNote:
      "Named for Hermes (Ἑρμῆς), the fleet-footed Messenger of Olympus and Herald of the Gods.",
  },
  {
    id: "sandboxes-sql-duckdb",
    category: "sandboxes",
    title: "Relational SQL & Analytical DuckDB OLAP",
    badge: "Database Engines",
    description:
      "Query relational tables in SQLite WASM or process large analytical Parquet data files with vectorized DuckDB queries right on the canvas.",
    codeSnippet: "```sql\nCREATE TABLE servers (id INTEGER PRIMARY KEY, name TEXT, region TEXT);\nINSERT INTO servers VALUES (1, 'olympus-01', 'eu-west'), (2, 'delphi-02', 'us-east');\nSELECT region, COUNT(*) as count FROM servers GROUP BY region;\n```",
    codeLang: "sql",
    highlights: [
      "Interactive data tables with sorting, pagination, and schema inspectors.",
      "DuckDB analytics: Fast columnar aggregations and Parquet file queries.",
      "Zero-latency memory execution with tabular result grids.",
    ],
  },
  {
    id: "sandboxes-diagrams-math",
    category: "sandboxes",
    title: "Mermaid Architecture Diagrams & KaTeX Math Proofs",
    badge: "Visual Science",
    description:
      "Draft distributed system sequence diagrams, state machines, entity-relationship models, and mathematical lemmas in pure declarative syntax.",
    codeSnippet: "```mermaid\nsequenceDiagram\n    Client->>HermesRelay: GET /api/telemetry\n    HermesRelay->>SQLite: Query local vault\n    SQLite-->>HermesRelay: Rows returned\n    HermesRelay-->>Client: 200 OK (JSON Payload)\n```",
    codeLang: "mermaid",
    highlights: [
      "Mermaid.js: sequenceDiagram, flowchart TD, classDiagram, stateDiagram-v2, erDiagram.",
      "KaTeX Mathematics: Block math ($$E=mc^2$$) and inline notation ($f(x)$) rendered with Greek typographical fidelity.",
      "Declarative Charts: Render line, bar, pie, radar, and scatter plots using ```chart.",
    ],
  },

  // Split Panes
  {
    id: "split-panes-md",
    category: "split-panes",
    title: "Split MD View: Side-by-Side Rich Canvas & Raw GFM Stream",
    badge: "Ergonomics",
    description:
      "Toggle Split MD mode in the header to view your Rich TipTap Canvas on the left and the raw GitHub-Flavored Markdown stream on the right with live bi-directional synchronization.",
    highlights: [
      "Live Bi-directional Sync: Changes typed in the raw markdown editor update the visual canvas instantly, and vice-versa.",
      "Synchronized Scroll Lock: Both panes maintain proportional scroll positions as you navigate complex documents.",
      "Symmetrical 50/50 Layout: Rock-solid split-screen geometry guaranteed to avoid layout clipping or flex container distortion.",
    ],
  },
  {
    id: "split-panes-dual-doc",
    category: "split-panes",
    title: "Dual View: Multi-Document Comparison & Cross-Referencing",
    badge: "Productivity",
    description:
      "Press Alt+D or click 'Dual View' in the header to open a secondary document alongside your primary editor. Perfect for reviewing RFCs, design specs, or legacy implementations while authoring code.",
    highlights: [
      "Vertical (Side-by-Side) or Horizontal (Stacked): Toggle orientation with one click in the secondary pane toolbar.",
      "Independent Document Selector: Select any document from your workspace for pane 2.",
      "Canvas or Raw Markdown: Choose whether pane 2 renders as interactive visual canvas or editable markdown.",
      "1-Click Document Swap: Swap primary and secondary documents instantly.",
      "Linked Scroll: Toggle synchronized scrolling to read through matching chapters together.",
    ],
  },
  {
    id: "split-panes-project",
    category: "split-panes",
    title: "Live Project Dev Server Preview with HMR",
    badge: "Live Server",
    description:
      "Click 'Live Project' in the view switcher to spin up an integrated, real-time web server preview with Hot Module Replacement right inside the split pane.",
    highlights: [
      "Embedded Browser Frame: Inspect live HTML/CSS rendering with responsive viewport controls.",
      "Console Telemetry: Inspect server logs, runtime errors, and network ping times.",
      "Seamless Integration: Edit documentation on the left while previewing your running web service on the right.",
    ],
  },

  // Whiteboard
  {
    id: "whiteboard-daedalus",
    category: "whiteboard",
    title: "Daedalus's Drawing Board: Freehand Vector Markup Overlay",
    badge: "Creative Canvas",
    description:
      "Press Alt+W or click 'Markup' to activate an ethereal drawing canvas draped directly over your document. Annotate code blocks, sketch architectural flows, and point out critical logic with precision tools.",
    highlights: [
      "Calliope's Stylus: Freehand ink pen with smooth vector curves and adjustable stroke width.",
      "Iris's Prismatic Highlighter: Semi-transparent highlighter for emphasizing key sentences or code lines.",
      "Apollo's Golden Arrow: Directional vector arrows with automatic arrowhead calculation for pointing out bugs or dependencies.",
      "Euclidean Frame & Selene's Orb: Geometric rectangle and ellipse boundary tools.",
      "1-Click Snapshot: Embed your vector drawings directly into the document markdown as a persistent image.",
    ],
    mythologyNote:
      "Named for Daedalus (Δαίδαλος), the consummate craftsman, architect, and inventor of antiquity.",
  },

  // Chronos
  {
    id: "chronos-timeline",
    category: "chronos",
    title: "Chronos Timeline: Semantic Revisions & Safe Time-Warp Diffing",
    badge: "Version Control",
    description:
      "Press Alt+H or click 'Chronos' to summon the cosmic epoch inspector. Never lose technical prose, live canvas experiments, or code block modifications.",
    highlights: [
      "Automated Epoch Checkpointing: Selene silently captures document states in the background as you write.",
      "Milestone Tagging (Ctrl+S): Tag critical versions with human-readable labels (e.g. 'Alpha Architecture Approved', 'Pre-Refactor Backup').",
      "Unified Diff Mode: Color-coded line additions (emerald +) and deletions (rose -) with line number gutters.",
      "Side-by-Side Split Diff Mode: Direct parallel inspection between historical epochs and current live text.",
      "Time-Warp Safe Rollback: Revert to any historical epoch with 1 click. Selene automatically creates a safety snapshot before restoring.",
    ],
    mythologyNote:
      "Named for Chronos (Χρόνος), the primordial personification of empirical time and eternity.",
  },

  // Orbit Link
  {
    id: "orbit-collab",
    category: "orbit-collab",
    title: "Orbit Link: Zero-Setup P2P WebRTC Real-Time Collaboration",
    badge: "Co-Authoring",
    description:
      "Click the celestial orbit badge in the header to start a peer-to-peer real-time co-editing session using WebRTC and Yjs. Connect directly with teammates without third-party cloud servers.",
    highlights: [
      "Direct Browser-to-Browser Mesh: Data channels exchange editing deltas directly between peers using end-to-end cryptographic synchronization.",
      "Zero Database Server Footprint: No centralized server logs your keystrokes or stores proprietary document text.",
      "Olympian Callsigns: Pick a custom divine avatar and color-coded presence badge.",
      "1-Click Room Sharing: Copy an ephemeral invitation link to bring reviewers into your session instantly.",
    ],
  },

  // AI & Ingest
  {
    id: "ai-delphic-oracle",
    category: "ai-oracle",
    title: "The Delphic Oracle & Hermes' Transmutation Suite",
    badge: "AI Intelligence",
    description:
      "Harness state-of-the-art AI directly within your literate computing workflow to generate architecture specs, diagnose broken code, and transmute legacy paper into interactive documents.",
    highlights: [
      "Delphic Oracle (Ctrl+Shift+A): Context-aware AI copilot with Olympian Divination presets (Hephaestus's Forge, Athena's Wisdom, Zephyrus's Breeze).",
      "Hermes' Transmutation: Ingest research papers, PDF diagrams, or whiteboard snapshots and convert them into living interactive markdown documents.",
      "Automatic Sandbox Auto-Fix: If code in a live sandbox throws a runtime error, click 'Auto-Fix with AI' to diagnose and repair the bug with 1 click.",
    ],
    mythologyNote:
      "Inspired by the Pythia of the Delphic Oracle, sacred priestess of Apollo and channel of celestial truth.",
  },

  // Shortcuts
  {
    id: "shortcuts-directory",
    category: "shortcuts",
    title: "Sacred Keystrokes & Command Palette",
    badge: "Keyboard Accelerators",
    description:
      "Master these essential keyboard shortcuts to navigate and author at the speed of thought:",
    highlights: [
      "/ : Trigger Slash Command Menu (Sandboxes, Callouts, Formulas, Dividers)",
      "Alt + D : Toggle Multi-Document Dual View Split Screen",
      "Alt + W : Toggle Daedalus's Whiteboard & Freehand Vector Drawing Overlay",
      "Alt + H : Open Chronos Timeline Semantic Revisions & Visual Diff Drawer",
      "Alt + P : Launch The Dionysian Amphitheater Slide Deck Presentation Mode",
      "Ctrl + Shift + A : Summon The Delphic Oracle AI Architectural Copilot",
      "Ctrl + S : Create a Tagged Epoch Milestone in Chronos Timeline",
      "Ctrl + ` : Toggle Hephaestus's Subterranean Terminal & Command Runner",
      "F1 : Open Athena's Wisdom & Master Guidance Suite",
      "Esc : Exit Zen Mode, Close Overlays, or Dismiss Active Drawers",
    ],
  },

  // Pro Tips
  {
    id: "pro-tips-best-practices",
    category: "pro-tips",
    title: "Olympian Pro-Tips for Maximum Productivity",
    badge: "Master Workflows",
    description:
      "Hardened tips from senior architects and researchers to unlock the full potential of Selene:",
    highlights: [
      "Hermes' Wings Export Suite: Export your documents to 9 different formats—including print-ready PDF with KaTeX math, standalone HTML with bundled sandboxes, LaTeX ZIP packages, SSG static sites, and Jupyter Notebooks (.ipynb).",
      "Hephaestus's Terminal Presets: Use the terminal drawer (Ctrl+`) to run tests (`npm test`), check git status (`git status`), or execute build scripts without leaving the editor.",
      "Custom Astronomical Lunar Widget: Click the lunar phase badge in the top-right to view real-time synodic moon age, percentage illumination, and classical Greek lunar nomenclature.",
      "Local LLM Support: Configure custom Ollama or LM Studio endpoints in Settings to run AI inference 100% locally with complete data sovereignty.",
    ],
  },
];

export function AthenaTipsModal({
  isOpen,
  onClose,
  onOpenDualView,
  onOpenWhiteboard,
  onOpenChronos,
  onOpenDelphicOracle,
}: AthenaTipsModalProps) {
  const [activeCategory, setActiveCategory] = useState<TipCategory>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: TipCategory; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview & Quick Start", icon: Compass },
    { id: "sandboxes", label: "20 Living Sandboxes", icon: Code2 },
    { id: "split-panes", label: "Split Panes & Dual View", icon: Columns },
    { id: "whiteboard", label: "Daedalus's Whiteboard", icon: PenTool },
    { id: "chronos", label: "Chronos Timeline & Diff", icon: History },
    { id: "orbit-collab", label: "Orbit Link P2P Collab", icon: Users },
    { id: "ai-oracle", label: "Delphic Oracle AI", icon: Sparkles },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: Terminal },
    { id: "pro-tips", label: "Olympian Pro-Tips", icon: Lightbulb },
  ];

  const filteredTips = useMemo(() => {
    return TIPS_CATALOG.filter((tip) => {
      const matchesCategory = searchQuery.trim() ? true : tip.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tip.badge && tip.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tip.codeSnippet && tip.codeSnippet.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] max-h-[820px] bg-[#090d1a] border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Ethereal Glow Elements */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300 shadow-md">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Athena&apos;s Wisdom: Olympian Master Guide &amp; Tips Suite
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold uppercase">
                  Instruction Manual
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Architectural instructions, engine directory, split-screen ergonomics, and pro tips to maximize Selene.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Guide (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="relative px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all instructions, sandboxes, keyboard shortcuts, or pro-tips..."
              className="w-full rounded-xl bg-slate-900/80 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Body Layout: Sidebar Navigation + Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Navigation Category List */}
          <div className="w-60 border-r border-slate-800 bg-slate-950/60 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              Knowledge Chapters
            </div>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id && !searchQuery.trim();
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-indigo-500/10 border border-amber-500/30 text-amber-200 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-400" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              );
            })}

            {/* Quick Interactive Jump Links */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                Direct Invocations
              </div>
              {onOpenDualView && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDualView();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Launch Dual View</span>
                </button>
              )}
              {onOpenWhiteboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWhiteboard();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Whiteboard</span>
                </button>
              )}
              {onOpenChronos && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChronos();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Inspect Chronos</span>
                </button>
              )}
              {onOpenDelphicOracle && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDelphicOracle();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Delphic Oracle</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Main Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {filteredTips.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p>No instructions match your search inquiry.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-amber-400 hover:underline"
                >
                  Reset search filters
                </button>
              </div>
            ) : (
              filteredTips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/30 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {tip.title}
                      </h3>
                      {tip.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {tip.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tip.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                    {tip.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Code Snippet Box (if applicable) */}
                  {tip.codeSnippet && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#060812]">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                        <span className="uppercase font-bold text-amber-400">{tip.codeLang || "code"} specimen</span>
                        <button
                          onClick={() => handleCopy(tip.id, tip.codeSnippet || "")}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === tip.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Block</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
                        <code>{tip.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Mythology Lore Footnote */}
                  {tip.mythologyNote && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-300/80 bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{tip.mythologyNote}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>Athena&apos;s Wisdom • Titan Edition</span>
            <span>•</span>
            <span className="font-mono text-amber-400">Press F1 to open anytime</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md transition-all cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
