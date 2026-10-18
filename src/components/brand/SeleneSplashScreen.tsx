"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { SELENE_VERSION_DISPLAY } from "@/lib/version";

interface SeleneSplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const BOOT_STEPS = [
  "Aligning Nocturnal Celestial Sphere...",
  "Loading WebAssembly Python 3.12 Kernel (Pyodide)...",
  "Mounting Multi-Framework Sandboxes & AST Transformer...",
  "Initializing ProseMirror Block Orchestration Engine...",
  "Illuminating Selene Technical Canvas...",
];

export function SeleneSplashScreen({
  onComplete,
  minDurationMs = 2200,
}: SeleneSplashScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const stepInterval = minDurationMs / BOOT_STEPS.length;
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next < BOOT_STEPS.length) {
          setProgress(Math.round(((next + 1) / BOOT_STEPS.length) * 100));
          return next;
        }
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDismissed(true);
            onComplete?.();
          }, 450);
        }, 300);
        return prev;
      });
    }, stepInterval);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  if (isDismissed) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsDismissed(true);
      onComplete?.();
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040711] text-white overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Dynamic Starlight & Lunar Aura Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Central Lunar Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-sky-600/20 via-indigo-600/15 to-purple-600/10 blur-[130px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-sky-400/15 blur-[90px]" />

        {/* Constellation Stars */}
        <div className="absolute top-[12%] left-[18%] w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping" />
        <div className="absolute top-[28%] right-[22%] w-1 h-1 rounded-full bg-amber-200 animate-pulse" />
        <div className="absolute bottom-[25%] left-[25%] w-1.5 h-1.5 rounded-full bg-indigo-300" />
        <div className="absolute bottom-[18%] right-[15%] w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
        <div className="absolute top-[45%] left-[10%] w-1 h-1 rounded-full bg-white/70" />
        <div className="absolute top-[65%] right-[12%] w-1 h-1 rounded-full bg-purple-300 animate-ping" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center space-y-6">
        {/* Mythological Illustration: Selene the Moon Titan Driving Her Chariot Across the Cosmos */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-b from-sky-400/20 via-indigo-900/40 to-[#040711] border border-sky-400/40 flex items-center justify-center p-3 shadow-[0_0_50px_rgba(56,189,248,0.25)] relative overflow-hidden backdrop-blur-md">
            {/* SVG Artwork: Selene the Titaness with Crescent Crown & Celestial Chariot */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="splashMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#E0F2FE" />
                  <stop offset="70%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
                <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <radialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#040711" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Lunar Aura */}
              <circle cx="100" cy="100" r="90" fill="url(#splashGlow)" />

              {/* Cosmic Wave / Billowing Veil */}
              <path
                d="M 20 145 C 50 120, 90 160, 130 135 C 160 115, 180 140, 190 150"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              <path
                d="M 10 160 C 60 130, 110 175, 160 145 C 180 135, 195 155, 200 165"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeOpacity="0.4"
              />

              {/* The Silver Crescent Moon of Selene */}
              <path
                d="M 100 24 C 141.98 24 176 58.02 176 100 C 176 141.98 141.98 176 100 176 C 118 152 128 127 128 100 C 128 73 118 48 100 24 Z"
                fill="url(#splashMoonGrad)"
              />

              {/* Selene's Winged Steed Chariot Silhouette */}
              <path
                d="M 45 108 C 55 98, 70 95, 82 102 C 86 94, 94 92, 102 96 C 96 104, 92 114, 88 122 C 78 125, 68 122, 60 116 Z"
                fill="#FFFFFF"
                fillOpacity="0.9"
              />
              {/* Steed's Wings */}
              <path
                d="M 68 96 C 72 82, 85 75, 96 74 C 92 84, 86 92, 78 96 Z"
                fill="#E0F2FE"
                fillOpacity="0.85"
              />
              <path
                d="M 58 98 C 60 88, 70 82, 80 82 C 76 90, 70 96, 62 98 Z"
                fill="#BAE6FD"
                fillOpacity="0.75"
              />

              {/* Chariot Wheel of Silver */}
              <circle cx="56" cy="126" r="10" stroke="url(#splashGoldGrad)" strokeWidth="2.5" fill="#040711" />
              <line x1="56" y1="116" x2="56" y2="136" stroke="#FBBF24" strokeWidth="1.5" />
              <line x1="46" y1="126" x2="66" y2="126" stroke="#FBBF24" strokeWidth="1.5" />

              {/* Crown Star of Nocturnal Clarity */}
              <path
                d="M 132 60 L 136 72 L 148 76 L 136 80 L 132 92 L 128 80 L 116 76 L 128 72 Z"
                fill="url(#splashGoldGrad)"
              />
              <circle cx="132" cy="76" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Glowing Ring */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 opacity-30 blur-sm group-hover:opacity-60 transition duration-500 -z-10" />
        </div>

        {/* Title & Mythological Epithet */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-sky-400 font-bold">
              Σ Ε Λ Η Ν Η • TITAN OF THE MOON
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Selene</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-medium">
              {SELENE_VERSION_DISPLAY}
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-400 max-w-sm leading-relaxed">
            The Hypermodern Technical Document & Code Canvas with live in-memory sandboxes, WebAssembly data science, and native desktop execution.
          </p>
        </div>

        {/* Homeric Hymn Quote */}
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300/90 italic max-w-md font-serif leading-relaxed shadow-inner">
          &ldquo;She puts on her gleaming silver garments, and hitching up her celestial steeds, she drives forth across the night, shining with serene clarity.&rdquo;
          <div className="text-[10px] text-sky-400 font-mono not-italic mt-1">
            — Homeric Hymn XXXII to Selene
          </div>
        </div>

        {/* Boot Progress & Telemetry */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400 animate-spin" />
              <span className="truncate max-w-[200px]">{BOOT_STEPS[stepIndex]}</span>
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>WASM Ready</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Zero CSS Bleed</span>
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800"
            >
              <span>Skip</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
