"use client";

import React, { useState } from "react";
import { Lock, Sparkles, Key, AlertTriangle, ExternalLink } from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";
import type { LicenseStatus } from "@/lib/licensing/license-service";
import { SeleneLicenseModal } from "./SeleneLicenseModal";

interface SeleneTimeLockBarrierProps {
  status: LicenseStatus | null;
  onLicenseUpdated: (status: LicenseStatus) => void;
}

export function SeleneTimeLockBarrier({ status, onLicenseUpdated }: SeleneTimeLockBarrierProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!status || !status.isLocked) {
    return null;
  }

  const isTampered = status.status === "tampered";

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#05070E]/95 backdrop-blur-xl p-6 text-slate-200">
      {/* Background ambient lunar halo */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none" />

      <div className="relative max-w-lg w-full p-8 rounded-3xl bg-[#090D1A]/90 border border-indigo-500/30 shadow-[0_0_80px_rgba(30,58,138,0.4)] text-center space-y-6">
        {/* Emblem & Lock icon */}
        <div className="relative mx-auto w-fit">
          <SeleneTitanLogo size="lg" glow={true} />
          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-rose-600 border-2 border-[#090D1A] shadow-lg">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title & Lore Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-xs font-semibold text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isTampered ? "Tamper Protection Activated" : "60-Day Evaluation Expired"}</span>
          </div>

          <h2 className="text-2xl font-bold text-white font-sans tracking-tight">
            {isTampered ? "License Integrity Violation" : "Selene Trial Has Concluded"}
          </h2>

          <p className="text-xs text-sky-400/90 font-serif italic">
            &ldquo;From her immortal head a celestial glow enfolds the Earth...&rdquo;
          </p>
        </div>

        {/* Informative message */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed text-left space-y-2">
          {isTampered ? (
            <p className="text-rose-200">
              {status.tamperReason ||
                "A system clock rollback or license registry modification was detected. To protect software integrity, execution is time-locked until an official license is bound."}
            </p>
          ) : (
            <p>
              Your tamper-protected <strong>60-day trial evaluation</strong> of Selene has finished. To continue enjoying the polymorphic multi-stack live canvas, Pyodide WASM computational notebooks, and document publishing suite, please activate an Admin, Developer, or User license.
            </p>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>Machine HWID:</span>
            <span className="text-indigo-300 font-semibold">{status.hwid}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>Enter License Key to Unlock</span>
            <Sparkles className="w-4 h-4 text-sky-300" />
          </button>

          {/* Contact / License inquiries */}
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>To acquire or provision an Enterprise, Developer, or User license:</p>
            <div className="flex items-center justify-center gap-3 text-sky-400">
              <a
                href="mailto:abmitra1999@gmail.com"
                className="hover:underline"
              >
                abmitra1999@gmail.com
              </a>
              <span>•</span>
              <a
                href="https://portfolio-flutter-78bcf.web.app/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>Portfolio Contact Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded License Modal for Entering Credentials */}
      <SeleneLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLicenseUpdated={(newStatus) => {
          onLicenseUpdated(newStatus);
          if (!newStatus.isLocked) {
            setIsModalOpen(false);
          }
        }}
        status={status}
        forcedLock={true}
      />
    </div>
  );
}
