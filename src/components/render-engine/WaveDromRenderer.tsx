"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Activity,
  Code2,
  Download,
  Eye,
  Cpu,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface WaveDromRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

interface WaveSignalItem {
  name?: string;
  wave?: string;
  data?: string[] | string;
  phase?: number;
  period?: number;
}

interface WaveRegItem {
  name?: string;
  bits?: number;
  attr?: string | string[];
  type?: number;
}

interface WaveDromData {
  signal?: WaveSignalItem[];
  head?: { text?: string; tick?: number };
  foot?: { text?: string; tock?: number };
  reg?: WaveRegItem[];
  config?: { bits?: number; name?: string; hspace?: number };
}

const DEFAULT_SAMPLE_WAVE = `{
  "signal": [
    { "name": "CLK",   "wave": "p.......|..." },
    { "name": "CS#",   "wave": "10......|..1" },
    { "name": "MOSI",  "wave": "x3.4.5..|..x", "data": ["0x03", "ADDR_HI", "ADDR_LO"] },
    { "name": "MISO",  "wave": "z...6.7.|.z.", "data": ["BYTE_0", "BYTE_1"] },
    { "name": "READY", "wave": "0...1...|0.." }
  ],
  "head": { "text": "SPI Flash 4-Byte Burst Read Timing (Fast Read Mode)" },
  "foot": { "text": "T0       T1       T2       T3       T4       T5       T6       T7" }
}`;

export function WaveDromRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: WaveDromRendererProps) {
  const [code, setCode] = useState(initialCode.trim() || DEFAULT_SAMPLE_WAVE);
  const [activeTab, setActiveTab] = useState<"render" | "spec">("render");
  const [hoveredCycle, setHoveredCycle] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // Parse JSON/JS object specification safely
  const { parsedData, parseError } = useMemo(() => {
    try {
      // Allow lenient JSON (unquoted keys or single quotes)
      const sanitized = code.replace(/,\s*([}\]])/g, "$1");
      let data: WaveDromData;
      try {
        data = JSON.parse(sanitized);
      } catch {
        // Fallback for JS object syntax
        const fn = new Function(`"use strict"; return (${code});`);
        data = fn();
      }
      return { parsedData: data, parseError: null };
    } catch (err: unknown) {
      return {
        parsedData: null,
        parseError: err instanceof Error ? err.message : "Malformed WaveDrom specification",
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
    a.download = "wavedrom-timing-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine mode: Signal Waveform or Register Bitfield
  const isRegisterMode = Boolean(parsedData?.reg && parsedData.reg.length > 0);

  // Layout calculations for Signals
  const { signals, maxCycles, stepWidth, rowHeight, labelWidth, svgWidth, svgHeight } =
    useMemo(() => {
      const sigs = parsedData?.signal || [];
      let maxLen = 0;
      sigs.forEach((s) => {
        if (s.wave) {
          maxLen = Math.max(maxLen, s.wave.length);
        }
      });
      maxLen = Math.max(maxLen, 8);

      const stepW = 42;
      const rowH = 36;
      const labelW = 100;
      const headerH = parsedData?.head?.text ? 40 : 20;
      const footerH = parsedData?.foot?.text ? 35 : 25;
      const w = labelW + maxLen * stepW + 40;
      const h = headerH + sigs.length * rowH + footerH;

      return {
        signals: sigs,
        maxCycles: maxLen,
        stepWidth: stepW,
        rowHeight: rowH,
        labelWidth: labelW,
        svgWidth: Math.max(w, 560),
        svgHeight: Math.max(h, 180),
      };
    }, [parsedData]);

  // Layout calculations for Register Bitfields
  const registerLayout = useMemo(() => {
    if (!isRegisterMode || !parsedData?.reg) return null;
    const regList = parsedData.reg;
    const totalBits = parsedData.config?.bits || 32;
    const regName = parsedData.config?.name || "REGISTER";

    let bitCursor = totalBits;
    const fields = regList.map((item, idx) => {
      const bits = item.bits || 1;
      const msb = bitCursor - 1;
      const lsb = bitCursor - bits;
      bitCursor -= bits;

      // Color mapping for register field types
      const typeColors = [
        { bg: "rgba(56, 189, 248, 0.15)", border: "#38bdf8", text: "#38bdf8" }, // 0: Sky
        { bg: "rgba(129, 140, 248, 0.15)", border: "#818cf8", text: "#818cf8" }, // 1: Indigo
        { bg: "rgba(52, 211, 153, 0.15)", border: "#34d399", text: "#34d399" }, // 2: Emerald
        { bg: "rgba(244, 114, 182, 0.15)", border: "#f472b6", text: "#f472b6" }, // 3: Pink
        { bg: "rgba(251, 191, 36, 0.15)", border: "#fbbf24", text: "#fbbf24" }, // 4: Amber
        { bg: "rgba(167, 139, 250, 0.15)", border: "#a78bfa", text: "#a78bfa" }, // 5: Purple
        { bg: "rgba(45, 212, 191, 0.15)", border: "#2dd4bf", text: "#2dd4bf" }, // 6: Teal
        { bg: "rgba(148, 163, 184, 0.15)", border: "#94a3b8", text: "#cbd5e1" }, // reserved/blank
      ];
      const isBlank = !item.name;
      const col = isBlank ? typeColors[7] : typeColors[(item.type ?? idx) % 7];

      return {
        name: item.name || "RESERVED",
        bits,
        msb,
        lsb,
        attr: Array.isArray(item.attr) ? item.attr.join("/") : item.attr || (isBlank ? "—" : "RW"),
        color: col,
        isBlank,
      };
    });

    return { totalBits, regName, fields };
  }, [isRegisterMode, parsedData]);

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden font-sans my-4 ${className}`}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            {isRegisterMode ? <Cpu className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-slate-100 font-mono">
                {isRegisterMode ? "WaveDrom Register View (regview)" : "WaveDrom Digital Timing Engine"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                WASM/SVG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isRegisterMode
                ? `${registerLayout?.totalBits}-bit register bitfield allocation map`
                : `${signals.length} hardware signals • ${maxCycles} timing cycles`}
            </p>
          </div>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab("render")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "render"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Waveform</span>
          </button>
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "spec"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Spec</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={handleCopySvg}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Copy SVG XML to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadSvg}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Download Standalone SVG Diagram"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTextChange(DEFAULT_SAMPLE_WAVE)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Reset to Default SPI Timing Sample"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parse Error Alert */}
      {parseError && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs font-mono">
          <span className="font-bold">WaveDrom Parse Error: </span>
          {parseError}
        </div>
      )}

      {/* Main Body */}
      {activeTab === "render" ? (
        <div
          ref={svgContainerRef}
          className="p-4 overflow-x-auto bg-[#070b14] flex justify-center items-center select-none"
        >
          {isRegisterMode && registerLayout ? (
            /* ================= REGISTER BITFIELD MODE ================= */
            <div className="w-full max-w-4xl py-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {registerLayout.regName} ({registerLayout.totalBits}-BIT HARDWARE REGISTER)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  MSB: {registerLayout.totalBits - 1} ... LSB: 0
                </span>
              </div>

              {/* Bit index indicator header */}
              <div className="flex w-full text-[10px] font-mono text-slate-400 px-0.5">
                {registerLayout.fields.map((f, i) => (
                  <div
                    key={i}
                    style={{ flex: f.bits }}
                    className="flex justify-between px-1 overflow-hidden"
                  >
                    <span>{f.msb}</span>
                    {f.bits > 1 && <span>{f.lsb}</span>}
                  </div>
                ))}
              </div>

              {/* Register Bit Box Blocks */}
              <div className="flex w-full h-16 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg">
                {registerLayout.fields.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      flex: f.bits,
                      backgroundColor: f.color.bg,
                      borderRight:
                        i < registerLayout.fields.length - 1 ? `1px solid ${f.color.border}` : "none",
                    }}
                    className="h-full p-1.5 flex flex-col justify-between items-center text-center transition-all hover:brightness-125"
                  >
                    <span
                      style={{ color: f.color.text }}
                      className="text-xs font-bold font-mono truncate w-full tracking-wider"
                    >
                      {f.name}
                    </span>
                    <div className="flex items-center justify-between w-full text-[10px] font-mono px-1">
                      <span className="text-slate-400">{f.bits}b</span>
                      <span
                        style={{ color: f.color.border }}
                        className="px-1 py-0.2 rounded bg-slate-900/60 font-semibold text-[9px]"
                      >
                        {f.attr}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Register Legend / Field Inspector Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Bits</th>
                      <th className="py-2 px-3">Field</th>
                      <th className="py-2 px-3">Access</th>
                      <th className="py-2 px-3">Width</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {registerLayout.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-cyan-400">
                          [{f.msb}:{f.lsb}]
                        </td>
                        <td className="py-2 px-3 font-bold" style={{ color: f.color.text }}>
                          {f.name}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{f.attr}</td>
                        <td className="py-2 px-3 text-slate-400">{f.bits} bit{f.bits > 1 ? "s" : ""}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {f.isBlank ? "Reserved / Do not write" : `Controls ${f.name.toLowerCase()} operation`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ================= DIGITAL TIMING DIAGRAM MODE ================= */
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-full"
            >
              <defs>
                {/* Diagonal hatch pattern for unknown/glitch states 'x' */}
                <pattern
                  id="wave-hatch"
                  width="6"
                  height="6"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="1.5" />
                </pattern>

                {/* Subtle vertical cycle grid pattern */}
                <pattern id="cycle-grid" width={stepWidth} height={svgHeight} patternUnits="userSpaceOnUse">
                  <line
                    x1={stepWidth}
                    y1="0"
                    x2={stepWidth}
                    y2={svgHeight}
                    stroke="rgba(30, 41, 59, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                </pattern>
              </defs>

              {/* Grid background */}
              <rect
                x={labelWidth}
                y="20"
                width={maxCycles * stepWidth}
                height={svgHeight - 40}
                fill="url(#cycle-grid)"
              />

              {/* Header Title */}
              {parsedData?.head?.text && (
                <text
                  x={labelWidth + (maxCycles * stepWidth) / 2}
                  y="22"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {parsedData.head.text}
                </text>
              )}

              {/* Cycle markers at top */}
              {Array.from({ length: maxCycles }).map((_, cIdx) => (
                <g
                  key={cIdx}
                  onMouseEnter={() => setHoveredCycle(cIdx)}
                  onMouseLeave={() => setHoveredCycle(null)}
                >
                  <text
                    x={labelWidth + cIdx * stepWidth + stepWidth / 2}
                    y={parsedData?.head?.text ? 38 : 16}
                    textAnchor="middle"
                    fill={hoveredCycle === cIdx ? "#38bdf8" : "#64748b"}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={hoveredCycle === cIdx ? "bold" : "normal"}
                  >
                    T{cIdx}
                  </text>
                </g>
              ))}

              {/* Signals */}
              {signals.map((sig, sIdx) => {
                const startY = (parsedData?.head?.text ? 48 : 28) + sIdx * rowHeight;
                const highY = startY + 4;
                const midY = startY + rowHeight / 2;
                const lowY = startY + rowHeight - 6;

                const waveChars = (sig.wave || "").split("");
                const dataTokens = Array.isArray(sig.data)
                  ? [...sig.data]
                  : typeof sig.data === "string"
                  ? sig.data.split(/\s+/)
                  : [];
                let dataIdx = 0;

                return (
                  <g key={sIdx} className="signal-row">
                    {/* Signal Name Label */}
                    <text
                      x={labelWidth - 12}
                      y={midY + 4}
                      textAnchor="end"
                      fill="#e2e8f0"
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {sig.name || `SIG_${sIdx}`}
                    </text>

                    {/* Cycle waves rendering */}
                    {waveChars.map((char, cIdx) => {
                      const curX = labelWidth + cIdx * stepWidth;
                      const nextX = curX + stepWidth;
                      const isHovered = hoveredCycle === cIdx;

                      // Clock signal: 'p', 'P', 'n', 'N'
                      if (char === "p" || char === "P") {
                        const halfX = curX + stepWidth / 2;
                        return (
                          <g key={cIdx}>
                            <path
                              d={`M ${curX} ${lowY} L ${curX} ${highY} L ${halfX} ${highY} L ${halfX} ${lowY} L ${nextX} ${lowY}`}
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth={isHovered ? "2.5" : "1.8"}
                            />
                            {/* Positive edge arrow */}
                            <path
                              d={`M ${curX - 2.5} ${midY + 2} L ${curX} ${midY - 4} L ${curX + 2.5} ${midY + 2}`}
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth="1.2"
                            />
                          </g>
                        );
                      }
                      if (char === "n" || char === "N") {
                        const halfX = curX + stepWidth / 2;
                        return (
                          <g key={cIdx}>
                            <path
                              d={`M ${curX} ${highY} L ${curX} ${lowY} L ${halfX} ${lowY} L ${halfX} ${highY} L ${nextX} ${highY}`}
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth={isHovered ? "2.5" : "1.8"}
                            />
                          </g>
                        );
                      }

                      // High level '1', 'h', 'H'
                      if (char === "1" || char === "h" || char === "H") {
                        return (
                          <path
                            key={cIdx}
                            d={`M ${curX} ${highY} L ${nextX} ${highY}`}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth={isHovered ? "2.5" : "1.8"}
                          />
                        );
                      }

                      // Low level '0', 'l', 'L'
                      if (char === "0" || char === "l" || char === "L") {
                        return (
                          <path
                            key={cIdx}
                            d={`M ${curX} ${lowY} L ${nextX} ${lowY}`}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth={isHovered ? "2.5" : "1.8"}
                          />
                        );
                      }

                      // High-impedance tri-state 'z', 'Z'
                      if (char === "z" || char === "Z") {
                        return (
                          <line
                            key={cIdx}
                            x1={curX}
                            y1={midY}
                            x2={nextX}
                            y2={midY}
                            stroke="#94a3b8"
                            strokeWidth="1.2"
                            strokeDasharray="3,3"
                          />
                        );
                      }

                      // Unknown / glitch state 'x', 'X'
                      if (char === "x" || char === "X") {
                        return (
                          <g key={cIdx}>
                            <polygon
                              points={`${curX},${midY} ${curX + 4},${highY} ${nextX - 4},${highY} ${nextX},${midY} ${nextX - 4},${lowY} ${curX + 4},${lowY}`}
                              fill="url(#wave-hatch)"
                              stroke="#f59e0b"
                              strokeWidth="1.2"
                            />
                          </g>
                        );
                      }

                      // Multi-bit Bus State '2', '3', '4', '5', '6', '7', '8', '9'
                      if (/[2-9=]/.test(char)) {
                        const token = dataTokens[dataIdx++] || "";
                        const busColors = [
                          { fill: "rgba(56, 189, 248, 0.15)", stroke: "#38bdf8" },
                          { fill: "rgba(129, 140, 248, 0.15)", stroke: "#818cf8" },
                          { fill: "rgba(52, 211, 153, 0.15)", stroke: "#34d399" },
                          { fill: "rgba(244, 114, 182, 0.15)", stroke: "#f472b6" },
                          { fill: "rgba(251, 191, 36, 0.15)", stroke: "#fbbf24" },
                        ];
                        const col = busColors[(parseInt(char, 10) || 2) % busColors.length];

                        return (
                          <g key={cIdx}>
                            <polygon
                              points={`${curX},${midY} ${curX + 4},${highY} ${nextX - 4},${highY} ${nextX},${midY} ${nextX - 4},${lowY} ${curX + 4},${lowY}`}
                              fill={col.fill}
                              stroke={col.stroke}
                              strokeWidth={isHovered ? "2" : "1.4"}
                            />
                            {token && (
                              <text
                                x={curX + stepWidth / 2}
                                y={midY + 3.5}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {token}
                              </text>
                            )}
                          </g>
                        );
                      }

                      // Gap / omitted cycles '|'
                      if (char === "|") {
                        return (
                          <g key={cIdx}>
                            <line
                              x1={curX + stepWidth / 2 - 3}
                              y1={highY - 4}
                              x2={curX + stepWidth / 2 - 3}
                              y2={lowY + 4}
                              stroke="#475569"
                              strokeWidth="1.5"
                              strokeDasharray="2,2"
                            />
                            <line
                              x1={curX + stepWidth / 2 + 3}
                              y1={highY - 4}
                              x2={curX + stepWidth / 2 + 3}
                              y2={lowY + 4}
                              stroke="#475569"
                              strokeWidth="1.5"
                              strokeDasharray="2,2"
                            />
                          </g>
                        );
                      }

                      // Continuation '.'
                      return (
                        <line
                          key={cIdx}
                          x1={curX}
                          y1={midY}
                          x2={nextX}
                          y2={midY}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Footer text */}
              {parsedData?.foot?.text && (
                <text
                  x={labelWidth}
                  y={svgHeight - 10}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {parsedData.foot.text}
                </text>
              )}
            </svg>
          )}
        </div>
      ) : (
        /* Spec JSON Editor Tab */
        <div className="p-4 bg-slate-950 font-mono text-xs">
          <textarea
            value={code}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={14}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50 leading-relaxed"
            placeholder="Enter WaveDrom JSON or JS timing specification..."
          />
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>Edit WaveDrom JSON spec above to dynamically re-evaluate timing pulses</span>
            {parseError && (
              <SandboxAutoFixLens
                code={code}
                language="json"
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
