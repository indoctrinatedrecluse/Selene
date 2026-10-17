"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  RefreshCw,
  ExternalLink,
  Code2,
  Eye,
  Columns,
  Sparkles,
  Copy,
  Check,
  Globe,
  Zap,
} from "lucide-react";
import { DEFAULT_SNIPPETS_BY_LANG } from "./stack-templates";

export type FlutterDevicePreset = "desktop" | "iphone" | "pixel" | "ipad";
export type FlutterViewMode = "split" | "canvas" | "code";
export type FlutterEngineMode = "cloud-wasm" | "local-server";

interface FlutterWebRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: FlutterEngineMode;
  localServerPort?: number;
}

const FLUTTER_PRESETS: Record<string, { label: string; code: string }> = {
  counter: {
    label: "Material 3 Counter",
    code: DEFAULT_SNIPPETS_BY_LANG.dart || "",
  },
  cupertino: {
    label: "Cupertino iOS Card",
    code: `import 'package:flutter/cupertino.dart';

void main() => runApp(const CupertinoDemoApp());

class CupertinoDemoApp extends StatelessWidget {
  const CupertinoDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoApp(
      debugShowCheckedModeBanner: false,
      theme: CupertinoThemeData(
        brightness: Brightness.dark,
        primaryColor: CupertinoColors.systemIndigo,
      ),
      home: CupertinoHome(),
    );
  }
}

class CupertinoHome extends StatefulWidget {
  const CupertinoHome({super.key});

  @override
  State<CupertinoHome> createState() => _CupertinoHomeState();
}

class _CupertinoHomeState extends State<CupertinoHome> {
  bool _switchVal = true;
  double _sliderVal = 75.0;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Selene Cupertino iOS'),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CupertinoListSection.insetGrouped(
                header: const Text('HARDWARE ACCELERATION'),
                children: [
                  CupertinoListTile(
                    leading: const Icon(CupertinoIcons.bolt_fill, color: CupertinoColors.systemYellow),
                    title: const Text('Skia CanvasKit'),
                    trailing: CupertinoSwitch(
                      value: _switchVal,
                      onChanged: (v) => setState(() => _switchVal = v),
                    ),
                  ),
                  CupertinoListTile(
                    leading: const Icon(CupertinoIcons.speedometer, color: CupertinoColors.activeGreen),
                    title: const Text('Frame Rate: 60 FPS'),
                    subtitle: Text('Target: \${_sliderVal.round()} FPS'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              CupertinoSlider(
                value: _sliderVal,
                min: 30.0,
                max: 120.0,
                divisions: 6,
                onChanged: (v) => setState(() => _sliderVal = v),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  customPaint: {
    label: "Custom Painter Canvas",
    code: `import 'dart:math' as math;
import 'package:flutter/material.dart';

void main() => runApp(const PainterApp());

class PainterApp extends StatelessWidget {
  const PainterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF070B14),
      ),
      home: const RadialOrbScreen(),
    );
  }
}

class RadialOrbScreen extends StatefulWidget {
  const RadialOrbScreen({super.key});

  @override
  State<RadialOrbScreen> createState() => _RadialOrbScreenState();
}

class _RadialOrbScreenState extends State<RadialOrbScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return CustomPaint(
              size: const Size(260, 260),
              painter: ParticlePulsePainter(_controller.value),
            );
          },
        ),
      ),
    );
  }
}

class ParticlePulsePainter extends CustomPainter {
  final double progress;
  ParticlePulsePainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width * 0.35;

    for (int i = 0; i < 8; i++) {
      final angle = (i * 2 * math.pi / 8) + (progress * 2 * math.pi);
      final r = baseRadius + math.sin(progress * 2 * math.pi + i) * 16;
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);

      final paint = Paint()
        ..color = Color.lerp(
          const Color(0xFF0284C7),
          const Color(0xFF38BDF8),
          (math.sin(progress * 2 * math.pi + i) + 1) / 2,
        )!
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(x, y), 8, paint);
    }

    final corePaint = Paint()
      ..shader = const RadialGradient(
        colors: [Color(0xFF38BDF8), Color(0xFF0284C7), Colors.transparent],
        stops: [0.2, 0.7, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: baseRadius));

    canvas.drawCircle(center, baseRadius * 0.7, corePaint);
  }

  @override
  bool shouldRepaint(covariant ParticlePulsePainter oldDelegate) => true;
}
`,
  },
};

export function FlutterWebRenderer({
  initialCode,
  className = "",
  defaultEngineMode = "cloud-wasm",
  localServerPort = 8080,
}: FlutterWebRendererProps) {
  const codeToUse = initialCode || DEFAULT_SNIPPETS_BY_LANG.dart || "";
  const [currentCode, setCurrentCode] = useState(codeToUse);
  const [device, setDevice] = useState<FlutterDevicePreset>("desktop");
  const [isLandscape, setIsLandscape] = useState(false);
  const [viewMode, setViewMode] = useState<FlutterViewMode>("split");
  const [engineMode, setEngineMode] = useState<FlutterEngineMode>(defaultEngineMode);
  const [port, setPort] = useState(localServerPort);
  const [isCopied, setIsCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync code to DartPad iframe via postMessage
  const syncCodeToDartPad = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const message = {
        type: "sourceCode",
        sourceCode: {
          "main.dart": currentCode,
        },
      };
      iframeRef.current.contentWindow.postMessage(message, "https://dartpad.dev");
    } catch (e) {
      console.warn("Unable to postMessage to DartPad:", e);
    }
  }, [currentCode]);

  useEffect(() => {
    if (engineMode === "cloud-wasm" && iframeLoaded) {
      const timer = setTimeout(syncCodeToDartPad, 400);
      return () => clearTimeout(timer);
    }
  }, [engineMode, iframeLoaded, syncCodeToDartPad]);

  const handleEditPort = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = prompt("Enter local Flutter web port:", String(port));
    if (input) {
      const p = parseInt(input.trim(), 10);
      if (!isNaN(p) && p > 0) setPort(p);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePresetSelect = (presetKey: string) => {
    if (FLUTTER_PRESETS[presetKey]) {
      setCurrentCode(FLUTTER_PRESETS[presetKey].code);
    }
  };

  // Dimensions based on device selection
  const getDeviceDimensions = () => {
    switch (device) {
      case "iphone":
        return isLandscape
          ? { width: "852px", height: "393px" }
          : { width: "393px", height: "852px" };
      case "pixel":
        return isLandscape
          ? { width: "915px", height: "412px" }
          : { width: "412px", height: "915px" };
      case "ipad":
        return isLandscape
          ? { width: "1024px", height: "768px" }
          : { width: "768px", height: "1024px" };
      case "desktop":
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const cloudEmbedUrl = "https://dartpad.dev/embed-flutter.html?theme=dark&split=50&run=true";
  const localEmbedUrl = `http://localhost:${port}`;
  const iframeSrc = engineMode === "cloud-wasm" ? cloudEmbedUrl : localEmbedUrl;

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* Top Header Chrome */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md gap-2">
        {/* Left: Engine Mode & Badges */}
        <div className="flex items-center gap-2">
          {/* Engine Selector */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setEngineMode("cloud-wasm")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                engineMode === "cloud-wasm"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Interactive Web WASM Engine (CanvasKit / Skia)"
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span>CanvasKit WASM</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineMode("local-server")}
              onDoubleClick={handleEditPort}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                engineMode === "local-server"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={`Local Flutter Web Server (http://localhost:${port}) - Double-click to change port`}
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Local Dev ({port})</span>
            </button>
          </div>

          {/* Technology Badges */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Flutter 3.x Web</span>
          </div>

          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/50">
            <span>60 FPS Fluid</span>
          </div>
        </div>

        {/* Right: Presets, View Controls, and Device Switcher */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            defaultValue="counter"
            className="text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          >
            <option value="counter">Material 3 Counter</option>
            <option value="cupertino">Cupertino iOS Card</option>
            <option value="customPaint">Custom Painter Canvas</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("code")}
              title="Dart Code View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === "code"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              title="Split View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === "split"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              title="Flutter Web Canvas"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === "canvas"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
          </div>

          {/* Device Frame Presets */}
          <div className="hidden lg:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded transition-colors ${
                device === "desktop" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Desktop Canvas"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("ipad")}
              className={`p-1.5 rounded transition-colors ${
                device === "ipad" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="iPad Mini"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("iphone")}
              className={`p-1.5 rounded transition-colors ${
                device === "iphone" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="iPhone 15 Pro"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {device !== "desktop" && (
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              title="Rotate Device Orientation"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Sync / Re-run */}
          <button
            onClick={syncCodeToDartPad}
            title="Recompile & Run Flutter Web"
            className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            title="Copy Dart Code"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Popout */}
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Browser Window"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row min-h-[480px]">
        {/* Left: Code Editor (if split or code mode) */}
        {viewMode !== "canvas" && (
          <div
            className={`border-r border-slate-800 bg-slate-950/70 p-3 flex flex-col ${
              viewMode === "code" ? "w-full" : "w-full md:w-1/2"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                <span>lib/main.dart</span>
              </span>
              <span>Dart 3.x</span>
            </div>
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              className="flex-1 w-full bg-slate-900/60 text-slate-200 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-sky-500/60 resize-none leading-relaxed"
              rows={18}
              spellCheck={false}
            />
          </div>
        )}

        {/* Right: Live Flutter Canvas (if split or canvas mode) */}
        {viewMode !== "code" && (
          <div
            className={`flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 relative overflow-hidden ${
              viewMode === "canvas" ? "w-full" : "w-full md:w-1/2"
            }`}
          >
            <div
              style={getDeviceDimensions()}
              className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-[#0b0f19] flex flex-col transition-all duration-300 max-h-[640px]"
            >
              {/* Device Notch & Status bar for mobile */}
              {device !== "desktop" && (
                <div className="h-6 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono select-none">
                  <span>9:41</span>
                  <div className="w-16 h-3 bg-black rounded-full mx-auto" />
                  <span>100%</span>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={iframeSrc}
                onLoad={() => {
                  setIframeLoaded(true);
                  syncCodeToDartPad();
                }}
                className="w-full flex-1 border-none min-h-[420px]"
                title="Flutter Web Live Render"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Ribbon */}
      <div className="px-3.5 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-sky-400" />
          <span>Flutter CanvasKit Hardware Renderer</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Engine: {engineMode === "cloud-wasm" ? "DartPad WASM" : `Local :${port}`}</span>
          <span>•</span>
          <span>Device: {device.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
