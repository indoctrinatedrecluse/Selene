"use client";

import React, { useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { LiveSandboxRenderer } from "@/components/render-engine/LiveSandboxRenderer";
import { MermaidRenderer } from "@/components/render-engine/MermaidRenderer";
import { MathRenderer } from "@/components/render-engine/MathRenderer";
import { FlutterWebRenderer } from "@/components/render-engine/FlutterWebRenderer";
import { PythonNotebookRenderer } from "@/components/render-engine/PythonNotebookRenderer";
import { PhpLaravelRenderer } from "@/components/render-engine/PhpLaravelRenderer";
import { RubyRailsRenderer } from "@/components/render-engine/RubyRailsRenderer";
import { GoTemplateRenderer } from "@/components/render-engine/GoTemplateRenderer";
import { DjangoJinjaRenderer } from "@/components/render-engine/DjangoJinjaRenderer";
import { RustWasmRenderer } from "@/components/render-engine/RustWasmRenderer";
import { SqlDataStudioRenderer } from "@/components/render-engine/SqlDataStudioRenderer";
import { ShaderCanvasRenderer } from "@/components/render-engine/ShaderCanvasRenderer";
import { DeclarativeChartRenderer } from "@/components/render-engine/DeclarativeChartRenderer";
import { DuckDbStudioRenderer } from "@/components/render-engine/DuckDbStudioRenderer";
import { Check, Copy, Terminal, Eye } from "lucide-react";

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
          {(LIVE_WEB_LANGUAGES.includes(language) || isFlutter || isPython || isPhpLaravel || isRubyRails || isGoTemplate || isDjangoJinja || isChart || isDuckDb || isSql || isShader) && (
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
