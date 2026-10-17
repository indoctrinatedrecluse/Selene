"use client";

import React, { useEffect, useRef, useState } from "react";

export type LunarBackgroundMode = "titan-aura" | "starry-cosmos" | "midnight-dark";

interface SeleneLunarBackgroundProps {
  mode?: LunarBackgroundMode;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  speed: number;
  flickerSpeed: number;
  color: string;
}

/**
 * SeleneLunarBackground
 * 
 * An atmospheric, GPU-accelerated ambient canvas paying homage to
 * Selene, the Titaness of the Moon. Renders gentle starry cosmos,
 * ethereal lunar corona glow, and soft celestial nebula drifts.
 * Completely non-distracting and zero layout shift.
 */
export function SeleneLunarBackground({
  mode = "titan-aura",
  className = "",
}: SeleneLunarBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTabActive, setIsTabActive] = useState(true);

  // Monitor visibility to pause animations when tab is inactive to preserve battery
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Stardust canvas rendering loop
  useEffect(() => {
    if (mode === "midnight-dark" || !isTabActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize starry constellation
    const starCount = mode === "titan-aura" ? 65 : 40;
    const stars: Star[] = [];
    const colors = ["#F8FAFC", "#E0F2FE", "#BAE6FD", "#C7D2FE", "#FEF08A"];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.7 + 0.1,
        maxAlpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.05 + 0.01,
        flickerSpeed: Math.random() * 0.015 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        // Subtle vertical drifting simulating celestial motion
        star.y -= star.speed;
        if (star.y < 0) star.y = height;

        // Twinkle flicker
        star.alpha += star.flickerSpeed;
        if (star.alpha > star.maxAlpha || star.alpha < 0.15) {
          star.flickerSpeed = -star.flickerSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.shadowBlur = star.radius * 3;
        ctx.shadowColor = star.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, isTabActive]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-1000 ${className}`}
    >
      {/* 1. Deep Midnight Celestial Base */}
      <div className="absolute inset-0 bg-[#070A14]" />

      {/* 2. Soft Ambient Lunar Corona & Nebula Clouds (Titan Aura) */}
      {mode === "titan-aura" && (
        <>
          {/* Upper Right Glowing Lunar Orb Halo */}
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-400/10 via-indigo-500/8 to-transparent blur-3xl opacity-70 animate-pulse"
            style={{ animationDuration: "8s" }}
          />

          {/* Bottom Left Celestial Chariot Mist */}
          <div
            className="absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-indigo-600/10 via-purple-600/6 to-transparent blur-3xl opacity-50"
          />

          {/* Center Subtle Cosmic Horizon Aura */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-sky-500/4 via-transparent to-transparent blur-3xl pointer-events-none"
          />
        </>
      )}

      {/* 3. Celestial Crescent of Selene (Stylized Mythological Watermark in Top Right) */}
      {(mode === "titan-aura" || mode === "starry-cosmos") && (
        <div className="absolute top-6 right-8 opacity-[0.06] hover:opacity-10 transition-opacity duration-700">
          <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
            {/* Titaness Lunar Chariot Crescent */}
            <path
              d="M 50 8 
                 C 74 8 92 26 92 50 
                 C 92 74 74 92 50 92 
                 C 62 80 68 66 68 50 
                 C 68 34 62 20 50 8 Z"
              fill="#E0F2FE"
            />
            {/* Radiating Star */}
            <circle cx="42" cy="50" r="3" fill="#FBBF24" />
          </svg>
        </div>
      )}

      {/* 4. Interactive Stardust Particle Canvas */}
      {mode !== "midnight-dark" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60"
        />
      )}
    </div>
  );
}
