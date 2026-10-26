"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  GitCommit,
  Code2,
  Download,
  Eye,
  Copy,
  Check,
  RotateCcw,
  Palette,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface D2DiagramRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

interface D2Node {
  id: string;
  label: string;
  shape: string;
  container?: string;
  fill?: string;
  stroke?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface D2Connection {
  from: string;
  to: string;
  label?: string;
  directed: boolean;
  bidirectional: boolean;
}

interface D2Container {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_SAMPLE_D2 = `# Modern Cloud Native Architecture
direction: right

client: Client Tier {
  web: Next.js Web App {
    shape: circle
  }
  mobile: Flutter Mobile {
    shape: circle
  }
}

gateway: Selene API Gateway {
  shape: hexagon
  style.stroke: "#38bdf8"
}

services: Microservices Core {
  style.fill: "#091224"
  
  auth: Guardian Auth {
    shape: package
  }
  engine: Computation Engine {
    shape: cylinder
  }
  relay: Hermes Relay Hub {
    shape: queue
  }
}

storage: Data Layer {
  db: Primary PostgreSQL {
    shape: cylinder
  }
  cache: Redis Cluster {
    shape: cylinder
  }
}

client.web -> gateway: HTTPS GraphQL
client.mobile -> gateway: WebRTC CRDT
gateway -> services.auth: Validate JWT
gateway -> services.engine: Query Document
services.engine -> storage.cache: Cache Read (0.4ms)
services.engine -> storage.db: ACID Commit
services.engine -> services.relay: Broadcast Update
`;

export function D2DiagramRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: D2DiagramRendererProps) {
  const [code, setCode] = useState(initialCode.trim() || DEFAULT_SAMPLE_D2);
  const [activeTab, setActiveTab] = useState<"render" | "spec">("render");
  const [themeMode, setThemeMode] = useState<"celestial" | "blueprint" | "emerald">("celestial");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // Parse D2 specification into nodes, containers, and connections
  const { nodes, containers, connections, direction, parseError } = useMemo(() => {
    try {
      const lines = code.split("\n");
      let dir = "right";
      const rawNodes: Record<string, Partial<D2Node>> = {};
      const rawContainers: Record<string, { id: string; label: string; children: string[] }> = {};
      const rawConns: D2Connection[] = [];

      let currentContainer: string | null = null;
      let containerBraceDepth = 0;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith("#")) continue;

        // Strip inline comments
        if (line.includes("#")) {
          line = line.split("#")[0].trim();
        }

        // Direction directive
        if (/^direction\s*:\s*(right|down|left|up)/i.test(line)) {
          const match = line.match(/^direction\s*:\s*(\w+)/i);
          if (match) dir = match[1].toLowerCase();
          continue;
        }

        // Container closing
        if (line === "}" || line.startsWith("}")) {
          containerBraceDepth = Math.max(0, containerBraceDepth - 1);
          if (containerBraceDepth === 0) {
            currentContainer = null;
          }
          continue;
        }

        // Connections: a -> b, a <-> b, a -- b
        if (line.includes("->") || line.includes("<->") || line.includes("--")) {
          const connMatch = line.match(/^([\w.-]+)\s*(->|<->|--)\s*([\w.-]+)(?:\s*:\s*(.*))?$/);
          if (connMatch) {
            const [, from, arrow, to, label] = connMatch;
            rawConns.push({
              from: from.trim(),
              to: to.trim(),
              label: label ? label.trim() : undefined,
              directed: arrow === "->" || arrow === "<->",
              bidirectional: arrow === "<->",
            });
            continue;
          }
        }

        // Node / Container definitions: id: Label { ... } or id: Label
        const blockMatch = line.match(/^([\w.-]+)\s*:\s*([^{]+)?(?:\s*\{)?$/);
        if (blockMatch) {
          const rawId = blockMatch[1].trim();
          const label = (blockMatch[2] || rawId).trim();
          const hasOpenBrace = line.includes("{");

          const fullId: string = currentContainer ? `${currentContainer}.${rawId}` : rawId;

          if (hasOpenBrace) {
            currentContainer = fullId;
            containerBraceDepth++;
            rawContainers[fullId] = {
              id: fullId,
              label,
              children: [],
            };
          } else {
            rawNodes[fullId] = {
              id: fullId,
              label,
              shape: "rectangle",
              container: currentContainer || undefined,
            };
            if (currentContainer && rawContainers[currentContainer]) {
              rawContainers[currentContainer].children.push(fullId);
            }
          }
          continue;
        }

        // Shape attributes inside a block: shape: cylinder
        if (/^shape\s*:\s*(\w+)/i.test(line)) {
          const shapeMatch = line.match(/^shape\s*:\s*(\w+)/i);
          if (shapeMatch && currentContainer) {
            // Apply to container or last node
            if (rawNodes[currentContainer]) {
              rawNodes[currentContainer].shape = shapeMatch[1].toLowerCase();
            }
          }
          continue;
        }
      }

      // Convert to ranked grid layout
      const nodeList: D2Node[] = [];
      const nodeKeys = Object.keys(rawNodes);

      // Distribute nodes along columns and rows
      const cols = dir === "down" ? 3 : Math.min(5, Math.max(3, Math.ceil(Math.sqrt(nodeKeys.length))));
      const colWidth = 190;
      const rowHeight = 110;
      const offsetX = 50;
      const offsetY = 50;

      nodeKeys.forEach((key, index) => {
        const item = rawNodes[key];
        const col = index % cols;
        const row = Math.floor(index / cols);

        nodeList.push({
          id: key,
          label: item.label || key,
          shape: item.shape || "rectangle",
          container: item.container,
          x: offsetX + col * colWidth,
          y: offsetY + row * rowHeight,
          width: 140,
          height: 56,
        });
      });

      // Compute bounding boxes for containers
      const containerList: D2Container[] = [];
      Object.values(rawContainers).forEach((c) => {
        const children = nodeList.filter((n) => n.container === c.id || n.id.startsWith(c.id + "."));
        if (children.length > 0) {
          const minX = Math.min(...children.map((n) => n.x)) - 18;
          const minY = Math.min(...children.map((n) => n.y)) - 28;
          const maxX = Math.max(...children.map((n) => n.x + n.width)) + 18;
          const maxY = Math.max(...children.map((n) => n.y + n.height)) + 18;
          containerList.push({
            id: c.id,
            label: c.label,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          });
        }
      });

      return {
        nodes: nodeList,
        containers: containerList,
        connections: rawConns,
        direction: dir,
        parseError: null,
      };
    } catch (err: unknown) {
      return {
        nodes: [],
        containers: [],
        connections: [],
        direction: "right",
        parseError: err instanceof Error ? err.message : "Malformed D2 diagram syntax",
      };
    }
  }, [code]);

  const handleTextChange = (val: string) => {
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  const handleCopySvg = () => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svgEl);
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svgEl);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "d2-architecture-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Color schemes based on selected theme
  const themeColors = useMemo(() => {
    if (themeMode === "blueprint") {
      return {
        bg: "#061325",
        containerBg: "rgba(10, 37, 64, 0.5)",
        containerBorder: "#1d4ed8",
        nodeBg: "#0f2b48",
        nodeBorder: "#38bdf8",
        nodeText: "#f0f9ff",
        edge: "#60a5fa",
        edgeHighlight: "#93c5fd",
        pulse: "#38bdf8",
      };
    }
    if (themeMode === "emerald") {
      return {
        bg: "#031713",
        containerBg: "rgba(6, 44, 34, 0.45)",
        containerBorder: "#047857",
        nodeBg: "#063024",
        nodeBorder: "#10b981",
        nodeText: "#ecfdf5",
        edge: "#34d399",
        edgeHighlight: "#6ee7b7",
        pulse: "#10b981",
      };
    }
    // Celestial Dark (Default)
    return {
      bg: "#060913",
      containerBg: "rgba(15, 23, 42, 0.55)",
      containerBorder: "#334155",
      nodeBg: "#0f172a",
      nodeBorder: "#38bdf8",
      nodeText: "#f8fafc",
      edge: "#818cf8",
      edgeHighlight: "#38bdf8",
      pulse: "#fbbf24",
    };
  }, [themeMode]);

  // Overall SVG Dimensions
  const canvasBounds = useMemo(() => {
    let maxX = 720;
    let maxY = 420;
    nodes.forEach((n) => {
      maxX = Math.max(maxX, n.x + n.width + 60);
      maxY = Math.max(maxY, n.y + n.height + 60);
    });
    containers.forEach((c) => {
      maxX = Math.max(maxX, c.x + c.width + 40);
      maxY = Math.max(maxY, c.y + c.height + 40);
    });
    return { width: maxX, height: maxY };
  }, [nodes, containers]);

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden font-sans my-4 ${className}`}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-slate-100 font-mono">
                D2 Modern Architecture Engine
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                WASM/DAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {nodes.length} nodes • {containers.length} containers • {connections.length} connections ({direction})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Theme Palette Switcher */}
          <button
            onClick={() =>
              setThemeMode((m) => (m === "celestial" ? "blueprint" : m === "blueprint" ? "emerald" : "celestial"))
            }
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-slate-300 bg-slate-800 hover:text-white border border-slate-700/60"
            title="Toggle D2 Color Theme"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="capitalize">{themeMode}</span>
          </button>

          <button
            onClick={() => setActiveTab("render")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "render"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Diagram</span>
          </button>
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "spec"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>D2 Spec</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={handleCopySvg}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Copy SVG XML to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          <button
            onClick={handleDownloadSvg}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Download Standalone SVG Vector Diagram"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTextChange(DEFAULT_SAMPLE_D2)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Reset to Default D2 Architecture Spec"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parse Error Alert */}
      {parseError && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs font-mono">
          <span className="font-bold">D2 Parse Error: </span>
          {parseError}
        </div>
      )}

      {/* Diagram Canvas Body */}
      {activeTab === "render" ? (
        <div
          ref={svgContainerRef}
          style={{ backgroundColor: themeColors.bg }}
          className="p-6 overflow-x-auto flex justify-center items-center select-none min-h-[380px]"
        >
          <svg
            width={canvasBounds.width}
            height={canvasBounds.height}
            viewBox={`0 0 ${canvasBounds.width} ${canvasBounds.height}`}
            className="w-full max-w-full"
          >
            <defs>
              {/* Arrowhead marker */}
              <marker
                id="d2-arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={themeColors.edge} />
              </marker>

              {/* Highlighted Arrowhead marker */}
              <marker
                id="d2-arrowhead-hi"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={themeColors.edgeHighlight} />
              </marker>

              {/* Deep dot-grid background */}
              <pattern id="d2-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.9" fill="rgba(255, 255, 255, 0.07)" />
              </pattern>
            </defs>

            {/* Grid background */}
            <rect width={canvasBounds.width} height={canvasBounds.height} fill="url(#d2-grid)" />

            {/* 1. Group Containers (VPCs, clusters, tiers) */}
            {containers.map((c) => (
              <g key={c.id} className="d2-container">
                <rect
                  x={c.x}
                  y={c.y}
                  width={c.width}
                  height={c.height}
                  rx="16"
                  fill={themeColors.containerBg}
                  stroke={themeColors.containerBorder}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <text
                  x={c.x + 16}
                  y={c.y + 18}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.6"
                >
                  {c.label.toUpperCase()}
                </text>
              </g>
            ))}

            {/* 2. Connection Edges */}
            {connections.map((conn, idx) => {
              const src = nodes.find((n) => n.id === conn.from || n.id.endsWith(`.${conn.from}`));
              const dst = nodes.find((n) => n.id === conn.to || n.id.endsWith(`.${conn.to}`));
              if (!src || !dst) return null;

              const isHighlighted =
                hoveredNodeId === src.id ||
                hoveredNodeId === dst.id ||
                hoveredNodeId === conn.from ||
                hoveredNodeId === conn.to;

              // Compute orthogonal/curved path from src to dst
              const startX = src.x + src.width;
              const startY = src.y + src.height / 2;
              const endX = dst.x;
              const endY = dst.y + dst.height / 2;

              // Cubic bezier control points
              const dx = (endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g key={idx} className="d2-edge transition-all">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? themeColors.edgeHighlight : themeColors.edge}
                    strokeWidth={isHighlighted ? "2.5" : "1.6"}
                    markerEnd={conn.directed ? (isHighlighted ? "url(#d2-arrowhead-hi)" : "url(#d2-arrowhead)") : undefined}
                  />

                  {/* Edge Label Badge */}
                  {conn.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
                        height="20"
                        rx="5"
                        fill="#0b0f19"
                        stroke={isHighlighted ? themeColors.edgeHighlight : "rgba(51, 65, 85, 0.8)"}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill={isHighlighted ? "#ffffff" : "#cbd5e1"}
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {conn.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 3. Architecture Nodes */}
            {nodes.map((node) => {
              const isHovered = hoveredNodeId === node.id;
              const rx = node.shape === "circle" ? node.width / 2 : node.shape === "cylinder" ? 8 : 12;

              return (
                <g
                  key={node.id}
                  className="d2-node cursor-pointer transition-transform duration-150"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Glow Shadow when Hovered */}
                  {isHovered && (
                    <rect
                      x={node.x - 4}
                      y={node.y - 4}
                      width={node.width + 8}
                      height={node.height + 8}
                      rx={rx + 2}
                      fill="none"
                      stroke={themeColors.pulse}
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Node Card */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={rx}
                    fill={themeColors.nodeBg}
                    stroke={isHovered ? themeColors.edgeHighlight : themeColors.nodeBorder}
                    strokeWidth={isHovered ? "2" : "1.4"}
                    filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
                  />

                  {/* Cylinder Top Cap if shape is cylinder */}
                  {node.shape === "cylinder" && (
                    <ellipse
                      cx={node.x + node.width / 2}
                      cy={node.y + 7}
                      rx={node.width / 2 - 4}
                      ry="4"
                      fill="none"
                      stroke={themeColors.nodeBorder}
                      strokeWidth="1"
                    />
                  )}

                  {/* Node Label */}
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 3}
                    textAnchor="middle"
                    fill={themeColors.nodeText}
                    fontSize="11.5"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.label}
                  </text>

                  {/* Shape Badge at Bottom Right */}
                  <text
                    x={node.x + node.width - 8}
                    y={node.y + node.height - 6}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {node.shape}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* D2 Spec Code Editor Tab */
        <div className="p-4 bg-slate-950 font-mono text-xs">
          <textarea
            value={code}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={14}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500/50 leading-relaxed"
            placeholder="Enter D2 architecture specification..."
          />
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>Edit D2 declarative syntax above to update system topology and routing</span>
            {parseError && (
              <SandboxAutoFixLens
                code={code}
                language="d2"
                errorMessage={parseError}
                onApplyFix={(fixed) => handleTextChange(fixed)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
