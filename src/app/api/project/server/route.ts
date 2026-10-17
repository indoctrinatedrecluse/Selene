import { NextResponse } from "next/server";
import { spawn, ChildProcess } from "child_process";
import { detectProjectMetadata } from "@/lib/project-detector";

// In-memory process handle for background server managed by Selene
let activeServerProcess: ChildProcess | null = null;
let serverLogs: string[] = [];

export async function GET() {
  return NextResponse.json({
    hasManagedProcess: activeServerProcess !== null && !activeServerProcess.killed,
    pid: activeServerProcess?.pid || null,
    logs: serverLogs.slice(-30),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "start";

    if (action === "stop") {
      if (activeServerProcess && !activeServerProcess.killed) {
        activeServerProcess.kill();
        activeServerProcess = null;
        serverLogs.push("[Selene] Background dev server stopped by user.");
      }
      return NextResponse.json({ success: true, message: "Dev server stopped." });
    }

    if (action === "start") {
      if (activeServerProcess && !activeServerProcess.killed) {
        return NextResponse.json({
          success: true,
          message: "Dev server is already running.",
          pid: activeServerProcess.pid,
        });
      }

      const meta = detectProjectMetadata();

      if (meta.jsFramework === "flutter") {
        const flutterCmd = process.platform === "win32" ? "flutter.bat" : "flutter";
        serverLogs = [`[Selene] Spawning 'flutter run -d web-server --web-port=${meta.suggestedPort}' in background...`];
        activeServerProcess = spawn(
          flutterCmd,
          ["run", "-d", "web-server", `--web-port=${meta.suggestedPort}`],
          {
            cwd: process.cwd(),
            shell: true,
            env: { ...process.env },
          }
        );
      } else {
        const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
        serverLogs = [`[Selene] Spawning '${meta.packageManager} run dev' in background...`];
        activeServerProcess = spawn(npmCmd, ["run", "dev"], {
          cwd: process.cwd(),
          shell: true,
          env: { ...process.env, PORT: String(meta.suggestedPort) },
        });
      }

      activeServerProcess.stdout?.on("data", (chunk) => {
        const line = chunk.toString().trim();
        if (line) {
          serverLogs.push(line);
          if (serverLogs.length > 100) serverLogs.shift();
        }
      });

      activeServerProcess.stderr?.on("data", (chunk) => {
        const line = chunk.toString().trim();
        if (line) {
          serverLogs.push(`[stderr] ${line}`);
          if (serverLogs.length > 100) serverLogs.shift();
        }
      });

      activeServerProcess.on("exit", (code) => {
        serverLogs.push(`[Selene] Dev server process exited with code ${code}.`);
        activeServerProcess = null;
      });

      return NextResponse.json({
        success: true,
        message: "Background dev server launched.",
        pid: activeServerProcess.pid,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to manage project server", error);
    return NextResponse.json(
      { error: "Failed to manage project server", details: message },
      { status: 500 }
    );
  }
}
