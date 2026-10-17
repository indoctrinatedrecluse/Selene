"use client";

import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const SeleneEditor = dynamic(
  () => import("@/components/editor/SeleneEditor").then((mod) => mod.SeleneEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg animate-pulse">
            🌙
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-white text-sm">
              <span>Initializing Selene Canvas</span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            </div>
            <div className="text-xs text-slate-400">Loading Polymorphic Live Render Engine...</div>
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
