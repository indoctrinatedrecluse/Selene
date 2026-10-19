"use client";

import React, { useState, useId, useMemo } from "react";
import {
  BarChart2,
  Table,
  Code2,
  Download,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type ChartType = "bar" | "line" | "area" | "scatter" | "donut" | "pie" | "heatmap";

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSpecification {
  type?: ChartType;
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string | string[];
  yKeys?: string | string[];
  colors?: string[];
  data?: ChartDataPoint[];
  stacked?: boolean;
  options?: {
    stacked?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    showPoints?: boolean;
    curved?: boolean;
    innerRadius?: number; // for donut: 0.0 - 0.9
  };
}

interface DeclarativeChartRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

const DEFAULT_COLORS = [
  "#38bdf8", // Sky
  "#818cf8", // Indigo
  "#34d399", // Emerald
  "#f472b6", // Pink
  "#fbbf24", // Amber
  "#a78bfa", // Purple
  "#2dd4bf", // Teal
  "#fb923c", // Orange
];

export function DeclarativeChartRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: DeclarativeChartRendererProps) {
  const [rawSpec, setRawSpec] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<"chart" | "data" | "spec">("chart");
  const [overrideType, setOverrideType] = useState<ChartType | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    series: string;
    value: number | string;
    x: number;
    y: number;
  } | null>(null);

  const chartId = useId().replace(/:/g, "");

  // Derive parsed specification with pure useMemo to prevent cascading render effects
  const { spec, parseError } = useMemo(() => {
    try {
      const cleanJson = rawSpec
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "")
        .replace(/,\s*([\]}])/g, "$1");
      const parsed: ChartSpecification = JSON.parse(cleanJson);
      return { spec: parsed, parseError: null };
    } catch (err: unknown) {
      return {
        spec: null,
        parseError: err instanceof Error ? err.message : "Invalid Chart Specification JSON",
      };
    }
  }, [rawSpec]);

  const chartType: ChartType = overrideType || spec?.type || "bar";
  const title = spec?.title || "Data Visualization";
  const description = spec?.description;
  const data = spec?.data || [];
  const xKey = spec?.xKey || (data[0] ? Object.keys(data[0])[0] : "x");
  const colors = spec?.colors && spec.colors.length > 0 ? spec.colors : DEFAULT_COLORS;

  // Determine series / yKeys
  const rawYKey = spec?.yKey ?? spec?.yKeys;
  let yKeys: string[] = [];
  if (Array.isArray(rawYKey)) {
    yKeys = rawYKey;
  } else if (typeof rawYKey === "string") {
    yKeys = [rawYKey];
  } else if (data[0]) {
    yKeys = Object.keys(data[0]).filter((k) => k !== xKey && typeof data[0][k] === "number");
    if (yKeys.length === 0 && Object.keys(data[0]).length > 1) {
      yKeys = [Object.keys(data[0])[1]];
    }
  }

  // Calculate bounds
  const numericValues = data.flatMap((d) =>
    yKeys.map((k) => (typeof d[k] === "number" ? (d[k] as number) : 0))
  );
  const minY = Math.min(0, ...numericValues);
  const maxY = Math.max(10, ...numericValues) * 1.15; // 15% headroom

  const svgWidth = 800;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 60 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const getYPos = (val: number) => {
    if (maxY === minY) return padding.top + innerHeight / 2;
    const ratio = (val - minY) / (maxY - minY);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const getXPos = (index: number) => {
    if (data.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const handleExportSvg = () => {
    const svgElem = document.getElementById(`chart-svg-${chartId}`);
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCodeChangeInternal = (newText: string) => {
    setRawSpec(newText);
    onCodeChange?.(newText);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px] uppercase">
                {chartType}
              </span>
            </div>
            {description && <p className="text-[11px] text-slate-400">{description}</p>}
          </div>
        </div>

        {/* View / Export Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Chart Type Switcher */}
          <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            {(["bar", "line", "area", "scatter", "donut", "heatmap"] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setOverrideType(t)}
                className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                  chartType === t
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={`Switch to ${t} chart`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab("chart")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "chart"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "data"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setActiveTab("spec")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "spec"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Spec</span>
            </button>
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportSvg}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Download Chart as Scalable SVG Vector"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCsv}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Download Raw Data as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-Fix Diagnostic Lens on Parse Failure */}
      {parseError && (
        <div className="p-4 border-b border-rose-500/20 bg-rose-950/20">
          <SandboxAutoFixLens
            errorMessage={parseError}
            code={rawSpec}
            language="json"
            onApplyFix={handleCodeChangeInternal}
          />
        </div>
      )}

      {/* Chart Canvas Content */}
      {activeTab === "chart" && !parseError && (
        <div className="relative p-6 bg-slate-950/50 flex flex-col items-center justify-center overflow-x-auto min-h-[360px]">
          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-sky-500/40 shadow-xl text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-2"
              style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}
            >
              <div className="font-semibold text-white">{hoveredPoint.label}</div>
              <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px]">
                <span>{hoveredPoint.series}:</span>
                <span className="font-bold">{hoveredPoint.value}</span>
              </div>
            </div>
          )}

          {/* SVG Rendering Engine */}
          <svg
            id={`chart-svg-${chartId}`}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-4xl h-auto select-none overflow-visible"
          >
            <defs>
              {colors.map((color, i) => (
                <linearGradient
                  key={i}
                  id={`area-grad-${chartId}-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
              ))}
            </defs>

            {/* Background Grid Lines (except donut & heatmap) */}
            {chartType !== "donut" && chartType !== "pie" && chartType !== "heatmap" && (
              <g className="grid-lines opacity-25">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = minY + ratio * (maxY - minY);
                  const yPos = getYPos(yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={svgWidth - padding.right}
                        y2={yPos}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {Math.round(yVal)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* --- 1. BAR CHART --- */}
            {chartType === "bar" && (
              <g className="bars">
                {data.map((d, dIdx) => {
                  const groupWidth = innerWidth / data.length;
                  const barWidth = Math.max(8, (groupWidth * 0.7) / yKeys.length);
                  const groupX = padding.left + dIdx * groupWidth + groupWidth * 0.15;
                  const label = String(d[xKey]);

                  return (
                    <g key={dIdx}>
                      {yKeys.map((k, kIdx) => {
                        const val = typeof d[k] === "number" ? (d[k] as number) : 0;
                        const yPos = getYPos(val);
                        const zeroY = getYPos(0);
                        const barHeight = Math.max(2, Math.abs(zeroY - yPos));
                        const barX = groupX + kIdx * barWidth;
                        const color = colors[kIdx % colors.length];

                        return (
                          <rect
                            key={k}
                            x={barX}
                            y={Math.min(yPos, zeroY)}
                            width={barWidth - 2}
                            height={barHeight}
                            rx="4"
                            fill={color}
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPoint({
                                label,
                                series: k,
                                value: val,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        );
                      })}
                      {/* X Axis Label */}
                      <text
                        x={groupX + (yKeys.length * barWidth) / 2}
                        y={svgHeight - padding.bottom + 18}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* --- 2. LINE / AREA CHART --- */}
            {(chartType === "line" || chartType === "area") && (
              <g className="line-area">
                {yKeys.map((k, kIdx) => {
                  const color = colors[kIdx % colors.length];
                  const points = data.map((d, dIdx) => ({
                    x: getXPos(dIdx),
                    y: getYPos(typeof d[k] === "number" ? (d[k] as number) : 0),
                    val: d[k],
                    label: String(d[xKey]),
                  }));

                  const linePath = points.reduce((acc, p, idx) => {
                    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                  }, "");

                  const areaPath = `${linePath} L ${points[points.length - 1].x} ${getYPos(
                    0
                  )} L ${points[0].x} ${getYPos(0)} Z`;

                  return (
                    <g key={k}>
                      {chartType === "area" && (
                        <path d={areaPath} fill={`url(#area-grad-${chartId}-${kIdx})`} />
                      )}
                      <path
                        d={linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Data Dots */}
                      {points.map((p, pIdx) => (
                        <circle
                          key={pIdx}
                          cx={p.x}
                          cy={p.y}
                          r="4.5"
                          fill="#0f172a"
                          stroke={color}
                          strokeWidth="2.5"
                          className="hover:r-6 transition-all duration-150 cursor-pointer"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredPoint({
                              label: p.label,
                              series: k,
                              value: Number(p.val),
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </g>
                  );
                })}
                {/* X Axis Labels */}
                {data.map((d, dIdx) => (
                  <text
                    key={dIdx}
                    x={getXPos(dIdx)}
                    y={svgHeight - padding.bottom + 18}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {String(d[xKey])}
                  </text>
                ))}
              </g>
            )}

            {/* --- 3. SCATTER PLOT --- */}
            {chartType === "scatter" && (
              <g className="scatter">
                {data.map((d, dIdx) => {
                  const label = String(d[xKey]);
                  return yKeys.map((k, kIdx) => {
                    const val = typeof d[k] === "number" ? (d[k] as number) : 0;
                    const x = getXPos(dIdx);
                    const y = getYPos(val);
                    const color = colors[kIdx % colors.length];

                    return (
                      <circle
                        key={`${dIdx}-${k}`}
                        cx={x}
                        cy={y}
                        r="6"
                        fill={color}
                        fillOpacity="0.8"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="hover:r-8 transition-all cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPoint({
                            label,
                            series: k,
                            value: val,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  });
                })}
                {/* X Axis Labels */}
                {data.map((d, dIdx) => (
                  <text
                    key={dIdx}
                    x={getXPos(dIdx)}
                    y={svgHeight - padding.bottom + 18}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {String(d[xKey])}
                  </text>
                ))}
              </g>
            )}

            {/* --- 4. DONUT / PIE CHART --- */}
            {(chartType === "donut" || chartType === "pie") && (
              <g className="donut" transform={`translate(${svgWidth / 2}, ${svgHeight / 2})`}>
                {(() => {
                  const targetKey = yKeys[0] || Object.keys(data[0] || {})[1];
                  const total = data.reduce(
                    (sum, d) => sum + (typeof d[targetKey] === "number" ? Number(d[targetKey]) : 0),
                    0
                  );
                  const radius = Math.min(innerWidth, innerHeight) / 2.2;
                  const innerRadius = chartType === "donut" ? radius * 0.6 : 0;

                  let currentAngle = -Math.PI / 2;

                  return data.map((d, idx) => {
                    const val = typeof d[targetKey] === "number" ? Number(d[targetKey]) : 0;
                    const sliceAngle = total > 0 ? (val / total) * 2 * Math.PI : 0;
                    const endAngle = currentAngle + sliceAngle;
                    const label = String(d[xKey]);
                    const color = colors[idx % colors.length];

                    // Arc calculations
                    const x1 = Math.cos(currentAngle) * radius;
                    const y1 = Math.sin(currentAngle) * radius;
                    const x2 = Math.cos(endAngle) * radius;
                    const y2 = Math.sin(endAngle) * radius;

                    const ix1 = Math.cos(endAngle) * innerRadius;
                    const iy1 = Math.sin(endAngle) * innerRadius;
                    const ix2 = Math.cos(currentAngle) * innerRadius;
                    const iy2 = Math.sin(currentAngle) * innerRadius;

                    const largeArc = sliceAngle > Math.PI ? 1 : 0;

                    const path =
                      innerRadius > 0
                        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
                        : `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    currentAngle = endAngle;

                    return (
                      <path
                        key={idx}
                        d={path}
                        fill={color}
                        stroke="#090d16"
                        strokeWidth="2"
                        className="transition-transform duration-200 hover:scale-105 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
                          setHoveredPoint({
                            label,
                            series: `${targetKey} (${pct}%)`,
                            value: val,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  });
                })()}
                {chartType === "donut" && (
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {title}
                  </text>
                )}
              </g>
            )}

            {/* --- 5. HEATMAP MATRIX --- */}
            {chartType === "heatmap" && (
              <g className="heatmap">
                {(() => {
                  const rows = yKeys;
                  const cols = data;
                  const cellWidth = innerWidth / cols.length;
                  const cellHeight = innerHeight / Math.max(1, rows.length);

                  return rows.map((r, rIdx) => {
                    const y = padding.top + rIdx * cellHeight;

                    return (
                      <g key={r}>
                        <text
                          x={padding.left - 10}
                          y={y + cellHeight / 2 + 4}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {r}
                        </text>
                        {cols.map((c, cIdx) => {
                          const x = padding.left + cIdx * cellWidth;
                          const val = typeof c[r] === "number" ? Number(c[r]) : 0;
                          const intensity = maxY > minY ? Math.max(0.1, (val - minY) / (maxY - minY)) : 0.5;

                          return (
                            <rect
                              key={`${r}-${cIdx}`}
                              x={x + 2}
                              y={y + 2}
                              width={cellWidth - 4}
                              height={cellHeight - 4}
                              rx="4"
                              fill="#38bdf8"
                              fillOpacity={intensity}
                              stroke="#0f172a"
                              strokeWidth="1"
                              className="hover:stroke-sky-400 transition-colors cursor-pointer"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredPoint({
                                  label: `${String(c[xKey])} • ${r}`,
                                  series: "Density Value",
                                  value: val,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          );
                        })}
                      </g>
                    );
                  });
                })()}
                {/* Column Labels */}
                {data.map((d, dIdx) => {
                  const cellWidth = innerWidth / data.length;
                  return (
                    <text
                      key={dIdx}
                      x={padding.left + dIdx * cellWidth + cellWidth / 2}
                      y={svgHeight - padding.bottom + 18}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="sans-serif"
                    >
                      {String(d[xKey])}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Legend Banner */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-800/80 w-full text-xs">
            {chartType === "donut" || chartType === "pie"
              ? data.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span>{String(d[xKey])}</span>
                  </div>
                ))
              : yKeys.map((k, idx) => (
                  <div key={k} className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span>{k}</span>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Raw Data Table View */}
      {activeTab === "data" && !parseError && (
        <div className="p-4 overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                {data[0] &&
                  Object.keys(data[0]).map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40">
                  {Object.keys(row).map((k) => (
                    <td key={k} className="px-3 py-2">
                      {String(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Specification Code Editor */}
      {activeTab === "spec" && (
        <div className="p-4 bg-slate-950">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>Declarative JSON Specification</span>
            <span className="text-sky-400">Live Bidirectional Sync</span>
          </div>
          <textarea
            value={rawSpec}
            onChange={(e) => handleCodeChangeInternal(e.target.value)}
            rows={12}
            className="w-full rounded-xl bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800 focus:border-sky-500 focus:outline-none leading-relaxed resize-y"
          />
        </div>
      )}
    </div>
  );
}
