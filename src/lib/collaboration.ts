import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

/**
 * 🪐 Orbit Link — Zero-Setup P2P WebRTC Multiplayer Collaboration
 * Celestial Resonance between Apollo (Sun) and Selene (Moon)
 */

export interface CollabUser {
  name: string;
  title: string;
  color: string;
  avatar: string;
  personaId: string;
}

export interface CelestialPersona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
}

export const CELESTIAL_PERSONAS: CelestialPersona[] = [
  {
    id: "apollo",
    name: "Apollo",
    title: "Radiant God of Light & Prophecy",
    avatar: "☀️",
    color: "#f59e0b", // Amber gold
  },
  {
    id: "artemis",
    name: "Artemis",
    title: "Goddess of the Hunt & Starlight",
    avatar: "🏹",
    color: "#10b981", // Emerald
  },
  {
    id: "selene",
    name: "Selene",
    title: "Titaness of the Luminescent Moon",
    avatar: "🌙",
    color: "#38bdf8", // Sky blue
  },
  {
    id: "zeus",
    name: "Zeus",
    title: "Sovereign of the Celestial Vault",
    avatar: "⚡",
    color: "#60a5fa", // Lightning blue
  },
  {
    id: "athena",
    name: "Athena",
    title: "Goddess of Wisdom & Strategy",
    avatar: "🦉",
    color: "#818cf8", // Indigo
  },
  {
    id: "poseidon",
    name: "Poseidon",
    title: "Ruler of Oceanic Depths & Currents",
    avatar: "🌊",
    color: "#06b6d4", // Cyan
  },
  {
    id: "hephaestus",
    name: "Hephaestus",
    title: "Master of the Celestial Forge",
    avatar: "🌋",
    color: "#f97316", // Forge orange
  },
  {
    id: "aphrodite",
    name: "Aphrodite",
    title: "Goddess of Harmony & Grace",
    avatar: "🕊️",
    color: "#f43f5e", // Rose
  },
  {
    id: "hyperion",
    name: "Hyperion",
    title: "Titan of Heavenly Radiance",
    avatar: "🦅",
    color: "#eab308", // Sun gold
  },
  {
    id: "theia",
    name: "Theia",
    title: "Titaness of the Shining Ether",
    avatar: "👑",
    color: "#d946ef", // Fuchsia
  },
  {
    id: "atlas",
    name: "Atlas",
    title: "Bearer of the Celestial Spheres",
    avatar: "🪐",
    color: "#a855f7", // Violet
  },
  {
    id: "demeter",
    name: "Demeter",
    title: "Titaness of Abundance & Earth",
    avatar: "🌾",
    color: "#84cc16", // Lime
  },
];

export function getRandomUser(): CollabUser {
  const persona = CELESTIAL_PERSONAS[Math.floor(Math.random() * CELESTIAL_PERSONAS.length)];
  const randomSuffix = Math.floor(10 + Math.random() * 90);

  return {
    name: `${persona.name} #${randomSuffix}`,
    title: persona.title,
    color: persona.color,
    avatar: persona.avatar,
    personaId: persona.id,
  };
}

export function getUserFromPersona(persona: CelestialPersona): CollabUser {
  return {
    name: persona.name,
    title: persona.title,
    color: persona.color,
    avatar: persona.avatar,
    personaId: persona.id,
  };
}

export interface CollabSessionOptions {
  roomKey?: string;
  password?: string;
  user?: CollabUser;
}

export interface CollabSession {
  ydoc: Y.Doc;
  provider: WebrtcProvider;
  currentUser: CollabUser;
  roomKey: string;
}

/**
 * Generates an ephemeral Orbit room key.
 */
export function generateOrbitRoomKey(prefix = "orbit"): string {
  const pantheon = ["apollo", "artemis", "zephyr", "hermes", "chronos", "olympus"];
  const chosen = pantheon[Math.floor(Math.random() * pantheon.length)];
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${chosen}-${randNum}`;
}

/**
 * Creates or connects to an Orbit Link P2P WebRTC collaboration session.
 */
export function createCollabSession(documentId: string, options?: CollabSessionOptions): CollabSession {
  const ydoc = new Y.Doc();
  const roomKey = options?.roomKey || `selene-orbit-${documentId}`;

  const provider = new WebrtcProvider(roomKey, ydoc, {
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-eu.herokuapp.com",
      "wss://y-webrtc-signaling-us.herokuapp.com",
    ],
    password: options?.password || undefined,
  });

  const currentUser = options?.user || getRandomUser();
  provider.awareness.setLocalStateField("user", currentUser);

  return {
    ydoc,
    provider,
    currentUser,
    roomKey,
  };
}
