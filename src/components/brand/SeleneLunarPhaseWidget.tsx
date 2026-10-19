"use client";

import React, { useState, useEffect } from "react";
import { getLunarPhase, LunarPhaseInfo } from "@/lib/lunar-calendar";
import { Sparkles } from "lucide-react";

interface SeleneLunarPhaseWidgetProps {
  onOpenLore?: (tab: "myth" | "philosophy" | "theme" | "about") => void;
  className?: string;
  variant?: "badge" | "compact" | "detailed";
}

export function SeleneLunarPhaseWidget({
  onOpenLore,
  className = "",
  variant = "badge",
}: SeleneLunarPhaseWidgetProps) {
  const [lunarInfo, setLunarInfo] = useState<LunarPhaseInfo>(() => getLunarPhase());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    // Refresh periodically
    const interval = setInterval(() => {
      setLunarInfo(getLunarPhase());
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => {
          if (onOpenLore) onOpenLore("myth");
        }}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/25 text-sky-200 text-[11px] font-mono transition-all cursor-pointer shadow-sm ${className}`}
        title={`🌙 Selene Lunar Phase: ${lunarInfo.greekTransliteration} (${lunarInfo.name}) • ${lunarInfo.illuminationPct}% Illumination`}
      >
        <span className="text-xs">{lunarInfo.icon}</span>
        <span className="font-semibold text-sky-300 hidden md:inline">
          {lunarInfo.greekTransliteration}
        </span>
        <span className="text-slate-400 text-[10px]">
          {lunarInfo.illuminationPct}%
        </span>
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-950/50 via-sky-950/40 to-slate-900 border border-sky-400/30 text-sky-200 text-[10px] font-mono hover:border-sky-400/60 hover:text-white transition-all cursor-pointer shadow-sm shadow-sky-500/10 group"
        title="Current Astronomical Lunar Phase & Selene Lore"
      >
        <span className="text-xs group-hover:scale-110 transition-transform">
          {lunarInfo.icon}
        </span>
        <span className="font-semibold text-sky-300 tracking-wide">
          {lunarInfo.greekTransliteration}
        </span>
        <span className="text-slate-400 hidden xl:inline">
          ({lunarInfo.name})
        </span>
        <span className="text-sky-400 font-mono text-[9px] px-1 py-0.2 rounded bg-sky-500/15 border border-sky-500/20">
          {lunarInfo.illuminationPct}%
        </span>
      </button>

      {/* Popover detailing the current Phase & Orphic Hymn */}
      {isPopoverOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsPopoverOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-sky-500/30 bg-[#090d1d]/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{lunarInfo.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{lunarInfo.greekName}</span>
                    <span className="text-[10px] text-sky-400 font-serif italic">
                      ({lunarInfo.greekTransliteration})
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {lunarInfo.name} • Cycle Day {lunarInfo.ageDays}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30">
                {lunarInfo.illuminationPct}% Lit
              </span>
            </div>

            <div className="py-2.5 space-y-2">
              <p className="text-[11px] text-slate-300 italic font-serif leading-relaxed">
                &ldquo;{lunarInfo.hymnVerse}&rdquo;
              </p>
              <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[10px] text-indigo-300 flex items-center justify-between">
                <span>Diadem: <strong>Meniskos</strong></span>
                <span>Chariot: <strong>Radiant Steeds</strong></span>
              </div>
            </div>

            {onOpenLore && (
              <button
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false);
                  onOpenLore("myth");
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Explore Titan Lore & Hymns</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
