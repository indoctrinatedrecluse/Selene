import { NextResponse } from "next/server";
import {
  detectProjectMetadata,
  resolveFileToRoute,
} from "@/lib/project-detector";
import net from "net";

/**
 * Checks if a TCP port is currently open and accepting connections locally.
 */
function checkPortOpen(port: number, host: string = "127.0.0.1", timeoutMs: number = 400): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      status = true;
      socket.destroy();
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("close", () => {
      resolve(status);
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("filePath") || "";
    const requestedPort = searchParams.get("port");

    const metadata = detectProjectMetadata();

    // Check potential dev server ports
    const candidatePorts = requestedPort
      ? [parseInt(requestedPort, 10)]
      : [metadata.suggestedPort, 3000, 5173, 8080, 3001];

    // Remove duplicates
    const uniquePorts = Array.from(new Set(candidatePorts));

    let activePort: number | null = null;
    for (const port of uniquePorts) {
      const isOpen = await checkPortOpen(port);
      if (isOpen) {
        activePort = port;
        break;
      }
    }

    const routeInfo = filePath ? resolveFileToRoute(filePath) : null;

    return NextResponse.json({
      project: metadata,
      server: {
        isRunning: activePort !== null,
        port: activePort || metadata.suggestedPort,
        url: activePort ? `http://localhost:${activePort}` : null,
      },
      routeInfo,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "digest" in error) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to detect project status", error);
    return NextResponse.json(
      { error: "Failed to detect project status", details: message },
      { status: 500 }
    );
  }
}
