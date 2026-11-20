"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  RefreshCw,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  checkForAppUpdates,
  detectUserPlatform,
  formatByteSize,
  UpdateCheckResult,
} from "@/lib/services/update-checker";
import { APP_VERSION, APP_EDITION } from "@/lib/version";

interface SeleneUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCheckOnOpen?: boolean;
}

export const SeleneUpdateModal: React.FC<SeleneUpdateModalProps> = ({
  isOpen,
  onClose,
  autoCheckOnOpen = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [userPlatform] = useState<"windows" | "macos" | "linux" | "android" | "other">(() =>
    detectUserPlatform()
  );

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checkForAppUpdates();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && autoCheckOnOpen && !result) {
      checkForAppUpdates().then((data) => {
        if (!isCancelled) {
          setResult(data);
          setLoading(false);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, autoCheckOnOpen, result]);

  if (!isOpen) return null;

  const recommendedAsset = result?.assets.find((a) => a.platform === userPlatform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-[#0B1021] to-[#070A14] border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Celestial Branding */}
        <div className="relative px-6 py-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Hermes Celestial Herald
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  AUTO-UPDATER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-serif italic">
                Pan-Hellenic Release Oracle & Distribution Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runCheck}
              disabled={loading}
              title="Check again"
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Consulting Mount Olympus Release Oracle...
              </p>
              <p className="text-xs text-slate-500">
                Checking GitHub releases for newer celestial epochs.
              </p>
            </div>
          ) : result?.updateAvailable ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      <Sparkles className="w-3 h-3" /> New Epoch Available
                    </span>
                    <span className="text-xs text-slate-400">
                      Published {new Date(result.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {result.releaseName || `Release ${result.releaseTag}`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span>Installed: v{result.currentVersion}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">Latest: v{result.latestVersion}</span>
                  </div>
                </div>

                {recommendedAsset && (
                  <a
                    href={recommendedAsset.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download for {userPlatform.toUpperCase()}</span>
                  </a>
                )}
              </div>
            </div>
          ) : result && !result.error ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Your Canvas is Up to Date
                  </h4>
                  <p className="text-xs text-slate-400">
                    You are running {APP_EDITION} v{APP_VERSION}. Attuned to the latest constellation.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-900/40 text-emerald-300 border border-emerald-500/20">
                v{APP_VERSION}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-300">
                {result?.error || "Unable to retrieve release metadata. Check your network connection."}
              </div>
            </div>
          )}

          {/* Release Notes Preview */}
          {result?.releaseNotes && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Release Notes & Constellation Changes</span>
                </div>
                {result.releaseUrl && (
                  <a
                    href={result.releaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed selection:bg-cyan-500/30">
                {result.releaseNotes}
              </div>
            </div>
          )}

          {/* All Platform Packages Available */}
          {result && result.assets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>Downloadable Distribution Packages</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.assets.map((asset) => {
                  const isMatch = asset.platform === userPlatform;
                  return (
                    <a
                      key={asset.name}
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-between p-3 rounded-lg border transition text-xs ${
                        isMatch
                          ? "bg-cyan-950/40 border-cyan-500/50 hover:bg-cyan-900/40 text-cyan-200"
                          : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Download className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                        <span className="truncate font-mono">{asset.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatByteSize(asset.size)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically attested GitHub distribution suite</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
