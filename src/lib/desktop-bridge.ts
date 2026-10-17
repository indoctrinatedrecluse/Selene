/**
 * Selene Universal Desktop Bridge
 * Unifies Desktop (Tauri v2 & Electron) and Browser File System Access API
 * into a single high-performance API for native file open, save, and system integration.
 */

export interface DesktopDocumentResult {
  fileName: string;
  content: string;
  filePath?: string;
}

export interface DesktopSaveResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  error?: string;
}

export type DesktopRuntime = "tauri" | "electron" | "web";

interface SeleneElectronBridge {
  isDesktop: boolean;
  runtime: "electron";
  platform: string;
  openFileDialog: () => Promise<DesktopDocumentResult | null>;
  saveFileDialog: (
    content: string,
    defaultName?: string
  ) => Promise<DesktopSaveResult | null>;
  getSystemInfo: () => Promise<Record<string, unknown>>;
  onMenuCommand: (
    callback: (command: string, payload?: unknown) => void
  ) => () => void;
}

interface WindowWithDesktop extends Window {
  seleneDesktop?: SeleneElectronBridge;
  __TAURI__?: Record<string, unknown>;
  __TAURI_INTERNALS__?: Record<string, unknown>;
}

/**
 * Checks if the current app is running inside a native desktop shell (Electron or Tauri).
 */
export function isDesktopRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as WindowWithDesktop;
  return Boolean(win.seleneDesktop?.isDesktop || win.__TAURI__ || win.__TAURI_INTERNALS__);
}

/**
 * Detects the current desktop runtime environment.
 */
export function getDesktopRuntime(): DesktopRuntime {
  if (typeof window === "undefined") return "web";
  const win = window as WindowWithDesktop;
  if (win.seleneDesktop?.isDesktop) return "electron";
  if (win.__TAURI__ || win.__TAURI_INTERNALS__) return "tauri";
  return "web";
}

/**
 * Opens a local document (.md, .selene, .txt) from disk using native dialogs.
 */
export async function openLocalDocument(): Promise<DesktopDocumentResult | null> {
  if (typeof window === "undefined") return null;
  const win = window as WindowWithDesktop;

  // 1. Electron Runtime
  if (win.seleneDesktop?.openFileDialog) {
    try {
      return await win.seleneDesktop.openFileDialog();
    } catch (err) {
      console.error("Electron open dialog failed:", err);
    }
  }

  // 2. Tauri Runtime
  if (win.__TAURI__ || win.__TAURI_INTERNALS__) {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { readTextFile } = await import("@tauri-apps/plugin-fs");

      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          { name: "Markdown / Selene", extensions: ["md", "markdown", "selene", "txt"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!selected) return null;
      const filePath = typeof selected === "string" ? selected : selected;
      const content = await readTextFile(filePath);
      const fileName = filePath.split(/[/\\]/).pop() || "document.md";

      return { fileName, content, filePath };
    } catch (err) {
      console.warn("Tauri open dialog fallback:", err);
    }
  }

  // 3. Web File System Access API (Chromium / Edge / Opera)
  const windowWithPicker = window as unknown as {
    showOpenFilePicker?: (options?: unknown) => Promise<Array<{
      name: string;
      getFile: () => Promise<File>;
    }>>;
  };

  if (typeof windowWithPicker.showOpenFilePicker === "function") {
    try {
      const [handle] = await windowWithPicker.showOpenFilePicker({
        types: [
          {
            description: "Markdown / Selene Documents",
            accept: {
              "text/markdown": [".md", ".markdown"],
              "text/plain": [".txt", ".selene"],
            },
          },
        ],
        multiple: false,
      });

      if (!handle) return null;
      const file = await handle.getFile();
      const content = await file.text();
      return { fileName: file.name, content };
    } catch (err: unknown) {
      // AbortError indicates user clicked cancel
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      console.warn("File System Access API aborted or failed:", err);
    }
  }

  // 4. Legacy File Input fallback (Safari / Firefox / Mobile)
  return new Promise<DesktopDocumentResult | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.selene,.txt,text/plain,text/markdown";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const content = await file.text();
        resolve({ fileName: file.name, content });
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

/**
 * Saves document content directly to local disk using native save dialogs.
 */
export async function saveLocalDocument(
  content: string,
  suggestedName = "document.md"
): Promise<DesktopSaveResult | null> {
  if (typeof window === "undefined") return null;
  const win = window as WindowWithDesktop;

  // 1. Electron Runtime
  if (win.seleneDesktop?.saveFileDialog) {
    try {
      return await win.seleneDesktop.saveFileDialog(content, suggestedName);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  // 2. Tauri Runtime
  if (win.__TAURI__ || win.__TAURI_INTERNALS__) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");

      const filePath = await save({
        defaultPath: suggestedName,
        filters: [
          { name: "Markdown Document", extensions: ["md"] },
          { name: "Selene Document", extensions: ["selene"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!filePath) return null;

      await writeTextFile(filePath, content);
      const fileName = filePath.split(/[/\\]/).pop() || suggestedName;
      return { success: true, filePath, fileName };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  // 3. Web File System Access API (Save file)
  const windowWithSavePicker = window as unknown as {
    showSaveFilePicker?: (options?: unknown) => Promise<{
      name: string;
      createWritable: () => Promise<{
        write: (data: string) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (typeof windowWithSavePicker.showSaveFilePicker === "function") {
    try {
      const handle = await windowWithSavePicker.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: "Markdown Document",
            accept: { "text/markdown": [".md"] },
          },
        ],
      });

      if (!handle) return null;
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return { success: true, fileName: handle.name };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      console.warn("Save File System Access API aborted or failed:", err);
    }
  }

  // 4. Browser Blob download fallback
  try {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = suggestedName;
    anchor.click();
    URL.revokeObjectURL(url);
    return { success: true, fileName: suggestedName };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Registers native menu listeners for desktop shells.
 */
export function registerDesktopMenuListener(
  handler: (command: string, payload?: unknown) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const win = window as WindowWithDesktop;

  if (win.seleneDesktop?.onMenuCommand) {
    return win.seleneDesktop.onMenuCommand(handler);
  }

  return () => {};
}
