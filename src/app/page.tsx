"use client";

import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";

const SeleneEditor = dynamic(
  () => import("@/components/editor/SeleneEditor").then((mod) => mod.SeleneEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#070A14] text-slate-300">
        <div className="flex items-center gap-3.5 p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
          <SeleneTitanLogo size="lg" glow={true} />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>Awakening Selene Canvas</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            </div>
            <div className="text-xs text-sky-400/90 font-serif italic">
              Titaness of the Moon • Polymorphic Live Render Engine
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <SeleneEditor />
    </main>
  );
}
