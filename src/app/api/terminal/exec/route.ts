import { NextResponse } from "next/server";
import { exec } from "child_process";
import os from "os";

// Disallowed patterns to protect container secrets and system stability
const RESTRICTED_PATTERNS = [
  /\b(env|printenv|export|set)\b/i,
  /\/proc\//i,
  /\/etc\/(shadow|passwd|group|gcp)/i,
  /\b(service-account|credentials?|token|secret)\b/i,
  /:\(\)\s*\{/i, // fork-bomb
  /\brm\s+-[rf]{1,2}\s+(\/|\*)/i, // dangerous deletions
  /\b(shutdown|reboot|halt|poweroff|init\s+0)\b/i,
  /\b(mkfs|dd\s+if=)/i,
  /\b(nc|ncat|netcat)\b.*(-e|-c|\/bin)/i, // reverse shells
  /\/dev\/tcp/i,
];

export async function POST(req: Request) {
  const startTime = performance.now();
  try {
    const body = await req.json();
    const command = (body.command || "").trim();

    if (!command) {
      return NextResponse.json({
        stdout: "",
        stderr: "No command specified",
        exitCode: 1,
        durationMs: 0,
      });
    }

    // Security Gate: Check for restricted patterns
    for (const pattern of RESTRICTED_PATTERNS) {
      if (pattern.test(command)) {
        return NextResponse.json({
          stdout: "",
          stderr: "🛡️ Security Sandbox: Command blocked. Inspection of environment secrets, process memory, or destructive operations is prohibited in the Forge of Hephaestus.",
          exitCode: 126,
          durationMs: Number((performance.now() - startTime).toFixed(1)),
        });
      }
    }

    const isWindows = os.platform() === "win32";

    // Built-in Olympian Interactive Runtimes query
    if (command === "ir list" || command === "ir" || command === "ir --list") {
      const output = [
        "🔥 Olympian Interactive Runtimes (IR Kernel Registry):",
        "  • pyodide-wasm32     (Python 3.11.9 / Pyodide WASM)        [READY]",
        "  • typst-academic     (Athena Typst Engine v0.11)           [READY]",
        "  • webr-statistical   (Apollo WebR / R 4.4 OLS Engine)      [READY]",
        "  • openscad-csg       (Daedalus 3D CSG Parametric Forge)    [READY]",
        "  • wat-wasm32         (WASM32 Text Bytecode Stack Runner)   [READY]",
        "  • glsl-webgl2        (Hydra Raymarching Shader Pipeline)   [READY]",
        "  • duckdb-wasm        (DuckDB Vectorized Columnar Engine)   [READY]",
        "  • wavedrom-timing    (WaveDrom Digital Timing Waveforms)   [READY]",
        "  • d2-diagram         (D2 Architecture Modern DAG Engine)   [READY]",
      ].join("\n");

      return NextResponse.json({
        stdout: output,
        stderr: "",
        exitCode: 0,
        durationMs: Number((performance.now() - startTime).toFixed(1)),
      });
    }

    // Help banner
    if (command === "help" || command === "--help" || command === "forge --help") {
      const output = [
        "⚡ Forge of Hephaestus — Terminal Environment",
        "Commands:",
        "  ir list                 List active Olympian Interactive Runtimes",
        "  git status              Inspect repository version control status",
        "  node -v / npm -v        Display Node.js toolchain versions",
        "  python3 --version       Display Python runtime status",
        "  dir / ls                List workspace files and directories",
        "  cat <file> / type <file> Display file contents safely",
      ].join("\n");

      return NextResponse.json({
        stdout: output,
        stderr: "",
        exitCode: 0,
        durationMs: Number((performance.now() - startTime).toFixed(1)),
      });
    }

    // Normalizing dir / ls across Linux container and Windows host
    let execCmd = command;
    if (!isWindows && command === "dir") {
      execCmd = "ls -la";
    }

    // Sanitized environment: strip all server secrets, DB connection strings, and cloud credentials
    const safeEnv: NodeJS.ProcessEnv = {
      PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
      HOME: process.env.HOME || (isWindows ? "C:\\Users\\Default" : "/root"),
      LANG: process.env.LANG || "en_US.UTF-8",
      TERM: "xterm-256color",
      NODE_ENV: "production",
      SELENE_SANDBOX: "active",
    };

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
      (resolve) => {
        exec(
          execCmd,
          {
            timeout: 10000,
            maxBuffer: 2 * 1024 * 1024,
            shell: isWindows ? "cmd.exe" : "/bin/sh",
            env: safeEnv,
          },
          (error: (Error & { code?: number }) | null, stdout: string, stderr: string) => {
            if (error) {
              resolve({
                stdout: stdout || "",
                stderr: stderr || error.message,
                exitCode: typeof error.code === "number" ? error.code : 1,
              });
            } else {
              resolve({
                stdout: stdout || "",
                stderr: stderr || "",
                exitCode: 0,
              });
            }
          }
        );
      }
    );

    const durationMs = Number((performance.now() - startTime).toFixed(1));

    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      durationMs,
    });
  } catch (err: unknown) {
    const durationMs = Number((performance.now() - startTime).toFixed(1));
    return NextResponse.json({
      stdout: "",
      stderr: err instanceof Error ? err.message : "Command execution failure",
      exitCode: 1,
      durationMs,
    });
  }
}
