"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  RotateCcw,
  Terminal,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { executePythonCode, PythonExecutionResult } from "@/lib/pyodide-engine";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface PythonNotebookRendererProps {
  initialCode?: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
  autoRun?: boolean;
}

const PYTHON_PRESETS: Record<string, { label: string; code: string }> = {
  lunar_orbit: {
    label: "🌙 Lunar Orbit Trajectory (NumPy + Matplotlib)",
    code: `import numpy as np
import matplotlib.pyplot as plt

# Simulate Apollo / Artemis Lunar Transfer Trajectory
theta = np.linspace(0, 2 * np.pi, 500)
moon_orbit_r = 8.0

# Orbital trajectory
t = np.linspace(0, 10, 500)
x_orbit = 4 * np.cos(t) + 3.5 * np.cos(3 * t)
y_orbit = 2.5 * np.sin(t) - 2.0 * np.sin(2 * t)

fig, ax = plt.subplots(figsize=(7, 4.5))

# Plot Earth and Moon
ax.scatter([0], [0], color='#38bdf8', s=350, label='Earth (Gaia)', zorder=5)
ax.scatter([moon_orbit_r * np.cos(1.2)], [moon_orbit_r * np.sin(1.2)], color='#fbbf24', s=180, label='Moon (Selene)', zorder=5)

# Plot Trajectory
ax.plot(x_orbit, y_orbit, color='#a855f7', linewidth=2, label='Artemis Free-Return Trajectory')
ax.plot(moon_orbit_r * np.cos(theta), moon_orbit_r * np.sin(theta), '--', color='#475569', alpha=0.5, label='Lunar Orbital Path')

ax.set_title("Selene Mission: Trans-Lunar Injection & Orbital Insertion", fontsize=12, pad=12, fontweight='bold')
ax.set_xlabel("Equatorial Distance (x10^4 km)", fontsize=10)
ax.set_ylabel("Orbital Plane (x10^4 km)", fontsize=10)
ax.legend(loc='upper right', fontsize=8, facecolor='#0f172a', edgecolor='#1e293b')
ax.grid(True, linestyle=':', alpha=0.3)

plt.tight_layout()
plt.show()

print(f"✓ Orbital mechanics computation completed with 500 points.")
print(f"✓ Target insertion delta-V: 1,024 m/s (Nominal).")
`,
  },
  monte_carlo: {
    label: "🎲 Monte Carlo Pi & Impact Estimator (NumPy)",
    code: `import numpy as np

# Estimate Pi and Crater Impact Density using Monte Carlo simulation
n_samples = 150_000
x = np.random.uniform(-1, 1, n_samples)
y = np.random.uniform(-1, 1, n_samples)

inside_circle = (x**2 + y**2) <= 1.0
pi_estimate = 4.0 * np.sum(inside_circle) / n_samples
error_pct = abs(pi_estimate - np.pi) / np.pi * 100

print(f"==================================================")
print(f"  Selene Computational Mathematics Kernel        ")
print(f"==================================================")
print(f"Simulation Samples : {n_samples:,}")
print(f"Estimated Value of π: {pi_estimate:.6f}")
print(f"True Value of π     : {np.pi:.6f}")
print(f"Relative Error     : {error_pct:.4f}%")
print(f"Crater Density     : {np.sum(inside_circle):,} impacts within lunar disk")
`,
  },
  pandas_telemetry: {
    label: "📊 Lunar Rover Sensor Telemetry (Pandas)",
    code: `import pandas as pd
import numpy as np

# Generate time series telemetry for Lunar Rover
np.random.seed(42)
timestamps = pd.date_range("2026-10-18 00:00:00", periods=6, freq="10min")
telemetry = pd.DataFrame({
    "Regolith Temp (°C)": np.random.uniform(-130, -110, 6).round(1),
    "Solar Array (Watts)": np.random.uniform(420, 480, 6).round(0),
    "Radiation (mSv/h)": np.random.uniform(0.02, 0.05, 6).round(3),
    "Battery SoC (%)": [98, 95, 91, 88, 86, 82],
    "Rover Subsystem": ["Core", "Nav", "Drill", "Radio", "Camera", "Spectro"]
}, index=timestamps)

print("=== LUNAR ROVER ARTEMIS IV TELEMETRY LOG ===")
print(telemetry.to_string())
print("\\nDescriptive Statistics Summary:")
print(telemetry.describe().round(2).to_string())
`,
  },
};

export function PythonNotebookRenderer({
  initialCode,
  className = "",
  onCodeChange,
  autoRun = true,
}: PythonNotebookRendererProps) {
  const codeToUse = initialCode || PYTHON_PRESETS.lunar_orbit.code;
  const [code, setCode] = useState(codeToUse);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<PythonExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("lunar_orbit");

  const hasAutoRunRef = useRef(false);

  // Sync from parent if initialCode changes externally
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode && initialCode !== prevInitialCode && initialCode !== code) {
    setPrevInitialCode(initialCode);
    setCode(initialCode);
  }

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatusMessage("Initializing Pyodide...");

    try {
      const res = await executePythonCode(code, (msg) => {
        setStatusMessage(msg);
      });
      setOutput(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setOutput({
        stdout: "",
        stderr: errorMsg,
        execTimeMs: 0,
        isError: true,
        error: errorMsg,
      });
    } finally {
      setIsRunning(false);
      setStatusMessage(null);
    }
  }, [code, isRunning]);

  // Auto-run on mount once
  useEffect(() => {
    if (autoRun && !hasAutoRunRef.current) {
      hasAutoRunRef.current = true;
      handleRun();
    }
  }, [autoRun, handleRun]);

  const handleCodeChangeInternal = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = PYTHON_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      onCodeChange?.(preset.code);
      // Automatically re-run the preset
      setTimeout(() => {
        executePythonCode(preset.code, (msg) => setStatusMessage(msg))
          .then((res) => setOutput(res))
          .catch(() => {});
      }, 50);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearOutput = () => {
    setOutput(null);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* Cell Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Stack Icon & Label */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs shadow-inner">
              🐍
            </div>
            <div>
              <span className="font-semibold text-white text-xs tracking-tight">
                Python WASM Kernel
              </span>
              <span className="text-[10px] text-sky-400 font-mono ml-2">
                Pyodide 0.26
              </span>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="relative hidden sm:block">
            <select
              value={selectedPreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="text-[11px] font-mono bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
            >
              <option value="lunar_orbit">Orbit Trajectory (Matplotlib)</option>
              <option value="monte_carlo">Monte Carlo Pi (NumPy)</option>
              <option value="pandas_telemetry">Rover Telemetry (Pandas)</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {output && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{output.execTimeMs}ms</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Python Code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {output && (
            <button
              type="button"
              onClick={handleClearOutput}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear Output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Run Button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              isRunning
                ? "bg-amber-600/50 text-white cursor-wait"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20"
            }`}
            title="Execute Cell (Ctrl+Enter)"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : "fill-current"}`} />
            <span>{isRunning ? "Running..." : "Run Cell"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => handleCodeChangeInternal(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleRun();
            }
          }}
          className="w-full bg-[#070A14] text-slate-200 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed border-b border-slate-800 selection:bg-sky-500/30"
          rows={Math.max(6, Math.min(code.split("\n").length + 1, 18))}
          spellCheck={false}
          placeholder="# Write Python code here... (Ctrl+Enter to run)"
        />

        <div className="absolute top-2 right-3 pointer-events-none text-[10px] font-mono text-slate-600 select-none">
          Ctrl + Enter to run
        </div>
      </div>

      {/* Live Status Notification (while downloading WASM or executing) */}
      {statusMessage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sky-950/40 border-b border-sky-800/30 text-xs text-sky-300 font-mono animate-in fade-in">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Cell Output Display */}
      {output && (
        <div className="p-4 space-y-4 bg-slate-950/60 animate-in fade-in">
          {/* Matplotlib Figure (if generated) */}
          {output.plotImage && (
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#090d16] border border-slate-800 shadow-xl overflow-hidden">
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Matplotlib Render Output (DPI 140)</span>
                </span>
                <a
                  href={output.plotImage}
                  download="selene-matplotlib-plot.png"
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  title="Download Plot PNG"
                >
                  <Download className="w-3 h-3" />
                  <span>Save PNG</span>
                </a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output.plotImage}
                alt="Matplotlib Generated Plot"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Standard Output (stdout) */}
          {output.stdout && (
            <div className="rounded-xl bg-[#090d16] border border-slate-800/80 p-3 shadow-inner">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/60 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Terminal className="w-3 h-3" />
                  <span>STDOUT</span>
                </span>
                <span>Python Console</span>
              </div>
              <pre className="font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {output.stdout}
              </pre>
            </div>
          )}

          {/* Standard Error / Traceback (stderr) */}
          {output.stderr && (
            <div className="space-y-2">
              <div className="rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 shadow-inner">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-900/40 text-[10px] font-mono text-rose-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    <span>TRACEBACK / STDERR</span>
                  </span>
                </div>
                <pre className="font-mono text-xs text-rose-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {output.stderr}
                </pre>
              </div>

              <SandboxAutoFixLens
                code={code}
                language="python"
                errorMessage={output.stderr}
                onApplyFix={(fixedCode) => {
                  setCode(fixedCode);
                  if (onCodeChange) onCodeChange(fixedCode);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
