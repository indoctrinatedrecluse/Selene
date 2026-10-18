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
  hasFlare?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  dx: number;
  dy: number;
  active: boolean;
}

/**
 * SeleneLunarBackground
 *
 * An atmospheric, GPU-accelerated ambient canvas paying homage to
 * Selene, the Titaness of the Moon. Offers 3 distinctly styled atmospheric modes:
 *
 * 1. "titan-aura"    : Luminous sapphire night sky, radiant cyan-blue corona halo,
 *                      Hyperion chariot mist, golden star jewel, and 75 drifting stardust particles.
 * 2. "starry-cosmos" : Deep interstellar purple/magenta void, dense 140+ twinkling galaxy stars,
 *                      swirling cosmic violet nebulae, and animated meteor shooting stars.
 * 3. "midnight-dark" : Pure pitch obsidian canvas with architectural coordinate dot-matrix grid
 *                      and cold silver moonlit rim halo. 0% CPU consumption, maximum contrast.
 */
export function SeleneLunarBackground({
  mode = "titan-aura",
  className = "",
}: SeleneLunarBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTabActive, setIsTabActive] = useState(true);

  // Monitor visibility to pause animations when tab is inactive to preserve CPU & battery
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Stardust & Shooting Star canvas rendering loop
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

    // Star configuration based on theme
    const isCosmos = mode === "starry-cosmos";
    const starCount = isCosmos ? 140 : 75;
    const stars: Star[] = [];

    const colors = isCosmos
      ? ["#F3E8FF", "#E9D5FF", "#F472B6", "#93C5FD", "#FDE68A", "#FFFFFF"]
      : ["#F8FAFC", "#E0F2FE", "#BAE6FD", "#C7D2FE", "#FEF08A"];

    for (let i = 0; i < starCount; i++) {
      const radius = isCosmos
        ? Math.random() * 1.8 + 0.3
        : Math.random() * 1.4 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        alpha: Math.random() * 0.7 + 0.15,
        maxAlpha: Math.random() * 0.6 + 0.4,
        speed: Math.random() * 0.04 + 0.008,
        flickerSpeed: Math.random() * 0.015 + 0.004,
        color: colors[Math.floor(Math.random() * colors.length)],
        hasFlare: isCosmos && radius > 1.4 && Math.random() > 0.6,
      });
    }

    // Shooting star state (for starry-cosmos)
    let shootingStar: ShootingStar | null = null;
    let nextShootingStarTime = Date.now() + 2500;

    const spawnShootingStar = () => {
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = Math.random() * (height * 0.4);
      const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // ~45 degrees diagonal
      const speed = Math.random() * 7 + 8;
      shootingStar = {
        x: startX,
        y: startY,
        length: Math.random() * 70 + 60,
        speed,
        alpha: 1.0,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        active: true,
      };
      nextShootingStarTime = Date.now() + Math.random() * 5000 + 4000;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Stars
      for (const star of stars) {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

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

        // 4-point sparkle flare on prominent cosmos stars
        if (star.hasFlare && star.alpha > 0.5) {
          const flareLen = star.radius * 3.5;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Render Shooting Star (Starry Cosmos only)
      if (isCosmos) {
        const now = Date.now();
        if (!shootingStar && now > nextShootingStarTime) {
          spawnShootingStar();
        }

        if (shootingStar && shootingStar.active) {
          shootingStar.x += shootingStar.dx;
          shootingStar.y += shootingStar.dy;
          shootingStar.alpha -= 0.018;

          if (
            shootingStar.alpha <= 0 ||
            shootingStar.x > width ||
            shootingStar.y > height
          ) {
            shootingStar = null;
          } else {
            const tailX = shootingStar.x - (shootingStar.dx / shootingStar.speed) * shootingStar.length;
            const tailY = shootingStar.y - (shootingStar.dy / shootingStar.speed) * shootingStar.length;

            const grad = ctx.createLinearGradient(
              tailX,
              tailY,
              shootingStar.x,
              shootingStar.y
            );
            grad.addColorStop(0, "rgba(233, 213, 255, 0)");
            grad.addColorStop(0.7, `rgba(192, 132, 252, ${shootingStar.alpha * 0.7})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.alpha})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(shootingStar.x, shootingStar.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#C084FC";
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(shootingStar.x, shootingStar.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.globalAlpha = shootingStar.alpha;
            ctx.fill();
          }
        }
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
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-700 ${className}`}
    >
      {/* 1. THEME BASE COLORS */}
      {mode === "titan-aura" && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913] via-[#090E22] to-[#04060E]" />
      )}

      {mode === "starry-cosmos" && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#080214] via-[#140628] to-[#05010B]" />
      )}

      {mode === "midnight-dark" && (
        <>
          <div className="absolute inset-0 bg-[#020305]" />
          {/* Architectural Coordinate Dot Matrix (Precision Developer Canvas) */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(#94A3B8 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </>
      )}

      {/* 2. THEME-SPECIFIC AMBIENT NEBULAE & CORONAS */}

      {/* Mode A: Titan Aura — Mythological Sapphire & Cyan Glow */}
      {mode === "titan-aura" && (
        <>
          {/* Upper Right Glowing Lunar Orb Halo */}
          <div
            className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-400/20 via-sky-500/12 to-indigo-600/5 blur-3xl opacity-80 animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          {/* Bottom Left Celestial Chariot Mist */}
          <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-blue-600/10 to-transparent blur-3xl opacity-60" />
          {/* Center Subtle Cosmic Horizon Aura */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-cyan-500/6 via-transparent to-transparent blur-3xl" />
        </>
      )}

      {/* Mode B: Starry Cosmos — Vibrant Galactic Violet & Fuchsia Nebula */}
      {mode === "starry-cosmos" && (
        <>
          {/* Upper Right Cosmic Rift Nebula */}
          <div
            className="absolute -top-36 -right-36 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-purple-500/30 via-fuchsia-600/20 to-indigo-900/25 blur-3xl opacity-85 animate-pulse"
            style={{ animationDuration: "10s" }}
          />
          {/* Bottom Left Deep Magenta Interstellar Cloud */}
          <div className="absolute -bottom-44 -left-44 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-fuchsia-600/25 via-purple-700/20 to-pink-900/15 blur-3xl opacity-75" />
          {/* Center Galactic Center Dust Lane Aura */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-purple-900/20 via-fuchsia-500/12 to-indigo-950/20 blur-3xl" />
        </>
      )}

      {/* Mode C: Midnight Dark — Stealth Moonlit Rim Halo */}
      {mode === "midnight-dark" && (
        <>
          {/* Top-Right Cold Silver Moonlit Rim Vignette */}
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-slate-400/8 via-slate-600/3 to-transparent blur-3xl" />
        </>
      )}

      {/* 3. CELESTIAL WATERMARK */}

      {/* Titan Aura Watermark: Luminous Silver & Gold Crescent */}
      {mode === "titan-aura" && (
        <div className="absolute top-6 right-8 opacity-[0.07] hover:opacity-15 transition-opacity duration-700">
          <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
            <path
              d="M 50 8 C 74 8 92 26 92 50 C 92 74 74 92 50 92 C 62 80 68 66 68 50 C 68 34 62 20 50 8 Z"
              fill="#BAE6FD"
            />
            <circle cx="42" cy="50" r="3.5" fill="#F59E0B" />
          </svg>
        </div>
      )}

      {/* Starry Cosmos Watermark: Galactic Lavender Crescent with Orbital Rings */}
      {mode === "starry-cosmos" && (
        <div className="absolute top-6 right-8 opacity-[0.09] hover:opacity-20 transition-opacity duration-700">
          <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="50" rx="44" ry="22" stroke="#C084FC" strokeWidth="0.8" transform="rotate(-25 50 50)" />
            <path
              d="M 50 8 C 74 8 92 26 92 50 C 92 74 74 92 50 92 C 62 80 68 66 68 50 C 68 34 62 20 50 8 Z"
              fill="#E9D5FF"
            />
            <polygon points="42,43 45,50 42,57 39,50" fill="#F472B6" />
          </svg>
        </div>
      )}

      {/* Midnight Dark Watermark: Precision Silver Geometric Ring */}
      {mode === "midnight-dark" && (
        <div className="absolute top-6 right-8 opacity-[0.05]">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
            <path
              d="M 50 12 C 71 12 88 29 88 50 C 88 71 71 88 50 88 C 60 78 66 65 66 50 C 66 35 60 22 50 12 Z"
              fill="#94A3B8"
            />
          </svg>
        </div>
      )}

      {/* 4. GPU-ACCELERATED STARDUST CANVAS */}
      {mode !== "midnight-dark" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-70"
        />
      )}
    </div>
  );
}
