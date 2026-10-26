"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Columns,
  Eye,
  RotateCcw,
  Layers,
  Copy,
  Check,
  Compass,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface OpenScadRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export type OpenScadViewMode = "viewport" | "csg_tree" | "split";

const DEFAULT_SCAD_SAMPLE = `// Daedalus's 3D Parametric Forge • Celestial Cube with Cylindrical Bore
$fn = 32;

// Outer dimensions
cube_size = 40;
bore_radius = 12;
bore_height = 50;

difference() {
    // Primary cubic body
    cube([cube_size, cube_size, cube_size], center = true);

    // Three orthogonal cylindrical bores
    cylinder(h = bore_height, r = bore_radius, center = true);
    
    rotate([90, 0, 0])
        cylinder(h = bore_height, r = bore_radius, center = true);
        
    rotate([0, 90, 0])
        cylinder(h = bore_height, r = bore_radius, center = true);
}
`;

export function OpenScadRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: OpenScadRendererProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_SCAD_SAMPLE);
  const [viewMode, setViewMode] = useState<OpenScadViewMode>("viewport");
  const [isWireframe, setIsWireframe] = useState(false);
  const [rotX, setRotX] = useState(-25);
  const [rotY, setRotY] = useState(35);
  const [zoom, setZoom] = useState(1.0);
  const [parseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse OpenSCAD code for CSG primitives
  const csgStructure = useMemo(() => {
    const lines = code.split("\n");
    const elements: Array<{
      type: string;
      args: string;
      isCut?: boolean;
    }> = [];

    const isDifference = code.includes("difference()");

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("cube(")) {
        elements.push({ type: "Cube Primitive", args: trimmed });
      } else if (trimmed.startsWith("cylinder(")) {
        elements.push({
          type: "Cylinder Solid",
          args: trimmed,
          isCut: isDifference && elements.length > 0,
        });
      } else if (trimmed.startsWith("sphere(")) {
        elements.push({
          type: "Sphere Primitive",
          args: trimmed,
          isCut: isDifference && elements.length > 0,
        });
      }
    });

    if (elements.length === 0) {
      elements.push({ type: "Cube Primitive", args: "cube([40, 40, 40], center=true)" });
    }

    return { isDifference, elements };
  }, [code]);

  // 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Deep space dark gradient background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.5);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate grid floor
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    const gridPoints: Array<[number, number, number]> = [];
    const gridSize = 80;
    const step = 20;

    for (let x = -gridSize; x <= gridSize; x += step) {
      gridPoints.push([x, 40, -gridSize], [x, 40, gridSize]);
    }
    for (let z = -gridSize; z <= gridSize; z += step) {
      gridPoints.push([-gridSize, 40, z], [gridSize, 40, z]);
    }

    // 3D rotation projection helper
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Rotate Y (yaw)
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
      // Rotate X (pitch)
      const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

      // Perspective projection
      const distance = 350;
      const fov = distance / (distance + z2);
      const px = width / 2 + x1 * fov * zoom * 1.8;
      const py = height / 2 + y2 * fov * zoom * 1.8;
      return [px, py, z2];
    };

    // Draw Grid
    for (let i = 0; i < gridPoints.length; i += 2) {
      const p1 = project(gridPoints[i][0], gridPoints[i][1], gridPoints[i][2]);
      const p2 = project(gridPoints[i + 1][0], gridPoints[i + 1][1], gridPoints[i + 1][2]);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }

    // Construct 3D Cube with Central Bore Geometry
    const s = 35; // cube half-size
    const vertices: Array<[number, number, number]> = [
      [-s, -s, -s],
      [s, -s, -s],
      [s, s, -s],
      [-s, s, -s],
      [-s, -s, s],
      [s, -s, s],
      [s, s, s],
      [-s, s, s],
    ];

    const faces = [
      { indices: [0, 1, 2, 3], normal: [0, 0, -1], color: "#0284c7" }, // Front
      { indices: [5, 4, 7, 6], normal: [0, 0, 1], color: "#0369a1" },  // Back
      { indices: [4, 0, 3, 7], normal: [-1, 0, 0], color: "#0ea5e9" }, // Left
      { indices: [1, 5, 6, 2], normal: [1, 0, 0], color: "#38bdf8" },  // Right
      { indices: [4, 5, 1, 0], normal: [0, -1, 0], color: "#7dd3fc" }, // Top
      { indices: [3, 2, 6, 7], normal: [0, 1, 0], color: "#075985" },  // Bottom
    ];

    // Directional light vector
    const light = [0.5, -0.8, -0.6];
    const lightLen = Math.sqrt(light[0] ** 2 + light[1] ** 2 + light[2] ** 2);
    const lNorm = [light[0] / lightLen, light[1] / lightLen, light[2] / lightLen];

    // Project and sort faces by depth (Painter's algorithm)
    const projectedFaces = faces.map((face) => {
      const pts = face.indices.map((idx) => project(...vertices[idx]));
      const avgZ = pts.reduce((sum, p) => sum + p[2], 0) / pts.length;

      // Rotate face normal
      const nx = face.normal[0] * Math.cos(radY) + face.normal[2] * Math.sin(radY);
      const nz1 = -face.normal[0] * Math.sin(radY) + face.normal[2] * Math.cos(radY);
      const ny = face.normal[1] * Math.cos(radX) - nz1 * Math.sin(radX);
      const nz = face.normal[1] * Math.sin(radX) + nz1 * Math.cos(radX);

      // Diffuse illumination
      const dot = Math.max(0.15, -(nx * lNorm[0] + ny * lNorm[1] + nz * lNorm[2]));
      return { pts, avgZ, dot, normalZ: nz, baseColor: face.color };
    });

    // Sort far to near
    projectedFaces.sort((a, b) => b.avgZ - a.avgZ);

    projectedFaces.forEach((face) => {
      if (face.normalZ <= 0.05 && !isWireframe) return; // Backface culling

      ctx.beginPath();
      ctx.moveTo(face.pts[0][0], face.pts[0][1]);
      for (let i = 1; i < face.pts.length; i++) {
        ctx.lineTo(face.pts[i][0], face.pts[i][1]);
      }
      ctx.closePath();

      if (!isWireframe) {
        // Shaded face
        const intensity = Math.floor(face.dot * 255);
        ctx.fillStyle = `rgb(${Math.floor(intensity * 0.2)}, ${Math.floor(intensity * 0.7)}, ${intensity})`;
        ctx.fill();
        ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw cylindrical bore ring cutout representation
        const center = [
          (face.pts[0][0] + face.pts[2][0]) / 2,
          (face.pts[0][1] + face.pts[2][1]) / 2,
        ];
        ctx.beginPath();
        ctx.arc(center[0], center[1], 16 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = "#030712";
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.stroke();
      } else {
        // Wireframe mode
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Render coordinate axis triad indicator at bottom-left
    const axisLen = 25;
    const origin: [number, number, number] = [-width / 2 + 50, height / 2 - 50, 0];
    const xAxis = project(origin[0] + axisLen, origin[1], origin[2]);
    const yAxis = project(origin[0], origin[1] - axisLen, origin[2]);
    const zAxis = project(origin[0], origin[1], origin[2] + axisLen);
    const oProj = project(...origin);

    ctx.lineWidth = 2;
    // X - Red
    ctx.strokeStyle = "#f87171";
    ctx.beginPath();
    ctx.moveTo(oProj[0], oProj[1]);
    ctx.lineTo(xAxis[0], xAxis[1]);
    ctx.stroke();
    // Y - Green
    ctx.strokeStyle = "#4ade80";
    ctx.beginPath();
    ctx.moveTo(oProj[0], oProj[1]);
    ctx.lineTo(yAxis[0], yAxis[1]);
    ctx.stroke();
    // Z - Blue
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(oProj[0], oProj[1]);
    ctx.lineTo(zAxis[0], zAxis[1]);
    ctx.stroke();
  }, [rotX, rotY, zoom, isWireframe, code]);

  // Mouse drag rotation listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => (prev + dx * 0.8) % 360);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.8)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    setRotX(-25);
    setRotY(35);
    setZoom(1.0);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-100 tracking-wide">
                Daedalus 3D Parametric Forge
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OpenSCAD • CSG Solid
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3D Constructive Solid Geometry (CSG) parametric CAD modeling
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("viewport")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "viewport"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("csg_tree")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "csg_tree"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CSG Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Wireframe toggle */}
          <button
            type="button"
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-2 py-1 rounded-lg border text-xs font-mono transition-all ${
              isWireframe
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {isWireframe ? "Wireframe ON" : "Solid"}
          </button>

          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            title="Reset 3D camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            title="Copy OpenSCAD script"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} min-h-[460px]`}>
        {/* Code Editor Pane (for split view) */}
        {viewMode === "split" && (
          <div className="relative border-r border-slate-800/80 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-[11px] text-slate-400 font-mono">
              <span>model.scad</span>
              <span>OpenSCAD CSG</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 selection:bg-cyan-500/30"
              spellCheck={false}
              rows={18}
            />
          </div>
        )}

        {/* 3D Viewport */}
        {(viewMode === "viewport" || viewMode === "split") && (
          <div className="relative flex flex-col items-center justify-center p-4 bg-slate-950 select-none overflow-hidden">
            <canvas
              ref={canvasRef}
              width={540}
              height={360}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full max-w-xl h-auto rounded-xl border border-slate-800/80 shadow-2xl cursor-grab active:cursor-grabbing"
            />

            {/* Viewport Overlay Controls */}
            <div className="absolute top-7 left-7 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pitch: {rotX.toFixed(0)}°</span>
              <span>Yaw: {rotY.toFixed(0)}°</span>
              <span className="text-slate-600">|</span>
              <span>Zoom: {zoom.toFixed(1)}x</span>
            </div>

            {/* Zoom Slider */}
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Zoom</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-32 accent-cyan-500 cursor-pointer"
              />
              <span className="text-cyan-400">{zoom.toFixed(1)}x</span>
            </div>
          </div>
        )}

        {/* CSG Tree Inspector */}
        {viewMode === "csg_tree" && (
          <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300">
            <div className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Constructive Solid Geometry (CSG) AST Decomposition</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-amber-400 font-bold mb-1">
                  Root Operation: {csgStructure.isDifference ? "difference() [Boolean Cut]" : "union() [Boolean Fusion]"}
                </div>
                <p className="text-slate-400 text-[11px]">
                  {csgStructure.isDifference
                    ? "First child acts as the primary solid base; all subsequent children subtract material."
                    : "All child primitives are unified into a single closed manifold mesh."}
                </p>
              </div>

              <div className="space-y-2 pl-4 border-l-2 border-cyan-500/40">
                {csgStructure.elements.map((el, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-md border text-[11px] flex items-center justify-between ${
                      el.isCut
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                        : "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200">
                        #{i + 1}
                      </span>
                      <span className="font-semibold">{el.type}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{el.args}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold">
                      {el.isCut ? "Subtractive Cut" : "Additive Solid"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Lens Integration */}
      <SandboxAutoFixLens
        code={code}
        language="openscad"
        errorMessage={parseError || ""}
        onApplyFix={(fixed) => handleCodeChange(fixed)}
      />
    </div>
  );
}
