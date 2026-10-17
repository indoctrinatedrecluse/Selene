"use client";

import React from "react";
import { ShieldCheck, Terminal, Crown, Clock, AlertTriangle, Sparkles } from "lucide-react";
import type { LicenseStatus, LicenseTier } from "@/lib/licensing/license-service";

interface SeleneLicenseBadgeProps {
  status: LicenseStatus | null;
  onClick?: () => void;
  className?: string;
}

export function SeleneLicenseBadge({ status, onClick, className = "" }: SeleneLicenseBadgeProps) {
  if (!status) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 animate-pulse">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>Verifying...</span>
      </div>
    );
  }

  const { type, isLocked, daysRemaining, status: stateString } = status;

  if (isLocked || stateString === "tampered") {
    return (
      <button
        onClick={onClick}
        type="button"
        title="Software is locked. Click to enter a valid license."
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-[11px] font-semibold text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:bg-rose-900/90 hover:border-rose-400 transition-all ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
        <span>{stateString === "tampered" ? "License Tampered" : "Trial Expired"}</span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-rose-900/80 border border-rose-500/40 text-rose-200">
          Unlock
        </span>
      </button>
    );
  }

  // Render stylized tier badges in strictly ascending order: User < Dev < Admin
  switch (type as LicenseTier) {
    case "ADMIN":
      return (
        <button
          onClick={onClick}
          type="button"
          title={`Titan Admin License • Node-locked to this device (${daysRemaining > 3000 ? "Perpetual" : `${daysRemaining} days left`})`}
          className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/90 via-yellow-900/80 to-amber-900/90 border border-amber-400/80 text-[11px] font-bold text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.35)] hover:shadow-[0_0_24px_rgba(251,191,36,0.55)] hover:border-amber-300 transition-all cursor-pointer ring-1 ring-amber-400/40 ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <Crown className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          <span className="tracking-wide uppercase bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent font-extrabold">
            Titan Admin
          </span>
          <Sparkles className="w-3 h-3 text-yellow-300/80 group-hover:rotate-12 transition-transform" />
        </button>
      );

    case "DEV":
      return (
        <button
          onClick={onClick}
          type="button"
          title={`Developer Edition • Full Engine & AST Tools Active (${daysRemaining > 3000 ? "Perpetual" : `${daysRemaining} days remaining`})`}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-pink-950/90 border border-purple-500/60 text-[11px] font-semibold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:border-purple-400 transition-all cursor-pointer ${className}`}
        >
          <Terminal className="w-3 h-3 text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" />
          <span className="tracking-wide">Dev Edition</span>
          <span className="text-[10px] px-1 rounded bg-purple-900/60 border border-purple-500/30 text-purple-300">
            Pro
          </span>
        </button>
      );

    case "USER":
      return (
        <button
          onClick={onClick}
          type="button"
          title={`User License Active (${daysRemaining > 3000 ? "Perpetual" : `${daysRemaining} days remaining`})`}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 via-teal-950/70 to-emerald-950/80 border border-teal-500/50 text-[11px] font-medium text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.2)] hover:border-teal-400 transition-all cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <span>User Edition</span>
        </button>
      );

    case "TRIAL":
    default:
      return (
        <button
          onClick={onClick}
          type="button"
          title="Click to activate an Admin, Dev, or User license"
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300 shadow-sm hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all cursor-pointer ${className}`}
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Trial:</span>
          <span className="font-semibold text-amber-300">
            {daysRemaining}d left
          </span>
          <span className="text-[10px] text-indigo-400 font-serif italic group-hover:underline">
            Upgrade
          </span>
        </button>
      );
  }
}
