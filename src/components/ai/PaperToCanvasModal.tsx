"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Sparkles,
  Check,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from "lucide-react";

interface PaperToCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (markdown: string) => void;
  onCreateNewDoc?: (title: string, markdown: string) => void;
}

export type IngestionMode =
  | "academic_paper"
  | "architecture_diagram"
  | "math_formula"
  | "general_document";

const INGESTION_MODES: { id: IngestionMode; label: string; icon: string; desc: string }[] = [
  {
    id: "academic_paper",
    label: "Academic Paper / PDF",
    icon: "📄",
    desc: "Extracts sections, equations (KaTeX), citations, and diagrams.",
  },
  {
    id: "architecture_diagram",
    label: "Whiteboard / Architecture",
    icon: "🏛️",
    desc: "Transcribes sketch images into live Mermaid.js SVG diagrams.",
  },
  {
    id: "math_formula",
    label: "Handwritten Math",
    icon: "📐",
    desc: "Converts photographed formulas into publication-grade LaTeX.",
  },
  {
    id: "general_document",
    label: "General Technical Doc",
    icon: "📝",
    desc: "Preserves headings, lists, tables, callouts, and code listings.",
  },
];

export function PaperToCanvasModal({
  isOpen,
  onClose,
  onInsertContent,
  onCreateNewDoc,
}: PaperToCanvasModalProps) {
  const [mode, setMode] = useState<IngestionMode>("academic_paper");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [extractedMarkdown, setExtractedMarkdown] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setFileName(file.name);
    setMimeType(file.type || "image/png");

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileData(result);
      setExtractedMarkdown("");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      handleFile(e.clipboardData.files[0]);
    }
  };

  const handleTranscribe = async () => {
    if (!fileData) return;
    setIsProcessing(true);
    setProgressStep(1);

    const stepTimer = setInterval(() => {
      setProgressStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch("/api/ai/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData,
          mimeType,
          documentName: fileName,
          mode,
        }),
      });

      const data = await res.json();
      if (data.success && data.markdown) {
        setExtractedMarkdown(data.markdown);
      }
    } catch (err) {
      console.error("Failed to transcribe paper", err);
    } finally {
      clearInterval(stepTimer);
      setIsProcessing(false);
      setProgressStep(0);
    }
  };

  const handleInsert = () => {
    if (extractedMarkdown) {
      onInsertContent(extractedMarkdown);
      onClose();
    }
  };

  const handleCreateNew = () => {
    if (extractedMarkdown && onCreateNewDoc) {
      const cleanTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Ingested Paper";
      onCreateNewDoc(cleanTitle, extractedMarkdown);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onPaste={handlePaste}
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Paper-to-Canvas Multimodal Ingestion</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono">
                  Vision + KaTeX + Mermaid
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload or paste research papers, architecture diagrams, or handwritten math formulas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingestion Mode Selector */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/30 flex items-center gap-2 overflow-x-auto">
          {INGESTION_MODES.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                mode === item.id
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!fileData && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDragging
                  ? "border-sky-400 bg-sky-950/20"
                  : "border-slate-700 hover:border-slate-500 bg-slate-950/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Drag and drop research paper, image, or PDF here
              </h3>
              <p className="text-xs text-slate-400 text-center max-w-sm mb-3">
                Supports screenshots, diagrams, PDFs, and whiteboard photos. You can also press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">Ctrl+V</kbd> to paste directly from your clipboard.
              </p>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors">
                Browse Files
              </span>
            </div>
          )}

          {fileData && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{mimeType.includes("pdf") ? "📄" : "🖼️"}</span>
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-md">
                      {fileName || "Pasted Image from Clipboard"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Target Mode: {INGESTION_MODES.find((m) => m.id === mode)?.label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFileData(null);
                      setExtractedMarkdown("");
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Replace File
                  </button>
                  <button
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Transcribe with Vision AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Bar during processing */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-sky-300">
                    <span>
                      {progressStep === 1 && "1/3 Uploading and reading optical glyphs..."}
                      {progressStep === 2 && "2/3 Parsing mathematical formulas & Mermaid diagrams..."}
                      {progressStep === 3 && "3/3 Structuring document into hypermodern Markdown..."}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${Math.max(25, progressStep * 33)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Markdown Preview */}
              {extractedMarkdown && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Transcribed Technical Markdown Preview</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {extractedMarkdown.split("\n").length} lines generated
                    </span>
                  </div>
                  <textarea
                    value={extractedMarkdown}
                    onChange={(e) => setExtractedMarkdown(e.target.value)}
                    rows={12}
                    className="w-full rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800 focus:border-sky-500 focus:outline-none leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {onCreateNewDoc && extractedMarkdown && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <span>Create New Document</span>
              </button>
            )}
            <button
              onClick={handleInsert}
              disabled={!extractedMarkdown}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
            >
              <span>Insert into Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
