"use client";

import React, { useState } from "react";
import {
  X,
  Key,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Crown,
  Terminal,
  Clock,
  Trash2,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";
import type { LicenseStatus, LicenseTier } from "@/lib/licensing/license-service";
import { SeleneLicenseBadge } from "./SeleneLicenseBadge";

interface SeleneLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseUpdated: (status: LicenseStatus) => void;
  status: LicenseStatus | null;
  forcedLock?: boolean;
}

export function SeleneLicenseModal({
  isOpen,
  onClose,
  onLicenseUpdated,
  status,
  forcedLock = false,
}: SeleneLicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [revealKey, setRevealKey] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-detect tier prefix as user types
  const trimmedKey = licenseKey.trim().toUpperCase();
  const detectedTier: LicenseTier = trimmedKey.startsWith("ADM-")
    ? "ADMIN"
    : trimmedKey.startsWith("DEV-")
    ? "DEV"
    : trimmedKey.startsWith("USER-")
    ? "USER"
    : "TRIAL";

  const isUserOrDev = detectedTier === "USER" || detectedTier === "DEV";

  const handleClose = () => {
    setFeedback(null);
    setLicenseKey("");
    setUsername("");
    setPassword("");
    onClose();
  };

  if (!isOpen) return null;

  const handleCopyHwid = () => {
    if (status?.hwid) {
      navigator.clipboard.writeText(status.hwid);
      setCopiedHwid(true);
      setTimeout(() => setCopiedHwid(false), 2000);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: trimmedKey,
          username: isUserOrDev ? username.trim() : undefined,
          password: isUserOrDev ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: "error",
          message: data.message || "Failed to activate license. Please check your credentials.",
        });
      } else {
        setFeedback({
          type: "success",
          message: data.message || "License successfully activated!",
        });
        if (data.license) {
          onLicenseUpdated(data.license);
        }
        if (!forcedLock) {
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: `Network error connecting to validation authority: ${msg}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to remove this license? The seat will be released and your software will revert to 60-day trial mode.")) {
      return;
    }

    setFeedback(null);
    setIsDeactivating(true);

    try {
      const res = await fetch("/api/license/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: data.message || "License removed. Reverted to 60-day trial.",
        });

        // Re-fetch status
        const statusRes = await fetch("/api/license/status");
        if (statusRes.ok) {
          const newStatus = await statusRes.json();
          onLicenseUpdated(newStatus);
        }
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Failed to remove license from registry.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: `Deactivation error: ${msg}`,
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const isCurrentPaid = status && status.type !== "TRIAL";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#080C16] border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.35)] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Selene Moon Titan glow */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <SeleneTitanLogo size="sm" glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide font-sans">
                  Selene License & Device Authority
                </h2>
                <SeleneLicenseBadge status={status} />
              </div>
              <p className="text-xs text-sky-400/80 font-serif italic">
                Cryptographic hardware node-locking & Windows Registry persistence
              </p>
            </div>
          </div>
          {!forcedLock && (
            <button
              onClick={handleClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Current Status Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active License State
              </span>
              <span className="text-xs font-mono text-indigo-400">
                Windows HKCU\Software\Selene
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Tier / Edition</div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  {status?.type === "ADMIN" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                  {status?.type === "DEV" && <Terminal className="w-3.5 h-3.5 text-purple-400" />}
                  {status?.type === "USER" && <Shield className="w-3.5 h-3.5 text-teal-400" />}
                  {status?.type === "TRIAL" && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{status?.type || "TRIAL"} EDITION</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Validity / Leeway</div>
                <div className="font-semibold text-sky-300">
                  {status?.daysRemaining && status.daysRemaining > 3000
                    ? "Perpetual / Lifetime"
                    : `${status?.daysRemaining ?? 0} days remaining`}
                </div>
              </div>
            </div>

            {/* Hardware ID (HWID) Display */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/90 border border-indigo-500/20 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400 shrink-0">Device HWID:</span>
                <span className="font-mono text-indigo-200 truncate select-all">
                  {status?.hwid || "Computing..."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHwid}
                title="Copy Hardware ID"
                className="flex items-center gap-1 px-2 py-1 ml-2 rounded bg-indigo-950/70 border border-indigo-500/40 text-[11px] text-indigo-300 hover:text-white hover:bg-indigo-900 transition-colors shrink-0"
              >
                {copiedHwid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHwid ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* If Paid License is active, show masked key and remove button */}
            {isCurrentPaid && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-xs">
                  <span className="text-slate-400">Assigned Key: </span>
                  <span className="font-mono text-slate-300 font-semibold">{status?.maskedKey}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={isDeactivating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 hover:bg-rose-900/60 hover:border-rose-400 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeactivating ? "Reverting..." : "Remove License & Revert to Trial"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in slide-in-from-top-1 ${
                feedback.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                  : "bg-rose-950/60 border-rose-500/50 text-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{feedback.message}</div>
            </div>
          )}

          {/* Enter License Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Enter License Key</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  ADM-xxxx, DEV-xxxx, or USER-xxxx
                </span>
              </div>

              <div className="relative">
                <input
                  type={revealKey ? "text" : "password"}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="e.g. ADM-XXXX-XXXX-XXXX"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setRevealKey(!revealKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  title={revealKey ? "Hide key digits" : "Reveal key digits"}
                >
                  {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Detected Tier Hint */}
              {licenseKey.length >= 3 && (
                <div className="mt-2 text-[11px]">
                  {detectedTier === "ADMIN" && (
                    <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                      <Crown className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>
                        <strong>Admin License detected:</strong> No username or password required. Your hardware HWID will be node-locked.
                      </span>
                    </div>
                  )}
                  {detectedTier === "DEV" && (
                    <div className="flex items-center gap-1.5 text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-500/30">
                      <Terminal className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>
                        <strong>Developer License detected:</strong> Please provide your registered account username and password below.
                      </span>
                    </div>
                  )}
                  {detectedTier === "USER" && (
                    <div className="flex items-center gap-1.5 text-teal-300 bg-teal-950/40 p-2 rounded-lg border border-teal-500/30">
                      <Shield className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                      <span>
                        <strong>Standard User License detected:</strong> Please enter your assigned username and password below.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Username and Password for USER and DEV tiers */}
            {isUserOrDev && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assigned Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter account username"
                    required={isUserOrDev}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={revealPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter activation password"
                      required={isUserOrDev}
                      className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealPassword(!revealPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title={revealPassword ? "Hide password" : "Show password"}
                    >
                      {revealPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !licenseKey.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? "Validating & Binding Device..." : "Activate & Bind License"}</span>
            </button>
          </form>

          {/* Support / Contact info */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-400 space-y-1">
            <p>
              Need a license or seat extension? Contact copyright holder <strong>Abhishek Mitra</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 text-sky-400">
              <a
                href="mailto:abmitra1999@gmail.com"
                className="hover:underline flex items-center gap-1"
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
    </div>
  );
}
