# 🪐 Orbit Link (Celestial Harmony) Zero-Setup P2P WebRTC Collaboration Showcase

Selene now features **🪐 Orbit Link**, a serverless, zero-setup, real-time multiplayer co-editing engine powered by **WebRTC**, **Yjs Conflict-Free Replicated Data Types (CRDTs)**, and **Pantheon Celestial Personas**!

Named in honor of the celestial orbital resonance between **Apollo** (the Radiant Sun) and **Selene** (the Luminous Moon), Orbit Link enables multiple developers, architects, and researchers to co-edit technical prose, run live code sandboxes, and inspect AST nodes concurrently without deploying or paying for centralized collaboration servers.

> [!NOTE]
> 🏛️ **Mythological Heritage**:
> In ancient Greek astronomy and cosmology, Apollo and Selene move in timeless orbital harmony across the celestial spheres, illuminating the world in perfect synchrony. Orbit Link brings that harmony to technical authoring: real-time peer-to-peer data channels keep collaborators' state vectors seamlessly aligned.

---

## ⚡ 1. How Orbit Link Works

1. **Direct P2P DataChannels (Zero-Server Architecture)**:
   - Orbit Link creates direct WebRTC mesh connections between browsers using distributed public STUN/signaling relays.
   - Once connected, document changes, cursor positions, and selections travel directly peer-to-peer over encrypted UDP with sub-millisecond local latency.

2. **Yjs State Vector CRDTs**:
   - Conflicts resolve deterministically with Lamport clocks and fractional indices.
   - Offline edits merge automatically without loss of keystrokes upon rejoining the orbit mesh.

3. **12 Greek Pantheon Personas**:
   - Choose your celestial persona with a distinct avatar, title, and color badge:
     - ☀️ **Apollo** (Radiant God of Light & Prophecy)
     - 🏹 **Artemis** (Goddess of the Hunt & Starlight)
     - 🌙 **Selene** (Titaness of the Luminescent Moon)
     - ⚡ **Zeus** (Sovereign of the Celestial Vault)
     - 🦉 **Athena** (Goddess of Wisdom & Strategy)
     - 🌊 **Poseidon** (Ruler of Oceanic Depths & Currents)
     - 🌋 **Hephaestus** (Master of the Celestial Forge)
     - 🕊️ **Aphrodite** (Goddess of Harmony & Grace)
     - 🦅 **Hyperion** (Titan of Heavenly Radiance)
     - 👑 **Theia** (Titaness of the Shining Ether)
     - 🪐 **Atlas** (Bearer of the Celestial Spheres)
     - 🌾 **Demeter** (Titaness of Abundance & Earth)

4. **End-to-End Encryption (E2EE)**:
   - Provide an optional room password to encrypt all WebRTC data packets symmetrically with AES-GCM before transmission.

---

## ⚡ 2. How to Start an Orbit Link Session

1. In the top navigation bar, click the **Orbit Link** button (`🪐 Orbit Link`).
2. Pick your **Celestial Persona** from the Pantheon grid (e.g., Apollo or Athena).
3. Click **Engage Orbit Link**.
4. Click **Copy Link** to share your ephemeral room URL (e.g. `https://selene.app/?orbit=orbit-apollo-4821`).
5. As teammates open the link, their astral avatars appear in your **Astral Presence Roster** and remote cursor flags sync live!

---

## ⚡ 3. Live Specimen for Multiplayer Co-Editing

Below is a live interactive React component demonstrating orbital velocity calculations. When co-editing via Orbit Link, multiple developers can inspect and modify component parameters simultaneously:

```tsx
import React, { useState } from "react";

export function OrbitalResonanceCalculator() {
  const [altitudeKm, setAltitudeKm] = useState(384400); // Lunar Orbit
  const [velocityKmS, setVelocityKmS] = useState(1.022); // Lunar orbital velocity

  return (
    <div className="p-6 max-w-lg mx-auto bg-slate-900 border border-sky-500/30 rounded-2xl text-slate-100 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪐</span>
          <h3 className="font-bold text-sky-400">Apollo-Selene Resonance</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
          ORBITAL CRDT SYNC
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">SEPARATION DISTANCE</span>
          <span className="text-base font-bold text-sky-300">{altitudeKm.toLocaleString()} km</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">ORBITAL SPEED</span>
          <span className="text-base font-bold text-emerald-400">{velocityKmS} km/s</span>
        </div>
      </div>

      <button
        onClick={() => {
          setAltitudeKm((a) => a + 500);
          setVelocityKmS((v) => Number((v * 0.9995).toFixed(4)));
        }}
        className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/25 transition-all"
      >
        Simulate Orbital Perturbation (+500 km)
      </button>
    </div>
  );
}
```

---

## 🚀 Key Orbit Link Capabilities in Selene

- **100% Serverless**: No hosted collaboration backends or cloud database dependencies required.
- **AES-GCM WebRTC Encryption**: Optional passphrases ensure private, encrypted peer communications.
- **Live Peer Telemetry**: Real-time awareness displays connected peer latency, avatar call-signs, and network state.
- **Full Offline Tolerance**: Work disconnected and synchronize automatically upon reconnecting to the orbit room.
