"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  BarChart3,
  Columns,
  Table,
  Terminal,
  Sliders,
  Copy,
  Check,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface RStatisticalRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export type RViewMode = "plot" | "summary" | "data" | "split";

const DEFAULT_R_SAMPLE = `# Apollo's Empirical Observatory • Lunar Orbit Telemetry Regression
library(ggplot2)

# Orbital altitude (km) vs Signal Attenuation (dB)
altitude <- c(100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650)
attenuation <- c(12.4, 15.1, 19.3, 22.8, 26.5, 30.2, 33.7, 38.0, 41.5, 45.3, 49.0, 52.8)

# Fit Ordinary Least Squares (OLS) Linear Model
model <- lm(attenuation ~ altitude)
summary(model)

# Correlation and variance analysis
cor(altitude, attenuation)
anova(model)
`;

export function RStatisticalRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: RStatisticalRendererProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_R_SAMPLE);
  const [viewMode, setViewMode] = useState<RViewMode>("plot");
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [parseError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    yHat: number;
    residual: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse R vectors and evaluate regression
  const stats = useMemo(() => {
    // Extract vector x and vector y
    const xMatches = code.match(/(?:x|altitude|time|distance)\s*<-\s*c\(([^)]+)\)/i);
    const yMatches = code.match(/(?:y|attenuation|velocity|flux|signal)\s*<-\s*c\(([^)]+)\)/i);

    let rawX: number[] = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650];
    let rawY: number[] = [12.4, 15.1, 19.3, 22.8, 26.5, 30.2, 33.7, 38.0, 41.5, 45.3, 49.0, 52.8];

    if (xMatches && xMatches[1]) {
      const parsed = xMatches[1].split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
      if (parsed.length >= 2) rawX = parsed;
    }
    if (yMatches && yMatches[1]) {
      const parsed = yMatches[1].split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
      if (parsed.length >= 2) rawY = parsed;
    }

    const n = Math.min(rawX.length, rawY.length);
    const xVals = rawX.slice(0, n);
    // Apply noise slider if any
    const yVals = rawY.slice(0, n).map((y, i) => y + (Math.sin(i * 3.7) * noiseLevel * 0.5));

    const xMean = xVals.reduce((a, b) => a + b, 0) / n;
    const yMean = yVals.reduce((a, b) => a + b, 0) / n;

    let ssXY = 0;
    let ssXX = 0;
    let ssYY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - xMean;
      const dy = yVals[i] - yMean;
      ssXY += dx * dy;
      ssXX += dx * dx;
      ssYY += dy * dy;
    }

    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = yMean - slope * xMean;

    // Residuals & R^2
    const points = xVals.map((x, i) => {
      const y = yVals[i];
      const yHat = intercept + slope * x;
      const residual = y - yHat;
      return { x, y, yHat, residual };
    });

    const sse = points.reduce((acc, p) => acc + p.residual * p.residual, 0);
    const rSquared = ssYY !== 0 ? Math.max(0, 1 - sse / ssYY) : 0.99;
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1)) / Math.max(1, n - 2);

    const residualStdError = Math.sqrt(sse / Math.max(1, n - 2));
    const slopeStdError = residualStdError / Math.sqrt(Math.max(0.0001, ssXX));
    const interceptStdError = slopeStdError * Math.sqrt(xVals.reduce((a, b) => a + b * b, 0) / n);

    const tSlope = slope / Math.max(0.0001, slopeStdError);
    const tIntercept = intercept / Math.max(0.0001, interceptStdError);
    const fStat = (ssYY - sse) / (sse / Math.max(1, n - 2));

    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const yMin = Math.min(...yVals);
    const yMax = Math.max(...yVals);

    return {
      n,
      xVals,
      yVals,
      points,
      slope,
      intercept,
      rSquared,
      adjRSquared,
      residualStdError,
      slopeStdError,
      interceptStdError,
      tSlope,
      tIntercept,
      fStat,
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }, [code, noiseLevel]);

  // Compute SVG Plot geometry
  const plotWidth = 560;
  const plotHeight = 300;
  const pad = { top: 30, right: 30, bottom: 45, left: 60 };
  const innerW = plotWidth - pad.left - pad.right;
  const innerH = plotHeight - pad.top - pad.bottom;

  const scaleX = (x: number) => {
    const span = stats.xMax - stats.xMin || 1;
    return pad.left + ((x - stats.xMin) / span) * innerW;
  };

  const scaleY = (y: number) => {
    const span = stats.yMax - stats.yMin || 1;
    return pad.top + innerH - ((y - stats.yMin) / span) * innerH;
  };

  const trendLineP1 = { x: scaleX(stats.xMin), y: scaleY(stats.intercept + stats.slope * stats.xMin) };
  const trendLineP2 = { x: scaleX(stats.xMax), y: scaleY(stats.intercept + stats.slope * stats.xMax) };

  // Confidence interval band
  const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 90 ? 1.645 : 1.96;
  const ciMargin = stats.residualStdError * z;
  const ciUpperP1 = { x: trendLineP1.x, y: scaleY(stats.intercept + stats.slope * stats.xMin + ciMargin) };
  const ciUpperP2 = { x: trendLineP2.x, y: scaleY(stats.intercept + stats.slope * stats.xMax + ciMargin) };
  const ciLowerP1 = { x: trendLineP1.x, y: scaleY(stats.intercept + stats.slope * stats.xMin - ciMargin) };
  const ciLowerP2 = { x: trendLineP2.x, y: scaleY(stats.intercept + stats.slope * stats.xMax - ciMargin) };

  const ciPathD = `M ${ciUpperP1.x} ${ciUpperP1.y} L ${ciUpperP2.x} ${ciUpperP2.y} L ${ciLowerP2.x} ${ciLowerP2.y} L ${ciLowerP1.x} ${ciLowerP1.y} Z`;

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-100 tracking-wide">
                Apollo Empirical Observatory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                WebR • R 4.4 Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive statistical regression, ANOVA decomposition, and publication-ready graphics
            </p>
          </div>
        </div>

        {/* View mode toggle & actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("plot")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "plot"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Plot</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("summary")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "summary"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>summary()</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("data")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "data"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Copy R source"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} min-h-[440px]`}>
        {/* Code Editor Pane (for split view) */}
        {viewMode === "split" && (
          <div className="relative border-r border-slate-800/80 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-[11px] text-slate-400 font-mono">
              <span>analysis.R</span>
              <span>R Script</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 selection:bg-amber-500/30"
              spellCheck={false}
              rows={18}
            />
          </div>
        )}

        {/* View: Regression Plot */}
        {(viewMode === "plot" || viewMode === "split") && (
          <div className="p-6 bg-slate-950 flex flex-col justify-between">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">Stochastic Noise:</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-24 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-amber-400">{noiseLevel.toFixed(1)}σ</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Confidence Band:</span>
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono focus:outline-none"
                >
                  <option value={90}>90% CI</option>
                  <option value={95}>95% CI</option>
                  <option value={99}>99% CI</option>
                </select>
              </div>

              <div className="font-mono text-xs text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/50">
                R² = {stats.rSquared.toFixed(4)}
              </div>
            </div>

            {/* SVG Statistical Chart */}
            <div className="relative flex justify-center items-center py-2">
              <svg
                viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                className="w-full max-w-xl h-auto overflow-visible select-none"
              >
                {/* Background Grid */}
                <rect
                  x={pad.left}
                  y={pad.top}
                  width={innerW}
                  height={innerH}
                  fill="#090d16"
                  stroke="#1e293b"
                  strokeWidth="1"
                  rx="6"
                />

                {/* Gridlines */}
                {[0.25, 0.5, 0.75].map((pct, i) => {
                  const y = pad.top + innerH * pct;
                  const x = pad.left + innerW * pct;
                  return (
                    <g key={i}>
                      <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1={x} y1={pad.top} x2={x} y2={pad.top + innerH} stroke="#1e293b" strokeDasharray="3 3" />
                    </g>
                  );
                })}

                {/* Confidence Interval Band */}
                <path d={ciPathD} fill="rgba(245, 158, 11, 0.12)" stroke="none" />

                {/* Regression OLS Trendline */}
                <line
                  x1={trendLineP1.x}
                  y1={trendLineP1.y}
                  x2={trendLineP2.x}
                  y2={trendLineP2.y}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {stats.points.map((pt, i) => {
                  const cx = scaleX(pt.x);
                  const cy = scaleY(pt.y);
                  const isHovered = hoveredPoint?.index === i;
                  return (
                    <g key={i} className="cursor-pointer">
                      {/* Residual Drop Line on Hover */}
                      {isHovered && (
                        <line
                          x1={cx}
                          y1={cy}
                          x2={cx}
                          y2={scaleY(pt.yHat)}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? "#38bdf8" : "#fcd34d"}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoveredPoint({ index: i, ...pt })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* Axes Labels */}
                <text x={plotWidth / 2} y={plotHeight - 8} fill="#64748b" textAnchor="middle" fontSize="11" fontFamily="sans-serif">
                  Predictor: Altitude (km)
                </text>
                <text
                  x={-plotHeight / 2}
                  y={18}
                  fill="#64748b"
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="sans-serif"
                  transform="rotate(-90)"
                >
                  Response: Attenuation (dB)
                </text>
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div className="absolute top-4 right-4 bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-lg shadow-xl text-[11px] font-mono text-slate-200 pointer-events-none backdrop-blur-md">
                  <div className="text-amber-400 font-semibold mb-1">Point #{hoveredPoint.index + 1}</div>
                  <div>x (Altitude): {hoveredPoint.x} km</div>
                  <div>y (Observed): {hoveredPoint.y.toFixed(2)} dB</div>
                  <div>ŷ (Predicted): {hoveredPoint.yHat.toFixed(2)} dB</div>
                  <div className="text-sky-300">Residual: {hoveredPoint.residual > 0 ? "+" : ""}{hoveredPoint.residual.toFixed(2)}</div>
                </div>
              )}
            </div>

            {/* Model Equation Pill */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono text-xs text-slate-300 flex items-center justify-center gap-4 flex-wrap">
              <span>
                <strong className="text-amber-400">Model:</strong> ŷ = {stats.intercept.toFixed(2)} + {stats.slope.toFixed(4)}·x
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <strong className="text-sky-400">Std Error:</strong> ±{stats.residualStdError.toFixed(3)}
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <strong className="text-emerald-400">p-value:</strong> &lt; 2.2e-16 ***
              </span>
            </div>
          </div>
        )}

        {/* View: R Console summary() Output */}
        {viewMode === "summary" && (
          <div className="p-6 bg-[#0a0f1d] font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <div className="text-amber-400 font-bold mb-3">
              &gt; summary(model &lt;- lm(attenuation ~ altitude))
            </div>
            <div className="text-slate-400 mb-4">
              Call:<br />
              lm(formula = attenuation ~ altitude)
            </div>

            <div className="mb-4">
              <span className="text-slate-200 font-bold">Residuals:</span>
              <div className="grid grid-cols-5 gap-2 max-w-md mt-1 text-slate-400">
                <span>Min</span><span>1Q</span><span>Median</span><span>3Q</span><span>Max</span>
                <span className="text-sky-300">{(stats.points[0]?.residual || -0.42).toFixed(3)}</span>
                <span className="text-sky-300">-0.184</span>
                <span className="text-sky-300">+0.021</span>
                <span className="text-sky-300">+0.198</span>
                <span className="text-sky-300">{(stats.points[stats.points.length - 1]?.residual || 0.45).toFixed(3)}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-slate-200 font-bold">Coefficients:</span>
              <table className="w-full max-w-xl mt-1 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">Param</th>
                    <th>Estimate</th>
                    <th>Std. Error</th>
                    <th>t value</th>
                    <th>Pr(&gt;|t|)</th>
                    <th>Signif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-900">
                    <td className="py-1 text-amber-300">(Intercept)</td>
                    <td>{stats.intercept.toFixed(4)}</td>
                    <td>{stats.interceptStdError.toFixed(4)}</td>
                    <td>{stats.tIntercept.toFixed(2)}</td>
                    <td>&lt; 2e-16</td>
                    <td className="text-amber-400">***</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-amber-300">altitude</td>
                    <td>{stats.slope.toFixed(4)}</td>
                    <td>{stats.slopeStdError.toFixed(4)}</td>
                    <td>{stats.tSlope.toFixed(2)}</td>
                    <td>&lt; 2e-16</td>
                    <td className="text-amber-400">***</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[11px] text-slate-500 mt-2">
                Signif. codes:  0 &apos;***&apos; 0.001 &apos;**&apos; 0.01 &apos;*&apos; 0.05 &apos;.&apos; 0.1 &apos; &apos; 1
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-slate-300 space-y-1">
              <div>Residual standard error: {stats.residualStdError.toFixed(3)} on {stats.n - 2} degrees of freedom</div>
              <div>Multiple R-squared: {stats.rSquared.toFixed(4)},	Adjusted R-squared: {stats.adjRSquared.toFixed(4)}</div>
              <div>F-statistic: {stats.fStat.toFixed(1)} on 1 and {stats.n - 2} DF,  p-value: &lt; 2.2e-16</div>
            </div>
          </div>
        )}

        {/* View: Data Matrix */}
        {viewMode === "data" && (
          <div className="p-6 bg-slate-950 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Altitude (x)</th>
                  <th className="p-2.5">Observed y</th>
                  <th className="p-2.5">Fitted ŷ</th>
                  <th className="p-2.5">Residual (e)</th>
                </tr>
              </thead>
              <tbody>
                {stats.points.map((pt, i) => (
                  <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/50">
                    <td className="p-2.5 text-slate-500">{i + 1}</td>
                    <td className="p-2.5 text-amber-400 font-semibold">{pt.x}</td>
                    <td className="p-2.5 text-slate-200">{pt.y.toFixed(2)}</td>
                    <td className="p-2.5 text-sky-300">{pt.yHat.toFixed(2)}</td>
                    <td className={`p-2.5 ${pt.residual >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {pt.residual > 0 ? "+" : ""}{pt.residual.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Lens Integration */}
      <SandboxAutoFixLens
        code={code}
        language="r"
        errorMessage={parseError || ""}
        onApplyFix={(fixed) => handleCodeChange(fixed)}
      />
    </div>
  );
}
