"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Highlighter,
  Square,
  Circle,
  MoveRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Camera,
  X,
  Eye,
  Edit3,
  Download,
  Minus,
} from "lucide-react";

export type WhiteboardTool =
  | "pen"
  | "highlighter"
  | "arrow"
  | "rect"
  | "circle"
  | "eraser";

export interface StrokePoint {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  tool: WhiteboardTool;
  color: string;
  width: number;
  points: StrokePoint[];
}

const COLORS = [
  { name: "Cyan", value: "#38bdf8" },
  { name: "Emerald", value: "#34d399" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Violet", value: "#a855f7" },
  { name: "White", value: "#f8fafc" },
];

const STROKE_WIDTHS = [
  { name: "Fine", value: 2 },
  { name: "Medium", value: 4 },
  { name: "Bold", value: 8 },
];

interface WhiteboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  onInsertSnapshot?: (dataUrl: string) => void;
}

export function WhiteboardOverlay({
  isOpen,
  onClose,
  documentId,
  onInsertSnapshot,
}: WhiteboardOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<WhiteboardTool>("pen");
  const [activeColor, setActiveColor] = useState<string>("#38bdf8");
  const [activeWidth, setActiveWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInspectMode, setIsInspectMode] = useState(false); // Passthrough mode
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

  const [prevDocId, setPrevDocId] = useState(documentId);
  const [elements, setElements] = useState<WhiteboardElement[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`selene_sketch_${documentId}`);
      if (saved) return JSON.parse(saved) as WhiteboardElement[];
    } catch {
      // Ignored
    }
    return [];
  });
  const [history, setHistory] = useState<WhiteboardElement[][]>(() => [elements]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Sync state if documentId changes
  if (prevDocId !== documentId) {
    setPrevDocId(documentId);
    let loaded: WhiteboardElement[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`selene_sketch_${documentId}`);
        if (saved) loaded = JSON.parse(saved) as WhiteboardElement[];
      } catch {
        // Ignored
      }
    }
    setElements(loaded);
    setHistory([loaded]);
    setHistoryIndex(0);
  }

  const currentStrokeRef = useRef<WhiteboardElement | null>(null);

  // Save annotations to localStorage whenever elements change
  const saveToStorage = useCallback(
    (elems: WhiteboardElement[]) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(`selene_sketch_${documentId}`, JSON.stringify(elems));
      } catch (err) {
        console.error("Failed to persist sketch overlay", err);
      }
    },
    [documentId]
  );

  // Resize canvas to match container size
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Redraw all elements
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const allToDraw = currentStrokeRef.current
      ? [...elements, currentStrokeRef.current]
      : elements;

    allToDraw.forEach((el) => {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = el.width * 4;
      } else if (el.tool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width * 3.5;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
      }

      const pts = el.points;
      if (pts.length === 0) {
        ctx.restore();
        return;
      }

      if (el.tool === "rect" && pts.length >= 2) {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (el.tool === "circle" && pts.length >= 2) {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const radius = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.tool === "arrow" && pts.length >= 2) {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        // Draw line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = Math.max(12, el.width * 3.5);
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle - Math.PI / 6),
          p2.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle + Math.PI / 6),
          p2.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else {
        // Freehand line / highlighter / eraser
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        if (pts.length < 3) {
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
        } else {
          for (let i = 1; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          const last = pts[pts.length - 1];
          ctx.lineTo(last.x, last.y);
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [elements]);

  useEffect(() => {
    if (isOpen) {
      updateCanvasSize();
      redrawCanvas();
      window.addEventListener("resize", updateCanvasSize);
      return () => window.removeEventListener("resize", updateCanvasSize);
    }
  }, [isOpen, updateCanvasSize, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [elements, redrawCanvas]);

  // Pointer position helper
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isInspectMode) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const pt = getCanvasPoint(e);
    const newEl: WhiteboardElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tool: activeTool,
      color: activeColor,
      width: activeWidth,
      points: [pt],
    };
    currentStrokeRef.current = newEl;
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const pt = getCanvasPoint(e);

    if (
      activeTool === "rect" ||
      activeTool === "circle" ||
      activeTool === "arrow"
    ) {
      currentStrokeRef.current.points = [currentStrokeRef.current.points[0], pt];
    } else {
      currentStrokeRef.current.points.push(pt);
    }
    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    setIsDrawing(false);

    const finalEl = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (finalEl && finalEl.points.length > 0) {
      const nextElements = [...elements, finalEl];
      setElements(nextElements);
      saveToStorage(nextElements);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(nextElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setElements(prev);
      saveToStorage(prev);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history, saveToStorage]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setElements(next);
      saveToStorage(next);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history, saveToStorage]);

  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm("Clear all whiteboard markup on this canvas?")) {
      setElements([]);
      saveToStorage([]);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `selene-markup-${documentId}-${Date.now()}.png`;
    a.click();
  };

  const handleSnapshotToDoc = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onInsertSnapshot) return;
    const dataUrl = canvas.toDataURL("image/png");
    onInsertSnapshot(dataUrl);
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Esc)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleUndo, handleRedo, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-40 ${
        isInspectMode ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full touch-none ${
          isInspectMode ? "cursor-default" : "cursor-crosshair"
        }`}
      />

      {/* Floating Ergonomic Annotation Toolbar */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-200 ${
          isToolbarCollapsed ? "opacity-90 hover:opacity-100" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-200">
          {/* Main Top Action Row */}
          <div className="flex items-center gap-1">
            {/* Header / Mode Indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mr-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Whiteboard Markup</span>
            </div>

            {/* Inspect / Passthrough Toggle */}
            <button
              type="button"
              onClick={() => setIsInspectMode(!isInspectMode)}
              className={`p-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 ${
                isInspectMode
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title={
                isInspectMode
                  ? "Interaction Passthrough Active (Click document underneath)"
                  : "Markup Mode Active (Drawing on canvas)"
              }
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isInspectMode ? "Passthrough" : "Draw Mode"}
              </span>
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Drawing Tools */}
            <button
              type="button"
              onClick={() => {
                setActiveTool("pen");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "pen" && !isInspectMode
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Freehand Pen"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("highlighter");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "highlighter" && !isInspectMode
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Text Highlighter"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("arrow");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "arrow" && !isInspectMode
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Architectural Arrow"
            >
              <MoveRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("rect");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "rect" && !isInspectMode
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Box Outline"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("circle");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "circle" && !isInspectMode
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Ellipse / Circle"
            >
              <Circle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool("eraser");
                setIsInspectMode(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "eraser" && !isInspectMode
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Stroke Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Undo / Redo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl hover:bg-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Insert Snapshot */}
            {onInsertSnapshot && (
              <button
                type="button"
                onClick={handleSnapshotToDoc}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1"
                title="Embed Sketch Snapshot into Active Document"
              >
                <Camera className="w-4 h-4" />
                <span className="text-[11px] font-medium hidden lg:inline">Embed</span>
              </button>
            )}

            {/* Export PNG */}
            <button
              type="button"
              onClick={handleExportPng}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Export Annotations as Transparent PNG"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Collapse / Close */}
            <button
              type="button"
              onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title={isToolbarCollapsed ? "Expand Options" : "Collapse Options"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 cursor-pointer ml-1"
              title="Close Whiteboard (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Expanded Palette & Stroke Width Row */}
          {!isToolbarCollapsed && (
            <div className="flex items-center gap-3 pt-1 border-t border-slate-800/80 w-full justify-between px-1">
              {/* Colors */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">
                  Color
                </span>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setActiveColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      activeColor === c.value
                        ? "scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">
                  Width
                </span>
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setActiveWidth(w.value)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                      activeWidth === w.value
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
