"use client";

import React from "react";
import { SELENE_VERSION_DISPLAY, SELENE_EDITION_DISPLAY, APP_VERSION } from "@/lib/version";

interface SeleneVersionBadgeProps {
  variant?: "pill" | "subtle" | "edition" | "minimal";
  className?: string;
  prefix?: string;
}

/**
 * Selene Universal Version Badge
 * 
 * Centralized display component that guarantees the active semantic version
 * (e.g. v0.5.0) is consistently formatted and displayed across loading screens,
 * splash screens, modals, footers, and headers from a single source of truth.
 */
export function SeleneVersionBadge({
  variant = "pill",
  className = "",
  prefix = "",
}: SeleneVersionBadgeProps) {
  if (variant === "edition") {
    return (
      <span className={`font-mono text-sky-400 font-medium ${className}`}>
        {prefix}{SELENE_EDITION_DISPLAY}
      </span>
    );
  }

  if (variant === "subtle") {
    return (
      <span className={`text-[10px] text-slate-400 font-mono ${className}`}>
        {prefix}{SELENE_VERSION_DISPLAY}
      </span>
    );
  }

  if (variant === "minimal") {
    return (
      <span className={`font-mono ${className}`}>
        {prefix}{APP_VERSION}
      </span>
    );
  }

  // Default "pill" badge
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-medium inline-flex items-center gap-1 select-none ${className}`}
      title={`Selene ${SELENE_EDITION_DISPLAY}`}
    >
      {prefix}{SELENE_VERSION_DISPLAY}
    </span>
  );
}
