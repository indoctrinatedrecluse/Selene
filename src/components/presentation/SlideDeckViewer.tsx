"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  X,
  RotateCcw,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { LiveSandboxRenderer } from "@/components/render-engine/LiveSandboxRenderer";
import { FlutterWebRenderer } from "@/components/render-engine/FlutterWebRenderer";
import { PythonNotebookRenderer } from "@/components/render-engine/PythonNotebookRenderer";
import { MermaidRenderer } from "@/components/render-engine/MermaidRenderer";
import { MathRenderer } from "@/components/render-engine/MathRenderer";
import { PhoenixLiveViewRenderer } from "@/components/render-engine/PhoenixLiveViewRenderer";
import { SwiftUiRenderer } from "@/components/render-engine/SwiftUiRenderer";
import { HermesRelayRenderer } from "@/components/render-engine/HermesRelayRenderer";
import { PhpLaravelRenderer } from "@/components/render-engine/PhpLaravelRenderer";
import { RubyRailsRenderer } from "@/components/render-engine/RubyRailsRenderer";
import { GoTemplateRenderer } from "@/components/render-engine/GoTemplateRenderer";
import { DjangoJinjaRenderer } from "@/components/render-engine/DjangoJinjaRenderer";
import { RustWasmRenderer } from "@/components/render-engine/RustWasmRenderer";
import { SqlDataStudioRenderer } from "@/components/render-engine/SqlDataStudioRenderer";
import { DuckDbStudioRenderer } from "@/components/render-engine/DuckDbStudioRenderer";
import { DeclarativeChartRenderer } from "@/components/render-engine/DeclarativeChartRenderer";
import { ShaderCanvasRenderer } from "@/components/render-engine/ShaderCanvasRenderer";

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  markdown: string;
  codeBlock?: {
    lang: string;
    code: string;
  };
  mermaid?: string;
  math?: string;
}

interface SlideDeckViewerProps {
  documentTitle: string;
  markdownContent: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Parses markdown document into clean presentation slides.
 */
export function parseMarkdownToSlides(markdown: string, docTitle: string): SlideData[] {
  // Split on horizontal rules (---) or major headings (## )
  const rawSections = markdown.split(/\n(?:---|___|\*\*\*)\n|\n(?=##?\s+)/);
  const slides: SlideData[] = [];

  // Title Slide
  slides.push({
    id: "slide-title",
    title: docTitle,
    subtitle: "🌙 Interactive Architecture & Live Technical Presentation",
    markdown: `Welcome to **${docTitle}** — powered by the Selene Polymorphic Presentation Engine.`,
  });

  rawSections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    const lines = trimmed.split("\n");
    let title = `Slide ${slides.length + 1}`;
    let subtitle: string | undefined;

    // Check heading
    const firstLine = lines[0]?.trim();
    if (firstLine?.startsWith("#")) {
      title = firstLine.replace(/^#+\s*/, "").replace(/[*_`]/g, "");
      lines.shift();
    }

    // Extract code block if present
    const sectionText = lines.join("\n");
    const codeMatch = sectionText.match(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);

    let codeBlock: SlideData["codeBlock"];
    let mermaid: string | undefined;
    let math: string | undefined;

    if (codeMatch) {
      const lang = (codeMatch[1] || "").toLowerCase();
      const code = codeMatch[2].trim();

      if (lang === "mermaid") {
        mermaid = code;
      } else if (lang === "math" || lang === "latex") {
        math = code;
      } else if (lang) {
        codeBlock = { lang, code };
      }
    }

    // Clean remaining markdown
    const cleanedMd = sectionText
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    slides.push({
      id: `slide-${index + 1}`,
      title,
      subtitle,
      markdown: cleanedMd,
      codeBlock,
      mermaid,
      math,
    });
  });

  return slides.length > 1 ? slides : [
    {
      id: "slide-default",
      title: docTitle,
      subtitle: "Presentation Mode",
      markdown: markdown,
    },
  ];
}

export function SlideDeckViewer({
  documentTitle,
  markdownContent,
  isOpen,
  onClose,
}: SlideDeckViewerProps) {
  const slides = useMemo(
    () => parseMarkdownToSlides(markdownContent, documentTitle),
    [markdownContent, documentTitle]
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Timer effect
  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "t") {
        setShowThumbnails((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A14] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Slide Progress Bar */}
      <div className="h-1 bg-slate-900 w-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-400 transition-all duration-300"
          style={{
            width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Presenter Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
            🎭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                The Dionysian Amphitheater
              </span>
              <span className="text-[10px] font-serif italic text-slate-400 font-normal">
                (Selene Presentation Deck)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Stanza {currentSlideIndex + 1} of {slides.length} • {documentTitle}
            </div>
          </div>
        </div>

        {/* Center: Presentation Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <button
            type="button"
            onClick={() => setIsTimerRunning((r) => !r)}
            className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isTimerRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>⏱️ {formatTimer(elapsedSeconds)}</span>
          </button>
          <button
            type="button"
            onClick={() => setElapsedSeconds(0)}
            className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              showThumbnails
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Slide Thumbnails (T)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            title="Exit Slide Deck (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Slide Body Canvas */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Main Active Slide Display */}
        <main className="flex-1 flex flex-col justify-center items-center p-8 md:p-14 overflow-y-auto max-w-6xl mx-auto w-full">
          <div className="w-full space-y-6">
            {/* Slide Header */}
            <div className="space-y-2 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  Slide {currentSlideIndex + 1}
                </span>
                {currentSlide.codeBlock && (
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Live Running {currentSlide.codeBlock.lang.toUpperCase()}</span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className="text-sm md:text-base text-slate-400 font-mono">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Prose Content */}
            {currentSlide.markdown && (
              <div className="text-base md:text-lg text-slate-300 leading-relaxed font-normal whitespace-pre-line max-w-4xl">
                {currentSlide.markdown}
              </div>
            )}

            {/* Live Interactive Code Block if on this slide */}
            {currentSlide.codeBlock && (
              <div className="w-full my-4 shadow-2xl rounded-xl overflow-hidden border border-slate-800">
                {["heex", "liveview"].includes(currentSlide.codeBlock.lang) ? (
                  <PhoenixLiveViewRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["swift", "swiftui"].includes(currentSlide.codeBlock.lang) ? (
                  <SwiftUiRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["http", "rest", "curl", "graphql"].includes(currentSlide.codeBlock.lang) ? (
                  <HermesRelayRenderer initialCode={currentSlide.codeBlock.code} language={currentSlide.codeBlock.lang} className="!my-0" />
                ) : ["flutter", "dart"].includes(currentSlide.codeBlock.lang) ? (
                  <FlutterWebRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["python", "py", "notebook"].includes(currentSlide.codeBlock.lang) ? (
                  <PythonNotebookRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["php", "blade"].includes(currentSlide.codeBlock.lang) ? (
                  <PhpLaravelRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["ruby", "erb", "rails"].includes(currentSlide.codeBlock.lang) ? (
                  <RubyRailsRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["go", "hugo"].includes(currentSlide.codeBlock.lang) ? (
                  <GoTemplateRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["django", "jinja", "jinja2"].includes(currentSlide.codeBlock.lang) ? (
                  <DjangoJinjaRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["rust", "yew", "leptos"].includes(currentSlide.codeBlock.lang) ? (
                  <RustWasmRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["sql", "sqlite", "libsql"].includes(currentSlide.codeBlock.lang) ? (
                  <SqlDataStudioRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["duckdb"].includes(currentSlide.codeBlock.lang) ? (
                  <DuckDbStudioRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["chart"].includes(currentSlide.codeBlock.lang) ? (
                  <DeclarativeChartRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : ["glsl", "shader"].includes(currentSlide.codeBlock.lang) ? (
                  <ShaderCanvasRenderer initialCode={currentSlide.codeBlock.code} className="!my-0" />
                ) : (
                  <LiveSandboxRenderer
                    initialCode={currentSlide.codeBlock.code}
                    language={currentSlide.codeBlock.lang}
                    className="!my-0"
                  />
                )}
              </div>
            )}

            {/* Mermaid Diagram if on this slide */}
            {currentSlide.mermaid && (
              <div className="w-full my-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl flex justify-center">
                <MermaidRenderer code={currentSlide.mermaid} />
              </div>
            )}

            {/* Math Formula if on this slide */}
            {currentSlide.math && (
              <div className="w-full my-4 p-8 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl flex justify-center text-xl">
                <MathRenderer formula={currentSlide.math} displayMode={true} />
              </div>
            )}
          </div>
        </main>

        {/* Thumbnail Sidebar Drawer (if open) */}
        {showThumbnails && (
          <aside className="w-72 bg-slate-950 border-l border-slate-800 p-4 overflow-y-auto space-y-3 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <span>All Slides ({slides.length})</span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  currentSlideIndex === idx
                    ? "bg-slate-900 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/50"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-sky-400">Slide {idx + 1}</span>
                  {s.codeBlock && <span className="text-emerald-400">Live</span>}
                </div>
                <div className="text-xs font-bold line-clamp-1">{s.title}</div>
              </button>
            ))}
          </aside>
        )}
      </div>

      {/* Presenter Navigation Bottom Bar */}
      <footer className="flex items-center justify-between px-6 py-3 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md">
        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd>{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> or{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> to navigate
        </div>

        {/* Center: Slide indicator */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlideIndex === idx
                  ? "w-8 bg-sky-400 shadow-sm shadow-sky-400/50"
                  : "w-2 bg-slate-800 hover:bg-slate-700"
              }`}
              title={`Go to Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-xs font-semibold transition-all cursor-pointer shadow"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
