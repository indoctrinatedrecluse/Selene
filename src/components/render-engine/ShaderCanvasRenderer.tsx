"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
  Columns,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface ShaderCanvasRendererProps {
  initialCode?: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export type ShaderViewMode = "split" | "canvas" | "code";

export const SHADER_PRESETS: Record<string, { label: string; code: string }> = {
  cosmic_nebula: {
    label: "🌌 Cosmic Lunar Nebula (FBM Plasma)",
    code: `// Selene WebGL Fragment Shader • Cosmic Nebula
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float t = u_time * 0.4;

    // Fractional Brownian Motion (FBM) & Plasma rings
    float d = length(uv);
    for (float i = 1.0; i < 4.0; i++) {
        uv.x += 0.3 / i * sin(i * 3.0 * uv.y + t) + 0.1;
        uv.y += 0.3 / i * cos(i * 3.0 * uv.x + t) + 0.1;
    }

    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(uv.x + t * 0.8 + 0.0);
    col.g = 0.5 + 0.5 * sin(uv.y + t * 0.6 + 2.0);
    col.b = 0.5 + 0.5 * sin(uv.x + uv.y + t * 1.0 + 4.0);

    // Deep moonlit vignette & glow
    col *= 1.2 - d * 0.6;
    col += vec3(0.05, 0.15, 0.25) / (d + 0.2);

    gl_FragColor = vec4(col, 1.0);
}`,
  },
  raymarched_orb: {
    label: "🪐 Raymarched Titan Orb (3D Sphere)",
    code: `// Selene WebGL Fragment Shader • Raymarched Sphere
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -3.0); // Camera Ray origin
    vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

    // Raymarching loop
    float t = 0.0;
    vec3 spherePos = vec3(sin(u_time * 0.8) * 0.3, cos(u_time * 0.6) * 0.2, 0.0);
    for (int i = 0; i < 40; i++) {
        vec3 p = ro + rd * t;
        float d = sphereSDF(p - spherePos, 1.0);
        if (d < 0.001 || t > 10.0) break;
        t += d;
    }

    vec3 col = vec3(0.03, 0.05, 0.1); // Background void
    if (t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = normalize(p - spherePos);
        vec3 lightDir = normalize(vec3(1.0, 1.5, -1.0));
        float diff = max(dot(n, lightDir), 0.0);
        float rim = 1.0 - max(dot(n, -rd), 0.0);

        vec3 surfaceColor = vec3(0.08, 0.45, 0.85); // Lunar Azure
        col = surfaceColor * diff + vec3(0.2, 0.8, 1.0) * pow(rim, 3.0);
    }

    gl_FragColor = vec4(col, 1.0);
}`,
  },
  cyber_grid: {
    label: "⚡ Cyber Grid Waves (Audio-reactive Waveform)",
    code: `// Selene WebGL Fragment Shader • Neon Wave Grid
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    float t = u_time * 1.5;

    // Perspective floor transform
    uv.y += 0.5;
    if (uv.y <= 0.0) {
        gl_FragColor = vec4(0.02, 0.03, 0.06, 1.0);
        return;
    }

    float z = 1.0 / uv.y;
    vec2 p = vec2(uv.x * z, z + t);

    // Grid lines
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = min(grid.x, grid.y);
    float c = 1.0 - min(line, 1.0);

    // Neon purple/cyan horizon glow
    vec3 col = vec3(c * 0.2, c * 0.6, c * 1.0);
    col *= exp(-0.3 * z);
    col += vec3(0.25, 0.05, 0.35) * (1.0 - uv.y);

    gl_FragColor = vec4(col, 1.0);
}`,
  },
};

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export function ShaderCanvasRenderer({
  initialCode = SHADER_PRESETS.cosmic_nebula.code,
  className = "",
  onCodeChange,
}: ShaderCanvasRendererProps) {
  const [code, setCode] = useState(initialCode);
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    if (initialCode) setCode(initialCode);
  }

  const [viewMode, setViewMode] = useState<ShaderViewMode>("split");
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const compileAndRunShader = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (startTimeRef.current === 0) startTimeRef.current = performance.now();
    if (lastTimeRef.current === 0) lastTimeRef.current = performance.now();

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) {
      setShaderError("WebGL is not supported in this browser environment.");
      return;
    }

    // Compile Vertex Shader
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER_SOURCE);
    gl.compileShader(vs);

    // Compile Fragment Shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, code);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const errorLog = gl.getShaderInfoLog(fs) || "Unknown compilation error";
      setShaderError(errorLog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    // Link Program
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setShaderError(gl.getProgramInfoLog(program) || "Failed to link shader program");
      return;
    }

    setShaderError(null);

    // Set up full-screen quad (2 triangles)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Render loop
    const render = (now: number) => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const elapsed = isPlaying ? (now - startTimeRef.current) / 1000 : pausedTimeRef.current;
      if (!isPlaying) pausedTimeRef.current = elapsed;

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // FPS tracking
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, [code, isPlaying]);

  useEffect(() => {
    const cleanup = compileAndRunShader();
    return () => {
      if (cleanup) cleanup();
    };
  }, [compileAndRunShader]);

  const handleReset = () => {
    startTimeRef.current = performance.now();
    pausedTimeRef.current = 0;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-800 bg-[#070b16] shadow-2xl overflow-hidden transition-all ${className}`}>
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#090e1d] border-b border-slate-800 gap-2">
        {/* Left: Branding & Presets */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-mono text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>WebGL • Canvas Shader</span>
          </div>

          <select
            onChange={(e) => {
              const preset = SHADER_PRESETS[e.target.value];
              if (preset) {
                setCode(preset.code);
                if (onCodeChange) onCodeChange(preset.code);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {Object.entries(SHADER_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Play / Pause / Reset & FPS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Reset Time"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
            {fps} FPS
          </span>
        </div>

        {/* Right: View Modes & Copy */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:text-white"}`}
              title="Shader Viewport Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:text-white"}`}
              title="GLSL Code Only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Copy Shader Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-[380px] bg-[#050811] relative">
        {/* GLSL Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800/80" : "w-full"} flex flex-col bg-[#070a14]`}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>fragment.glsl</span>
              </span>
              <span className="text-[10px] text-indigo-400">GLSL ES 1.0 / 3.0</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => {
                const next = e.target.value;
                setCode(next);
                if (onCodeChange) onCodeChange(next);
              }}
              className="flex-1 w-full p-4 bg-transparent text-indigo-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Canvas Viewport Pane */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-3 bg-black relative overflow-hidden`}>
            {shaderError && (
              <div className="absolute inset-x-4 top-4 z-20">
                <SandboxAutoFixLens
                  code={code}
                  language="glsl"
                  errorMessage={shaderError}
                  onApplyFix={(fixedCode) => {
                    setCode(fixedCode);
                    if (onCodeChange) onCodeChange(fixedCode);
                  }}
                />
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="w-full h-[360px] rounded-xl border border-slate-800 shadow-2xl cursor-crosshair"
            />
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#080d1b] border-t border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-2">
          <span className="text-indigo-400">Hardware Accelerated WebGL2</span>
          <span>•</span>
          <span>Interactive Uniforms: u_time, u_resolution, u_mouse</span>
        </span>
        <span>Fragment Pipeline Active</span>
      </div>
    </div>
  );
}
