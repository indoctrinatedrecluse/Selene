import { NextResponse } from "next/server";
import { exec } from "child_process";
import os from "os";

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

    // High-level simulated fallbacks for environment-agnostic commands
    const isWindows = os.platform() === "win32";

    // Handle "ir list" or "ir" (Olympian Interactive Runtimes)
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

    // Normalizing dir / ls across Linux container and Windows host
    let execCmd = command;
    if (!isWindows && command === "dir") {
      execCmd = "ls -la";
    }

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
      (resolve) => {
        exec(
          execCmd,
          {
            timeout: 15000,
            maxBuffer: 5 * 1024 * 1024,
            shell: isWindows ? "cmd.exe" : "/bin/sh",
          },
          (error, stdout, stderr) => {
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
