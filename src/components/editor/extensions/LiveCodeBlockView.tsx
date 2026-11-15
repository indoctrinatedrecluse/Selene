"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Check, Copy, Terminal, Eye } from "lucide-react";

// Celestial loading skeleton for lazily loaded engines
function RendererSkeleton({ name }: { name?: string }) {
  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-950/80 p-6 flex items-center justify-center space-x-3 text-slate-400 text-xs font-mono animate-pulse">
      <div className="w-2.5 h-2.5 rounded-full bg-sky-400/80 animate-ping" />
      <span>Illuminating {name || "Polymorphic"} engine...</span>
    </div>
  );
}

// Dynamically split heavy render engines to reduce initial client bundle
const LiveSandboxRenderer = dynamic(
  () => import("@/components/render-engine/LiveSandboxRenderer").then((m) => m.LiveSandboxRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Live Sandbox" /> }
);
const MermaidRenderer = dynamic(
  () => import("@/components/render-engine/MermaidRenderer").then((m) => m.MermaidRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Mermaid Diagram" /> }
);
const MathRenderer = dynamic(
  () => import("@/components/render-engine/MathRenderer").then((m) => m.MathRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="KaTeX Math" /> }
);
const FlutterWebRenderer = dynamic(
  () => import("@/components/render-engine/FlutterWebRenderer").then((m) => m.FlutterWebRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Flutter Web" /> }
);
const PythonNotebookRenderer = dynamic(
  () => import("@/components/render-engine/PythonNotebookRenderer").then((m) => m.PythonNotebookRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Pyodide WASM" /> }
);
const PhpLaravelRenderer = dynamic(
  () => import("@/components/render-engine/PhpLaravelRenderer").then((m) => m.PhpLaravelRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="PHP Laravel" /> }
);
const RubyRailsRenderer = dynamic(
  () => import("@/components/render-engine/RubyRailsRenderer").then((m) => m.RubyRailsRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Ruby on Rails" /> }
);
const GoTemplateRenderer = dynamic(
  () => import("@/components/render-engine/GoTemplateRenderer").then((m) => m.GoTemplateRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Go Hugo Template" /> }
);
const DjangoJinjaRenderer = dynamic(
  () => import("@/components/render-engine/DjangoJinjaRenderer").then((m) => m.DjangoJinjaRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Django Jinja" /> }
);
const RustWasmRenderer = dynamic(
  () => import("@/components/render-engine/RustWasmRenderer").then((m) => m.RustWasmRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Rust WASM" /> }
);
const SqlDataStudioRenderer = dynamic(
  () => import("@/components/render-engine/SqlDataStudioRenderer").then((m) => m.SqlDataStudioRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="SQL Studio" /> }
);
const ShaderCanvasRenderer = dynamic(
  () => import("@/components/render-engine/ShaderCanvasRenderer").then((m) => m.ShaderCanvasRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="GLSL Raymarching" /> }
);
const DeclarativeChartRenderer = dynamic(
  () => import("@/components/render-engine/DeclarativeChartRenderer").then((m) => m.DeclarativeChartRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Declarative Chart" /> }
);
const DuckDbStudioRenderer = dynamic(
  () => import("@/components/render-engine/DuckDbStudioRenderer").then((m) => m.DuckDbStudioRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="DuckDB OLAP" /> }
);
const PhoenixLiveViewRenderer = dynamic(
  () => import("@/components/render-engine/PhoenixLiveViewRenderer").then((m) => m.PhoenixLiveViewRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Phoenix LiveView" /> }
);
const SwiftUiRenderer = dynamic(
  () => import("@/components/render-engine/SwiftUiRenderer").then((m) => m.SwiftUiRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="SwiftUI Canvas" /> }
);
const HermesRelayRenderer = dynamic(
  () => import("@/components/render-engine/HermesRelayRenderer").then((m) => m.HermesRelayRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Hermes Relay API" /> }
);
const WaveDromRenderer = dynamic(
  () => import("@/components/render-engine/WaveDromRenderer").then((m) => m.WaveDromRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="WaveDrom Timing" /> }
);
const D2DiagramRenderer = dynamic(
  () => import("@/components/render-engine/D2DiagramRenderer").then((m) => m.D2DiagramRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="D2 Modern DAG" /> }
);
const WatBytecodeRenderer = dynamic(
  () => import("@/components/render-engine/WatBytecodeRenderer").then((m) => m.WatBytecodeRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="WASM32 Stack" /> }
);
const TypstRenderer = dynamic(
  () => import("@/components/render-engine/TypstRenderer").then((m) => m.TypstRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="Typst Typesetter" /> }
);
const RStatisticalRenderer = dynamic(
  () => import("@/components/render-engine/RStatisticalRenderer").then((m) => m.RStatisticalRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="WebR Statistical" /> }
);
const OpenScadRenderer = dynamic(
  () => import("@/components/render-engine/OpenScadRenderer").then((m) => m.OpenScadRenderer),
  { ssr: false, loading: () => <RendererSkeleton name="OpenSCAD 3D CSG" /> }
);

const LIVE_WEB_LANGUAGES = ["tsx", "jsx", "react", "vue", "svelte", "angular", "html", "static"];

export function LiveCodeBlockView(props: NodeViewProps) {
  const { node, updateAttributes, editor, getPos } = props;
  const language = (node.attrs.language || "typescript").toLowerCase();
  const rawCode = node.textContent;

  const [copied, setCopied] = useState(false);
  const [showLiveRender, setShowLiveRender] = useState(true);

  const isLiveWeb = LIVE_WEB_LANGUAGES.includes(language);
  const isFlutter = language === "dart" || language === "flutter";
  const isPython = language === "python" || language === "py" || language === "notebook";
  const isPhpLaravel = language === "php" || language === "laravel" || language === "blade";
  const isRubyRails = language === "ruby" || language === "rails" || language === "erb";
  const isGoTemplate = language === "go" || language === "golang" || language === "gotemplate" || language === "hugo";
  const isDjangoJinja = language === "django" || language === "jinja" || language === "jinja2";
  const isRustWasm = language === "rust" || language === "rs" || language === "yew" || language === "leptos" || language === "wasm";
  const isSql = language === "sql" || language === "sqlite" || language === "libsql";
  const isShader = language === "glsl" || language === "wgsl" || language === "shader" || language === "cpp";
  const isMermaid = language === "mermaid";
  const isMath = language === "math" || language === "latex";
  const isChart = language === "chart" || language === "plot";
  const isDuckDb = language === "duckdb" || language === "olap" || language === "parquet";
  const isPhoenixLiveView = language === "heex" || language === "liveview" || language === "elixir" || language === "phoenix";
  const isSwiftUi = language === "swift" || language === "swiftui";
  const isHermesRelay = language === "http" || language === "rest" || language === "curl" || language === "graphql";
  const isWaveDrom = language === "wavedrom" || language === "waveform" || language === "regview";
  const isD2 = language === "d2" || language === "d2lang";
  const isWat = language === "wat" || language === "wast";
  const isTypst = language === "typst";
  const isR = language === "r" || language === "webr";
  const isOpenScad = language === "openscad" || language === "scad";

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = (newCode: string) => {
    if (typeof getPos !== "function" || !editor) return;
    const pos = getPos();
    if (pos === undefined) return;
    if (newCode === node.textContent) return;

    const from = pos + 1;
    const to = pos + node.nodeSize - 1;
    const { tr } = editor.state;
    tr.setMeta("addToHistory", true);
    if (newCode) {
      tr.replaceWith(from, to, editor.schema.text(newCode));
    } else {
      tr.delete(from, to);
    }
    editor.view.dispatch(tr);
  };

  // If it's a web stack snippet and live render is enabled, render the Sandpack Live Engine!
  if (isLiveWeb && showLiveRender) {
    return (
      <NodeViewWrapper className="live-code-block my-4">
        <LiveSandboxRenderer
          initialCode={rawCode}
          language={language}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Flutter / Dart widget block and live render is enabled, render the Flutter Web Canvas!
  if (isFlutter && showLiveRender) {
    return (
      <NodeViewWrapper className="flutter-block my-4">
        <FlutterWebRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Python computational cell and live render is enabled, render the Pyodide WASM Kernel!
  if (isPython && showLiveRender) {
    return (
      <NodeViewWrapper className="python-block my-4">
        <PythonNotebookRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a PHP / Laravel Blade template and live render is enabled, render the Blade engine!
  if (isPhpLaravel && showLiveRender) {
    return (
      <NodeViewWrapper className="php-laravel-block my-4">
        <PhpLaravelRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Ruby on Rails ERB template and live render is enabled, render the Rails engine!
  if (isRubyRails && showLiveRender) {
    return (
      <NodeViewWrapper className="ruby-rails-block my-4">
        <RubyRailsRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Go html/template and live render is enabled, render the Go engine!
  if (isGoTemplate && showLiveRender) {
    return (
      <NodeViewWrapper className="go-template-block my-4">
        <GoTemplateRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Django / Jinja2 template and live render is enabled, render the Django engine!
  if (isDjangoJinja && showLiveRender) {
    return (
      <NodeViewWrapper className="django-jinja-block my-4">
        <DjangoJinjaRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Rust WebAssembly (Yew / Leptos) component
  if (isRustWasm && showLiveRender) {
    return (
      <NodeViewWrapper className="rust-wasm-block my-4">
        <RustWasmRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a SQL / SQLite / LibSQL query block
  if (isSql && showLiveRender) {
    return (
      <NodeViewWrapper className="sql-studio-block my-4">
        <SqlDataStudioRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a WebGL / GLSL Canvas Shader
  if (isShader && showLiveRender) {
    return (
      <NodeViewWrapper className="shader-canvas-block my-4">
        <ShaderCanvasRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Mermaid diagram
  if (isMermaid) {
    return (
      <NodeViewWrapper className="mermaid-block my-4">
        <MermaidRenderer code={rawCode} />
      </NodeViewWrapper>
    );
  }

  // If it's a LaTeX Math block
  if (isMath) {
    return (
      <NodeViewWrapper className="math-block my-4">
        <MathRenderer formula={rawCode} displayMode={true} />
      </NodeViewWrapper>
    );
  }

  // If it's a Declarative Chart / Plot block
  if (isChart && showLiveRender) {
    return (
      <NodeViewWrapper className="chart-block my-4">
        <DeclarativeChartRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an Analytical DuckDB / OLAP SQL block
  if (isDuckDb && showLiveRender) {
    return (
      <NodeViewWrapper className="duckdb-block my-4">
        <DuckDbStudioRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an Elixir / Phoenix LiveView HEEx block
  if (isPhoenixLiveView && showLiveRender) {
    return (
      <NodeViewWrapper className="phoenix-liveview-block my-4">
        <PhoenixLiveViewRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an Apple Swift / SwiftUI declarative component block
  if (isSwiftUi && showLiveRender) {
    return (
      <NodeViewWrapper className="swiftui-block my-4">
        <SwiftUiRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an HTTP / REST / cURL / GraphQL API block and live render is enabled, render Hermes Relay!
  if (isHermesRelay && showLiveRender) {
    return (
      <NodeViewWrapper className="hermes-relay-block my-4">
        <HermesRelayRenderer
          initialCode={rawCode}
          language={language}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a WaveDrom digital timing or register bitfield block
  if (isWaveDrom && showLiveRender) {
    return (
      <NodeViewWrapper className="wavedrom-block my-4">
        <WaveDromRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a D2 Architecture Diagram block
  if (isD2 && showLiveRender) {
    return (
      <NodeViewWrapper className="d2-block my-4">
        <D2DiagramRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a WebAssembly Text (WAT) bytecode block
  if (isWat && showLiveRender) {
    return (
      <NodeViewWrapper className="wat-block my-4">
        <WatBytecodeRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Typst academic typeset document block
  if (isTypst && showLiveRender) {
    return (
      <NodeViewWrapper className="typst-block my-4">
        <TypstRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an R statistical / WebR block
  if (isR && showLiveRender) {
    return (
      <NodeViewWrapper className="r-block my-4">
        <RStatisticalRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // If it's an OpenSCAD 3D parametric CAD block
  if (isOpenScad && showLiveRender) {
    return (
      <NodeViewWrapper className="openscad-block my-4">
        <OpenScadRenderer
          initialCode={rawCode}
          className="shadow-2xl"
          onCodeChange={handleCodeChange}
        />
      </NodeViewWrapper>
    );
  }

  // Standard high-performance code block
  return (
    <NodeViewWrapper className="relative my-4 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-transparent border-none text-slate-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="typescript">typescript</option>
            <option value="javascript">javascript</option>
            <option value="http">http (Hermes Relay)</option>
            <option value="rest">rest (Hermes Relay)</option>
            <option value="curl">curl (Hermes Relay)</option>
            <option value="graphql">graphql (Hermes Relay)</option>
            <option value="wavedrom">wavedrom (digital timing)</option>
            <option value="regview">regview (register bits)</option>
            <option value="d2">d2 (architecture DAG)</option>
            <option value="wat">wat (webassembly text)</option>
            <option value="typst">typst (academic typeset)</option>
            <option value="r">r (WebR statistical)</option>
            <option value="openscad">openscad (3D parametric CAD)</option>
            <option value="chart">chart (declarative)</option>
            <option value="plot">plot (declarative)</option>
            <option value="duckdb">duckdb (live OLAP)</option>
            <option value="parquet">parquet (columnar)</option>
            <option value="sql">sql (studio)</option>
            <option value="tsx">tsx (live)</option>
            <option value="jsx">jsx (live)</option>
            <option value="vue">vue (live)</option>
            <option value="svelte">svelte (live)</option>
            <option value="angular">angular (live)</option>
            <option value="flutter">flutter (live)</option>
            <option value="dart">dart (live)</option>
            <option value="blade">blade (live)</option>
            <option value="php">php (live)</option>
            <option value="laravel">laravel (live)</option>
            <option value="erb">erb (live)</option>
            <option value="rails">rails (live)</option>
            <option value="ruby">ruby (live)</option>
            <option value="go">go (live template)</option>
            <option value="gotemplate">gotemplate (live)</option>
            <option value="django">django (live)</option>
            <option value="jinja2">jinja2 (live)</option>
            <option value="heex">heex (Phoenix LiveView)</option>
            <option value="liveview">liveview (Phoenix)</option>
            <option value="elixir">elixir (Phoenix)</option>
            <option value="swift">swift (SwiftUI)</option>
            <option value="swiftui">swiftui (live)</option>
            <option value="html">html (live)</option>
            <option value="mermaid">mermaid (diagram)</option>
            <option value="python">python (live WASM)</option>
            <option value="py">py (live WASM)</option>
            <option value="rust">rust</option>
            <option value="glsl">glsl (shader)</option>
            <option value="json">json</option>
            <option value="css">css</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {(LIVE_WEB_LANGUAGES.includes(language) || isFlutter || isPython || isPhpLaravel || isRubyRails || isGoTemplate || isDjangoJinja || isRustWasm || isChart || isDuckDb || isSql || isShader || isPhoenixLiveView || isSwiftUi || isHermesRelay) && (
            <button
              onClick={() => setShowLiveRender(true)}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
        <code className={`language-${language}`}>{rawCode}</code>
      </pre>
    </NodeViewWrapper>
  );
}
