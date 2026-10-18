"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SharedDocumentReader } from "@/components/share/SharedDocumentReader";
import { Lock, KeyRound, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";

interface SharedDocData {
  id: string;
  title: string;
  contentMarkdown?: string;
  author?: string;
  viewCount?: number;
  createdAt?: number;
  expiresAt?: number | null;
  isPasswordProtected?: boolean;
}

export function SharePageClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState<SharedDocData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const url = new URL(`/api/share/${id}`, window.location.origin);
        const res = await fetch(url.toString());

        if (!active) return;

        if (res.status === 410) {
          setIsExpired(true);
          setLoading(false);
          return;
        }

        if (res.status === 401) {
          const data = await res.json();
          if (!active) return;
          setDocData(data);
          setIsLocked(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          if (!active) return;
          setError(data.error || "Failed to load document");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!active) return;
        setDocData(data);
        setIsLocked(false);
        setLoading(false);
      } catch (err: unknown) {
        if (!active) return;
        console.error("Failed to load shared document", err);
        setError("Network error while connecting to Selene Cloud");
        setLoading(false);
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, [id]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    try {
      setUnlocking(true);
      setPasswordError(null);

      const pwd = passwordInput.trim();
      const url = new URL(`/api/share/${id}`, window.location.origin);
      url.searchParams.set("password", pwd);

      const res = await fetch(url.toString(), {
        headers: { "x-share-password": pwd },
      });

      if (res.status === 410) {
        setIsExpired(true);
        setUnlocking(false);
        return;
      }

      if (res.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        setUnlocking(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setPasswordError(data.error || "Failed to unlock document");
        setUnlocking(false);
        return;
      }

      const data = await res.json();
      setDocData(data);
      setIsLocked(false);
    } catch (err: unknown) {
      console.error("Failed to unlock document", err);
      setPasswordError("Network error while verifying passphrase");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a14] flex flex-col items-center justify-center text-slate-300 gap-4">
        <SeleneTitanLogo className="w-12 h-12 animate-pulse" />
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Decrypting Selene Cloud Document...</span>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#070a14] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Share Link Expired</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This document had an expiration policy set by its author and is no longer accessible via this link.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Go to Selene Home
          </Link>
        </div>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen bg-[#070a14] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Document Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "The shared document you are looking for does not exist or has been deleted."}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Launch Selene Canvas
          </Link>
        </div>
      </div>
    );
  }

  // Password Lock Screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#070a14] flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-600/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Password Protected Document
            </h2>
            <p className="text-xs text-slate-400">
              &ldquo;{docData.title}&rdquo; requires an access passphrase to view.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Passphrase</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter access passphrase..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                autoFocus
              />
              {passwordError && (
                <p className="text-[11px] text-red-400 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={unlocking}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{unlocking ? "Verifying..." : "Unlock Document"}</span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Protected by Selene Cryptographic Attestation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SharedDocumentReader
      id={docData.id}
      title={docData.title}
      contentMarkdown={docData.contentMarkdown || ""}
      author={docData.author}
      viewCount={docData.viewCount}
      createdAt={docData.createdAt}
      isEmbed={isEmbed}
    />
  );
}
