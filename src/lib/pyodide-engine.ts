/**
 * Selene In-Browser Pyodide WebAssembly Python Kernel
 * Provides client-side Python execution without server dependencies:
 * - Dynamic WASM runtime loading from CDN
 * - Automatic package detection & loading (NumPy, Pandas, Matplotlib, SciPy, etc.)
 * - Stdout / stderr capture
 * - Direct Matplotlib figure extraction to base64 PNG
 * - Pandas DataFrame HTML rendering
 */

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  result?: string;
  htmlOutput?: string;
  plotImage?: string; // base64 data URL
  execTimeMs: number;
  isError: boolean;
  error?: string;
}

export type PyodideStatus = "unloaded" | "loading" | "ready" | "error";

export interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  toJs?: () => unknown;
}

interface PyodideGlobal {
  loadPyodide?: (options: {
    indexURL: string;
    stdout?: (text: string) => void;
    stderr?: (text: string) => void;
  }) => Promise<PyodideInterface>;
  pyodideInstance?: PyodideInterface;
  pyodideLoadingPromise?: Promise<PyodideInterface>;
}

const PYODIDE_CDN_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const PYODIDE_SCRIPT_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";

/**
 * Loads the Pyodide WebAssembly instance (singleton).
 */
export async function getOrLoadPyodide(
  onProgress?: (msg: string) => void
): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide WASM can only execute in browser environments.");
  }

  const win = window as unknown as PyodideGlobal;

  // Already initialized
  if (win.pyodideInstance) {
    return win.pyodideInstance;
  }

  // Already loading
  if (win.pyodideLoadingPromise) {
    return win.pyodideLoadingPromise;
  }

  win.pyodideLoadingPromise = (async () => {
    onProgress?.("Downloading WebAssembly Python binary...");

    // 1. Inject script if not present
    if (!win.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${PYODIDE_SCRIPT_URL}"]`);
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", (e) => reject(e));
          return;
        }

        const script = document.createElement("script");
        script.src = PYODIDE_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) =>
          reject(new Error(`Failed to load Pyodide script from CDN: ${err}`));
        document.head.appendChild(script);
      });
    }

    onProgress?.("Initializing Python 3.12 WebAssembly Virtual Machine...");

    if (!win.loadPyodide) {
      throw new Error("Pyodide loader function not found on window object.");
    }

    const pyodide = await win.loadPyodide({
      indexURL: PYODIDE_CDN_URL,
    });

    onProgress?.("Configuring Matplotlib & headless graphics pipeline...");

    // Pre-configure matplotlib headless Agg backend
    await pyodide.runPythonAsync(`
import sys
import io
import os

# Prevent Matplotlib from attempting GUI windows
os.environ['MPLBACKEND'] = 'Agg'
`);

    win.pyodideInstance = pyodide;
    return pyodide;
  })();

  try {
    const instance = await win.pyodideLoadingPromise;
    return instance;
  } catch (err) {
    win.pyodideLoadingPromise = undefined;
    throw err;
  }
}

/**
 * Runs Python code client-side via Pyodide WebAssembly.
 */
export async function executePythonCode(
  code: string,
  onProgress?: (msg: string) => void
): Promise<PythonExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await getOrLoadPyodide(onProgress);

    onProgress?.("Analyzing code imports & fetching packages...");
    // Automatically load packages used in the code (e.g., numpy, pandas, matplotlib)
    try {
      await pyodide.loadPackagesFromImports(code);
    } catch (pkgErr) {
      console.warn("Could not auto-load packages from imports:", pkgErr);
    }

    onProgress?.("Executing computational Python cell...");

    // Wrapper script to capture stdout, stderr, matplotlib plots, and dataframe HTML
    const wrappedRunner = `
import sys
import io
import base64

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr

sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

_plot_b64 = None
_html_result = None
_raw_result = None

try:
    # Check if matplotlib is available
    _has_plt = False
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        # Set dark theme styling for Selene
        plt.style.use('dark_background')
        plt.rcParams['figure.facecolor'] = '#090d16'
        plt.rcParams['axes.facecolor'] = '#0f172a'
        plt.rcParams['axes.edgecolor'] = '#1e293b'
        plt.rcParams['text.color'] = '#e2e8f0'
        plt.rcParams['axes.labelcolor'] = '#94a3b8'
        plt.rcParams['xtick.color'] = '#64748b'
        plt.rcParams['ytick.color'] = '#64748b'
        plt.rcParams['grid.color'] = '#1e293b'
        _has_plt = True
    except Exception:
        pass

    # Execute user code in globals namespace
    _user_globals = globals()
    _user_locals = locals()
    
    # Execute user code
    exec(${JSON.stringify(code)}, _user_globals)

    # Capture any Matplotlib plots created
    if _has_plt and len(plt.get_fignums()) > 0:
        _img_buf = io.BytesIO()
        plt.savefig(_img_buf, format='png', bbox_inches='tight', dpi=140, facecolor='#090d16', edgecolor='none')
        plt.close('all')
        _img_buf.seek(0)
        _plot_b64 = "data:image/png;base64," + base64.b64encode(_img_buf.read()).decode('utf-8')

except Exception as _e:
    import traceback
    traceback.print_exc(file=_stderr_buffer)

finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr

_captured_stdout = _stdout_buffer.getvalue()
_captured_stderr = _stderr_buffer.getvalue()

{
    "stdout": _captured_stdout,
    "stderr": _captured_stderr,
    "plot": _plot_b64,
}
`;

    const rawPyResult = (await pyodide.runPythonAsync(wrappedRunner)) as
      | { toJs?: () => unknown; get?: (key: string) => unknown; [key: string]: unknown }
      | undefined;
    const jsResult = (
      typeof rawPyResult?.toJs === "function" ? rawPyResult.toJs() : rawPyResult
    ) as { get?: (key: string) => unknown; [key: string]: unknown } | undefined;

    // Convert Map or object
    const stdout = jsResult?.get ? jsResult.get("stdout") || "" : jsResult?.["stdout"] || "";
    const stderr = jsResult?.get ? jsResult.get("stderr") || "" : jsResult?.["stderr"] || "";
    const plot = jsResult?.get ? jsResult.get("plot") || undefined : jsResult?.["plot"] || undefined;

    const execTimeMs = Math.round(performance.now() - startTime);

    return {
      stdout: String(stdout),
      stderr: String(stderr),
      plotImage: plot ? String(plot) : undefined,
      execTimeMs,
      isError: stderr.toString().length > 0 && !stdout && !plot,
      error: stderr.toString().length > 0 && !stdout && !plot ? String(stderr) : undefined,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const execTimeMs = Math.round(performance.now() - startTime);
    return {
      stdout: "",
      stderr: errorMsg,
      execTimeMs,
      isError: true,
      error: errorMsg,
    };
  }
}
