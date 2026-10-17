"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  Play,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";
import { ProjectMetadata, RouteResolution } from "@/lib/project-detector";

export type ViewportMode = "desktop" | "laptop" | "tablet" | "mobile";

interface ProjectServerRendererProps {
  currentFilePath?: string;
  defaultRoute?: string;
  className?: string;
}

export function ProjectServerRenderer({
  currentFilePath = "src/app/page.tsx",
  defaultRoute = "/",
  className = "",
}: ProjectServerRendererProps) {
  const [route, setRoute] = useState(defaultRoute);
  const [inputUrl, setInputUrl] = useState(defaultRoute);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isLandscape, setIsLandscape] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Server & project state
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverPort, setServerPort] = useState(3000);
  const [serverUrl, setServerUrl] = useState("http://localhost:3000");
  const [projectMeta, setProjectMeta] = useState<ProjectMetadata | null>(null);
  const [resolvedRouteInfo, setResolvedRouteInfo] = useState<RouteResolution | null>(null);
  const [isStartingServer, setIsStartingServer] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Poll project and server status asynchronously
  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const url = `/api/project/status?filePath=${encodeURIComponent(
          currentFilePath
        )}&port=${serverPort}`;
        const res = await fetch(url);
        if (res.ok && isMounted) {
          const data = await res.json();
          setIsServerRunning(data.server.isRunning);
          if (data.server.port) setServerPort(data.server.port);
          if (data.server.url) setServerUrl(data.server.url);
          if (data.project) setProjectMeta(data.project);
          if (data.routeInfo) {
            setResolvedRouteInfo(data.routeInfo);
            if (data.routeInfo.resolvedRoute && data.routeInfo.confidence === "exact") {
              setRoute(data.routeInfo.resolvedRoute);
              setInputUrl(data.routeInfo.resolvedRoute);
            }
          }
        }
      } catch {
        // offline or probing
      }
    };

    const timer = setTimeout(poll, 0);
    const interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentFilePath, serverPort]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith("/")) {
      target = `/${target}`;
    }
    setRoute(target);
    setInputUrl(target);
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    if (iframeRef.current) {
      iframeRef.current.src = `${serverUrl}${route}?_r=${Date.now()}`;
    }
  };

  const handleStartServer = async () => {
    setIsStartingServer(true);
    try {
      await fetch("/api/project/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/project/status?filePath=${encodeURIComponent(currentFilePath)}&port=${serverPort}`
          );
          if (res.ok) {
            const data = await res.json();
            setIsServerRunning(data.server.isRunning);
            if (data.server.port) setServerPort(data.server.port);
            if (data.server.url) setServerUrl(data.server.url);
          }
        } catch {
          // ignore
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to start dev server", err);
    } finally {
      setIsStartingServer(false);
    }
  };

  // Viewport width calculation
  const getViewportDimensions = () => {
    switch (viewport) {
      case "mobile":
        return isLandscape ? { width: "667px", height: "375px" } : { width: "375px", height: "667px" };
      case "tablet":
        return isLandscape ? { width: "1024px", height: "768px" } : { width: "768px", height: "1024px" };
      case "laptop":
        return { width: "1024px", height: "100%" };
      case "desktop":
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const iframeSrc = `${serverUrl}${route.startsWith("/") ? route : `/${route}`}`;

  return (
    <div
      className={`flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl backdrop-blur-md transition-all ${className}`}
    >
      {/* Top Header Chrome */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Left: Server Status and Stack Badges */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
              isServerRunning
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isServerRunning ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isServerRunning ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span>{isServerRunning ? `Port ${serverPort} Active` : "Server Probing"}</span>
          </div>

          {/* JS Framework Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/50">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>
              {projectMeta?.jsFramework === "nextjs"
                ? "Next.js"
                : projectMeta?.jsFramework === "vite-react"
                ? "Vite + React"
                : "React SPA"}
            </span>
          </div>

          {/* CSS Stack Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold">
            {projectMeta?.cssFramework === "tailwind" ? (
              <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono">
                Tailwind CSS
              </span>
            ) : projectMeta?.cssFramework === "bootstrap" ? (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono">
                Bootstrap 5
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                Vanilla CSS
              </span>
            )}
          </div>
        </div>

        {/* Right: Viewport Controls & Popout */}
        <div className="flex items-center gap-1.5">
          {/* Viewport Presets */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "desktop" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("laptop")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "laptop" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Laptop View (1024px)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "tablet" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "mobile" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {(viewport === "mobile" || viewport === "tablet") && (
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              title="Rotate Orientation"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open in Browser Tab */}
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
            title="Open in New Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* URL / Navigation Address Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 text-xs">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reload Page (HMR Soft Refresh)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Input Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center">
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-2.5 text-slate-500 font-mono text-[11px] select-none">
              {serverUrl}
            </span>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-36 pr-16 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
              placeholder="/"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Go
            </button>
          </div>
        </form>

        {/* Route Confidence Indicator */}
        {resolvedRouteInfo && (
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">File:</span>
            <span className="text-slate-300 truncate max-w-[140px]" title={currentFilePath}>
              {currentFilePath.split("/").pop()}
            </span>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Linked Route
            </span>
          </div>
        )}
      </div>

      {/* Main Preview Frame Container */}
      <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-3 relative">
        {isServerRunning ? (
          <div
            style={getViewportDimensions()}
            className="transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white"
          >
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-none"
              title="Selene Live Project Render"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        ) : (
          /* Server Offline / Not Detected Fallback */
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Project Dev Server Offline</h3>
              <p className="text-xs text-slate-400 mt-1">
                No active development server was detected on port {serverPort}. Start the project server to enable live reload.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Command Line Quick Start:</span>
              </div>
              <div className="text-sky-400 pl-5">npm run dev</div>
              <div className="text-slate-500 text-[10px] pl-5">
                or click the button below to launch in the background.
              </div>
            </div>

            <button
              onClick={handleStartServer}
              disabled={isStartingServer}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isStartingServer ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Starting Background Server...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Background Dev Server</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status Ribbon */}
      <div className="px-3 py-1 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Real-time HMR Project Sync Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Viewport: {viewport.toUpperCase()}</span>
          <span>•</span>
          <span>Target: {serverUrl}{route}</span>
        </div>
      </div>
    </div>
  );
}
