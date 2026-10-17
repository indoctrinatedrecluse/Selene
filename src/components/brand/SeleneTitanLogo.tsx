"use client";

import React from "react";

interface SeleneTitanLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

const SIZE_MAP = {
  xs: "w-5 h-5",
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-14 h-14",
};

/**
 * Selene Titan Logo
 * 
 * Reimagines Selene, the Titaness of the Moon from Greek mythology:
 * - The radiant crescent moon crown (meniskos)
 * - The celestial torch & star core of nocturnal clarity
 * - Winged chariot arcs slicing through midnight celestial darkness
 */
export function SeleneTitanLogo({
  className = "",
  size = "md",
  glow = true,
}: SeleneTitanLogoProps) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Ambient Celestial Glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-sky-400/25 to-amber-300/20 blur-md pointer-events-none animate-pulse"
          style={{ animationDuration: "4s" }}
        />
      )}

      {/* SVG Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} relative z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-transform hover:scale-105 duration-300`}
      >
        <defs>
          {/* Lunar Gradient */}
          <linearGradient id="lunarCrescentGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="35%" stopColor="#E0F2FE" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Golden Torch Flame / Star Core Gradient */}
          <linearGradient id="torchStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Halo Glow Filter */}
          <radialGradient id="titanAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ethereal Halo Background */}
        <circle cx="50" cy="50" r="46" fill="url(#titanAura)" />

        {/* Chariot Orbital Arc 1 (Outer Celestial Ring) */}
        <path
          d="M 22 78 C 8 58 12 30 35 18 C 58 6 86 16 94 40"
          stroke="url(#lunarCrescentGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.6"
        />

        {/* Chariot Orbital Arc 2 (Inner Celestial Ring) */}
        <path
          d="M 78 22 C 92 42 88 70 65 82 C 42 94 14 84 6 60"
          stroke="#818CF8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 5"
          opacity="0.4"
        />

        {/* Selene's Iconic Crescent Moon Diadem / Crown */}
        <path
          d="M 50 12 
             C 70.98 12 88 29.02 88 50 
             C 88 70.98 70.98 88 50 88 
             C 58 77 62 64 62 50 
             C 62 36 58 23 50 12 Z"
          fill="url(#lunarCrescentGrad)"
          filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.5))"
        />

        {/* Ethereal Inner Crescent Silhouette */}
        <path
          d="M 44 22 
             C 60 22 74 34 74 50 
             C 74 66 60 78 44 78 
             C 51 70 55 61 55 50 
             C 55 39 51 30 44 22 Z"
          fill="#060913"
          opacity="0.3"
        />

        {/* Selene's Lunar Star & Nocturnal Torch Crest */}
        <g transform="translate(36, 44)">
          {/* Four-pointed Star of Clarity */}
          <path
            d="M 14 0 L 17 10 L 28 14 L 17 18 L 14 28 L 11 18 L 0 14 L 11 10 Z"
            fill="url(#torchStarGrad)"
            filter="drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))"
          />
          {/* Radiant Core Diamond */}
          <circle cx="14" cy="14" r="3" fill="#FFFFFF" />
        </g>

        {/* Subtle Constellation Sparkles */}
        <circle cx="28" cy="30" r="1.5" fill="#E2E8F0" opacity="0.8" />
        <circle cx="72" cy="74" r="1.5" fill="#E2E8F0" opacity="0.8" />
        <circle cx="82" cy="32" r="1.2" fill="#FDE68A" opacity="0.9" />
        <circle cx="20" cy="62" r="1.2" fill="#BAE6FD" opacity="0.7" />
      </svg>
    </div>
  );
}
