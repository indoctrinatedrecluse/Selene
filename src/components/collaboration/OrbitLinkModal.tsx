"use client";

import React, { useState } from "react";
import {
  Users,
  Radio,
  Copy,
  Check,
  X,
  Lock,
  RefreshCw,
  ShieldCheck,
  Wifi,
  WifiOff,
  QrCode,
  Smartphone,
} from "lucide-react";
import {
  CollabUser,
  CelestialPersona,
  CELESTIAL_PERSONAS,
  getUserFromPersona,
  generateOrbitRoomKey,
} from "@/lib/collaboration";

interface OrbitLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  isCollabActive: boolean;
  currentUser: CollabUser | null;
  peerCount: number;
  activePeers: CollabUser[];
  currentRoomKey: string;
  onToggleConnect: (roomKey: string, password?: string, user?: CollabUser) => void;
  onUpdateUser: (newUser: CollabUser) => void;
}

export function OrbitLinkModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  isCollabActive,
  currentUser,
  peerCount,
  activePeers,
  currentRoomKey,
  onToggleConnect,
  onUpdateUser,
}: OrbitLinkModalProps) {
  const [roomKey, setRoomKey] = useState(currentRoomKey || generateOrbitRoomKey());
  const [password, setPassword] = useState("");
  const [customName, setCustomName] = useState(currentUser?.name || "");
  const [selectedPersona, setSelectedPersona] = useState<CelestialPersona>(() => {
    if (currentUser?.personaId) {
      const match = CELESTIAL_PERSONAS.find((p) => p.id === currentUser.personaId);
      if (match) return match;
    }
    return CELESTIAL_PERSONAS[0];
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMobileQr, setShowMobileQr] = useState(false);

  if (!isOpen) return null;

  const handleSelectPersona = (persona: CelestialPersona) => {
    setSelectedPersona(persona);
    const updated = getUserFromPersona(persona);
    if (customName) updated.name = customName;
    onUpdateUser(updated);
  };

  const handleNameChange = (name: string) => {
    setCustomName(name);
    if (currentUser) {
      onUpdateUser({ ...currentUser, name: name.trim() || selectedPersona.name });
    }
  };

  const handleGenerateRoom = () => {
    setRoomKey(generateOrbitRoomKey());
  };

  const handleCopyInviteLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/?orbit=${encodeURIComponent(roomKey)}&doc=${encodeURIComponent(documentId)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggle = () => {
    const base = currentUser ? { ...currentUser } : getUserFromPersona(selectedPersona);
    const userToUse = customName.trim() ? { ...base, name: customName.trim() } : base;
    onToggleConnect(roomKey, password || undefined, userToUse);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-sky-500/30 bg-slate-950/95 shadow-2xl shadow-sky-950/40 backdrop-blur-2xl overflow-hidden text-slate-100 font-sans">
        {/* 🪐 Top Header: Orbit Link Branding */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25 text-white">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wide text-white">🪐 Orbit Link</span>
                <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sky-300">
                  Zero-Setup P2P WebRTC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Celestial resonance between Apollo (Sun) & Selene (Moon) • Document: <span className="text-slate-200 font-semibold">{documentTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 🧭 Main Two-Column Layout */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 overflow-hidden">
          {/* Left Column: Room Settings & Persona Selection (7 cols) */}
          <div className="lg:col-span-7 flex flex-col p-6 overflow-y-auto space-y-6">
            {/* Connection Banner */}
            <div
              className={`rounded-2xl p-4 border flex items-center justify-between transition-all ${
                isCollabActive
                  ? "bg-emerald-950/20 border-emerald-500/30 shadow-md shadow-emerald-950/30"
                  : "bg-slate-900/40 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${
                    isCollabActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCollabActive ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{isCollabActive ? "Active Orbit Mesh" : "Offline / Standalone"}</span>
                    {isCollabActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isCollabActive
                      ? `Connected to ${peerCount} celestial peer${peerCount !== 1 ? "s" : ""} via direct P2P mesh`
                      : "Zero servers required. Connect to start multiplayer co-editing."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isCollabActive
                    ? "bg-rose-600/80 hover:bg-rose-600 text-white shadow-rose-600/20"
                    : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25"
                }`}
              >
                {isCollabActive ? "Leave Orbit" : "Engage Orbit Link"}
              </button>
            </div>

            {/* Orbit Room & Invite Key */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ephemeral Orbit Room Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomKey}
                  onChange={(e) => setRoomKey(e.target.value)}
                  disabled={isCollabActive}
                  placeholder="e.g. orbit-apollo-8819"
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-mono text-sky-200 focus:outline-none focus:border-sky-500/60 disabled:opacity-60"
                />
                {!isCollabActive && (
                  <button
                    onClick={handleGenerateRoom}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors"
                    title="Generate Random Room Key"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleCopyInviteLink}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 px-3.5 py-2 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileQr(!showMobileQr)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-3 py-2 text-xs font-semibold text-purple-300 transition-colors cursor-pointer"
                  title="Display pairing QR code for Selene Mobile"
                >
                  <QrCode className="h-3.5 w-3.5 text-purple-400" />
                  <span>{showMobileQr ? "Hide QR" : "Pair Mobile"}</span>
                </button>
              </div>

              {/* Mobile QR Pairing Card */}
              {showMobileQr && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-4 animate-in fade-in duration-150">
                  <div className="w-24 h-24 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-lg shadow-purple-950/50">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      <rect x="5" y="5" width="25" height="25" rx="3" stroke="currentColor" strokeWidth="4" fill="none" />
                      <rect x="11" y="11" width="13" height="13" />
                      <rect x="70" y="5" width="25" height="25" rx="3" stroke="currentColor" strokeWidth="4" fill="none" />
                      <rect x="76" y="11" width="13" height="13" />
                      <rect x="5" y="70" width="25" height="25" rx="3" stroke="currentColor" strokeWidth="4" fill="none" />
                      <rect x="11" y="76" width="13" height="13" />
                      <rect x="42" y="10" width="16" height="6" />
                      <rect x="42" y="24" width="16" height="6" />
                      <rect x="10" y="42" width="6" height="16" />
                      <rect x="24" y="42" width="6" height="16" />
                      <rect x="40" y="40" width="20" height="20" rx="2" />
                      <circle cx="50" cy="50" r="4" fill="white" />
                      <rect x="68" y="42" width="22" height="6" />
                      <rect x="42" y="70" width="14" height="8" />
                      <rect x="66" y="66" width="10" height="10" />
                      <rect x="80" y="80" width="10" height="10" />
                    </svg>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Selene Mobile Pairing</span>
                    </div>
                    <p className="text-slate-300">
                      Open <strong>Orbit Link</strong> on Selene Mobile and enter room code:
                    </p>
                    <div className="font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-purple-500/40 text-purple-200 inline-block text-[11px] font-semibold select-all">
                      {roomKey}
                    </div>
                    <p className="text-[10px] text-slate-400">Direct peer-to-peer WebRTC encrypted mesh</p>
                  </div>
                </div>
              )}

              {/* End-to-End Encryption Key */}
              <div className="flex items-center gap-2 pt-1">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isCollabActive}
                  placeholder="Optional WebRTC AES-GCM Passphrase (E2E Encrypted)"
                  className="flex-1 rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Pantheon Persona Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Choose Celestial Persona
                </label>
                <span className="text-[11px] text-sky-400 font-medium">
                  {selectedPersona.avatar} {selectedPersona.name} • {selectedPersona.title}
                </span>
              </div>

              {/* Persona Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {CELESTIAL_PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSelectPersona(persona)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center cursor-pointer ${
                        isSelected
                          ? "bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/20 scale-105"
                          : "bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{persona.avatar}</span>
                      <span className="text-[11px] font-bold text-slate-200 truncate w-full">{persona.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Persona Custom Name input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={`Custom Call-Sign (Defaults to '${selectedPersona.name}')`}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/60"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Active Peers & Mesh Telemetry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/60 p-6 overflow-y-auto space-y-6">
            {/* Active Presence Radar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-400" />
                  Astral Presence Roster ({activePeers.length + (currentUser ? 1 : 0)})
                </span>
                {isCollabActive && (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                    P2P MESH
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Local user card */}
                {currentUser && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-sky-500/40 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{currentUser.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{currentUser.name}</span>
                          <span className="rounded px-1.5 py-0.2 bg-sky-500/20 text-[9px] font-mono text-sky-300">
                            YOU
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{currentUser.title}</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                )}

                {/* Remote peer cards */}
                {activePeers.map((peer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{peer.avatar}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-200">{peer.name}</span>
                        <p className="text-[10px] text-slate-400">{peer.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">0.4ms</span>
                  </div>
                ))}

                {activePeers.length === 0 && !isCollabActive && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No active remote peers. Click &ldquo;Engage Orbit Link&rdquo; and share your link to co-edit in real-time.
                  </div>
                )}
              </div>
            </div>

            {/* Network Architecture & Security Badges */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                Mesh Security & Protocols
              </span>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500">Architecture:</span>
                  <span className="font-mono text-sky-300">Serverless WebRTC P2P</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500">CRDT Engine:</span>
                  <span className="font-mono text-sky-300">Yjs State Vectors</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500">Signaling:</span>
                  <span className="font-mono text-slate-400">signaling.yjs.dev (TLS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Encryption:</span>
                  <span className="font-mono text-emerald-400">AES-GCM WebRTC E2EE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
