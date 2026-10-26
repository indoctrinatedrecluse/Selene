"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Share2,
  Search,
  RefreshCw,
  Link2,
} from "lucide-react";

export interface MeshNode {
  id: string;
  title: string;
  category: string;
  color: string;
  links: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface MnemosyneKnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDocument?: (docId: string) => void;
  currentDocId?: string;
}

export function MnemosyneKnowledgeGraphModal({
  isOpen,
  onClose,
  onOpenDocument,
  currentDocId = "sample-01",
}: MnemosyneKnowledgeGraphModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);

  // Initial celestial constellation nodes
  const initialNodes: MeshNode[] = useMemo(
    () => [
      {
        id: "sample-01",
        title: "Selene Architecture & Live Canvas",
        category: "Core",
        color: "#38bdf8",
        links: ["sample-02", "sample-05", "sample-15", "sample-19"],
        x: 300,
        y: 240,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-02",
        title: "Interactive Web UI Components",
        category: "Frontend",
        color: "#818cf8",
        links: ["sample-01", "sample-03"],
        x: 180,
        y: 160,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-03",
        title: "Angular & Flutter Showcase",
        category: "Frontend",
        color: "#60a5fa",
        links: ["sample-02", "sample-17"],
        x: 150,
        y: 320,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-04",
        title: "Python WASM Data Science",
        category: "Data",
        color: "#f59e0b",
        links: ["sample-13", "sample-14"],
        x: 440,
        y: 150,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-05",
        title: "Presentation Slide Deck Demo",
        category: "Core",
        color: "#38bdf8",
        links: ["sample-01", "sample-15"],
        x: 460,
        y: 310,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-11",
        title: "SQL, SQLite & LibSQL",
        category: "Database",
        color: "#10b981",
        links: ["sample-14", "sample-18"],
        x: 250,
        y: 420,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-12",
        title: "GLSL & WebGL Shaders",
        category: "Graphics",
        color: "#a855f7",
        links: ["sample-01", "sample-13"],
        x: 520,
        y: 220,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-13",
        title: "Declarative Vector Charts",
        category: "Data",
        color: "#f59e0b",
        links: ["sample-04", "sample-12"],
        x: 390,
        y: 420,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-14",
        title: "DuckDB Analytical OLAP",
        category: "Database",
        color: "#10b981",
        links: ["sample-11", "sample-04"],
        x: 320,
        y: 480,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-15",
        title: "Dual Document & Whiteboard",
        category: "Canvas",
        color: "#f472b6",
        links: ["sample-01", "sample-05"],
        x: 500,
        y: 380,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-18",
        title: "Hermes Relay API & GraphQL",
        category: "Network",
        color: "#fb923c",
        links: ["sample-11", "sample-20"],
        x: 180,
        y: 450,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-19",
        title: "Chronos Timeline Revisions",
        category: "Core",
        color: "#38bdf8",
        links: ["sample-01", "sample-20"],
        x: 320,
        y: 110,
        vx: 0,
        vy: 0,
      },
      {
        id: "sample-20",
        title: "Orbit Link P2P Collaboration",
        category: "Collab",
        color: "#38bdf8",
        links: ["sample-19", "sample-18", "sample-01"],
        x: 180,
        y: 80,
        vx: 0,
        vy: 0,
      },
    ],
    []
  );

  const [nodes, setNodes] = useState<MeshNode[]>(initialNodes);

  // Force-directed celestial physics simulation
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry galaxy backdrop
      ctx.fillStyle = "rgba(11, 15, 25, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw constellation links
      nodes.forEach((node) => {
        node.links.forEach((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (target) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Particle pulse
            const midX = (node.x + target.x) / 2;
            const midY = (node.y + target.y) / 2;
            ctx.beginPath();
            ctx.arc(midX, midY, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(251, 191, 36, 0.6)";
            ctx.fill();
          }
        });
      });

      // Draw celestial nodes
      nodes.forEach((node) => {
        const isCurrent = node.id === currentDocId;
        const isSelected = selectedNode?.id === node.id;

        // Outer starlight aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 18 : isCurrent ? 14 : 10, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? "rgba(56, 189, 248, 0.35)" : "rgba(255, 255, 255, 0.1)";
        ctx.fill();

        // Core star
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 8 : isCurrent ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = isSelected ? "bold 12px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : isCurrent ? "#38bdf8" : "#94a3b8";
        ctx.textAlign = "center";
        ctx.fillText(node.title, node.x, node.y + (isSelected ? 24 : 18));
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, nodes, selectedNode, currentDocId]);

  if (!isOpen) return null;

  const filteredNodes = nodes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl border border-sky-500/30 bg-[#090d18] shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b1122]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Mnemosyne Knowledge Mesh</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Bi-Directional Wikilinks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Constellation graph view of interlinked documents, code blocks & block transclusions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#070a14] border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search celestial notes & AST nodes..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {nodes.length} Star Nodes • {nodes.reduce((a, b) => a + b.links.length, 0)} Constellation Links
            </span>
            <button
              onClick={() => setNodes([...initialNodes])}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
              title="Re-balance Galaxy"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Balance</span>
            </button>
          </div>
        </div>

        {/* Canvas & Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const hit = nodes.find(
                (n) => Math.hypot(n.x - clickX, n.y - clickY) < 18
              );
              setSelectedNode(hit || null);
            }}
            className="w-full h-full bg-[#050811] cursor-crosshair"
          />

          {/* Quick-Select Filter Pills */}
          <div className="absolute left-4 right-80 bottom-3 flex items-center gap-1.5 overflow-x-auto py-1 z-10 pointer-events-auto">
            {filteredNodes.slice(0, 8).map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNode(n)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border ${
                  selectedNode?.id === n.id
                    ? "bg-sky-500/30 text-sky-200 border-sky-400"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>

          {/* Selected Node Details Drawer */}
          {selectedNode && (
            <div className="w-72 bg-slate-950/95 border-l border-slate-800 p-4 flex flex-col justify-between backdrop-blur-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                    {selectedNode.category} Node
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    Close
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedNode.title}</h4>
                <p className="text-xs text-slate-400">
                  Node ID: <code className="text-slate-300 font-mono">{selectedNode.id}</code>
                </p>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Outbound Wikilinks ({selectedNode.links.length})</span>
                  </span>
                  <div className="space-y-1">
                    {selectedNode.links.map((lid) => {
                      const target = nodes.find((n) => n.id === lid);
                      return (
                        <div
                          key={lid}
                          onClick={() => {
                            if (target) setSelectedNode(target);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-sky-300 hover:bg-slate-850 cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate">{target?.title || lid}</span>
                          <span className="text-[10px] text-slate-500 font-mono">→</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onOpenDocument) onOpenDocument(selectedNode.id);
                  onClose();
                }}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20"
              >
                Open Illuminated Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
