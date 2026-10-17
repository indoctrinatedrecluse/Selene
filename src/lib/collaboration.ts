import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

export interface CollabUser {
  name: string;
  color: string;
  avatar: string;
}

const COLLAB_COLORS = [
  "#38bdf8", // Sky
  "#818cf8", // Indigo
  "#34d399", // Emerald
  "#f472b6", // Pink
  "#fbbf24", // Amber
  "#a78bfa", // Violet
];

const ANIMAL_AVATARS = ["🦊", "🐼", "🦁", "🐨", "🦉", "🐙", "🦄", "🚀"];

export function getRandomUser(): CollabUser {
  const index = Math.floor(Math.random() * COLLAB_COLORS.length);
  const avatarIndex = Math.floor(Math.random() * ANIMAL_AVATARS.length);
  const randomNum = Math.floor(100 + Math.random() * 900);

  return {
    name: `Dev #${randomNum}`,
    color: COLLAB_COLORS[index],
    avatar: ANIMAL_AVATARS[avatarIndex],
  };
}

export interface CollabSession {
  ydoc: Y.Doc;
  provider: WebrtcProvider;
  currentUser: CollabUser;
}

export function createCollabSession(documentId: string): CollabSession {
  const ydoc = new Y.Doc();
  const roomName = `selene-collab-v1-${documentId}`;

  const provider = new WebrtcProvider(roomName, ydoc, {
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-eu.herokuapp.com",
      "wss://y-webrtc-signaling-us.herokuapp.com",
    ],
  });

  const currentUser = getRandomUser();
  provider.awareness.setLocalStateField("user", currentUser);

  return {
    ydoc,
    provider,
    currentUser,
  };
}
