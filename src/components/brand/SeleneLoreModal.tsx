"use client";

import React, { useState } from "react";
import {
  X,
  Moon,
  Sparkles,
  Sun,
  Compass,
  Palette,
  BookOpen,
} from "lucide-react";
import { SeleneTitanLogo } from "./SeleneTitanLogo";
import { LunarBackgroundMode } from "./SeleneLunarBackground";

interface SeleneLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundMode: LunarBackgroundMode;
  onBackgroundModeChange: (mode: LunarBackgroundMode) => void;
}

export function SeleneLoreModal({
  isOpen,
  onClose,
  backgroundMode,
  onBackgroundModeChange,
}: SeleneLoreModalProps) {
  const [activeTab, setActiveTab] = useState<"myth" | "philosophy" | "theme">("myth");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-500/30 bg-[#0A0E1A]/95 shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header with Lunar Halo */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SeleneTitanLogo size="lg" glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Selene</span>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Titaness of the Moon
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-serif italic mt-0.5">
                Σελήνη — She who drives the silver chariot across the nocturnal heavens
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/50 text-xs">
          <button
            onClick={() => setActiveTab("myth")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === "myth"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mythology & Heritage</span>
          </button>

          <button
            onClick={() => setActiveTab("philosophy")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === "philosophy"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Product Philosophy</span>
          </button>

          <button
            onClick={() => setActiveTab("theme")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === "theme"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Lunar Ambiance</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm leading-relaxed text-slate-300">
          {activeTab === "myth" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <h3 className="text-sm font-semibold text-sky-300 mb-1 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span>The Primordial Titaness of Gentle Nocturnal Light</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In classical Greek mythology, <strong>Selene</strong> (Σελήνη) is the archaic Titaness embodiment of the moon. Daughter of the Hyperion and Theia, she stands alongside her siblings: <strong>Helios</strong>, the blazing Sun, and <strong>Eos</strong>, the rosy-fingered Dawn.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  The Silver Chariot & The Celestial Journey
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  Each dusk as Helios completes his scorching flight across the firmament, Selene emerges from the streams of Oceanus. Donning luminous silver robes and her crown—the crescent <em>meniskos</em>—she mounts her two-winged chariot drawn by radiant steeds, sweeping across the cosmos to illuminate the earth with serene, restorative clarity.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  The Torch of Endymion & Nighttime Inspiration
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  Ancient poets revered Selene as the muse of late-night contemplation. While the sun demands toil, Selene’s gentle rays watch over thinkers, stargazers, and creators during the quiet hours of nocturnal brilliance.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-lg">🌙</span>
                  <div className="text-xs font-semibold text-white mt-1">Meniskos</div>
                  <div className="text-[10px] text-slate-400">The Crescent Diadem</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-lg">🐎</span>
                  <div className="text-xs font-semibold text-white mt-1">Aura Chariot</div>
                  <div className="text-[10px] text-slate-400">Winged Celestial Steeds</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-lg">✨</span>
                  <div className="text-xs font-semibold text-white mt-1">Hyperion</div>
                  <div className="text-[10px] text-slate-400">Lineage of High Heavens</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "philosophy" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/20">
                <h3 className="text-sm font-semibold text-sky-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Why This Editor is Named Selene</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traditional development environments often resemble the blinding sun: harsh context switches, disjointed windows, noisy consoles, and broken preview stylesheets. 
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Effortless Visual Clarity</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Just as Selene’s silver torch reveals landscape contours by night without scorching them, Selene reveals your components, math formulas, and architecture diagrams with 100% accurate live renders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Zero CSS Bleed & Isolation</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Like the pristine separation between celestial space and earthly weather, our isolated micro-sandboxes guarantee your Tailwind, Bootstrap, and scoped component styles never leak into the host workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">A Companion for Late-Night Craftsmanship</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Engineered for developers who do their best deep work during the quiet nocturnal hours. Distraction-free, fluid, and always synchronized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Your Ambient Lunar Background
                </h4>
                <p className="text-xs text-slate-400">
                  Choose the atmospheric ambiance of the canvas behind your documents:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Titan Aura Mode */}
                <button
                  onClick={() => onBackgroundModeChange("titan-aura")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    backgroundMode === "titan-aura"
                      ? "bg-sky-500/10 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🌙</span>
                    {backgroundMode === "titan-aura" && (
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">Titan Aura</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Luminous crescent, ethereal nebula haze & twinkling stardust.
                  </div>
                </button>

                {/* Starry Cosmos Mode */}
                <button
                  onClick={() => onBackgroundModeChange("starry-cosmos")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    backgroundMode === "starry-cosmos"
                      ? "bg-sky-500/10 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">✨</span>
                    {backgroundMode === "starry-cosmos" && (
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">Starry Cosmos</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Gentle constellation particles with soft lunar crescent.
                  </div>
                </button>

                {/* Midnight Dark Mode */}
                <button
                  onClick={() => onBackgroundModeChange("midnight-dark")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    backgroundMode === "midnight-dark"
                      ? "bg-sky-500/10 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🌑</span>
                    {backgroundMode === "midnight-dark" && (
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">Midnight Dark</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Pure, distraction-free deep dark canvas with zero ambient motion.
                  </div>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-300">GPU Efficient:</span> The ambient canvas renders via lightweight CSS/WebGL transforms, automatically sleeping when backgrounded to preserve CPU and battery.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-serif italic text-sky-400/80">
            <span>&ldquo;And from her immortal head a radiance is shown from heaven...&rdquo;</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Enter Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
