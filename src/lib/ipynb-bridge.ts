/**
 * 🪐 Selene Bi-directional Jupyter Notebook (.ipynb) Bridge
 * Enables 1-click import and export between Selene Technical Markdown Canvases
 * and standard Jupyter Notebook v4 format (compatible with Google Colab, JupyterLab, VS Code, Kaggle).
 */

export interface IpynbCellOutput {
  output_type: string;
  name?: string;
  text?: string | string[];
  data?: {
    "text/plain"?: string | string[];
    "image/png"?: string;
    "text/html"?: string | string[];
  };
  traceback?: string[];
}

export interface IpynbCell {
  cell_type: "markdown" | "code" | "raw";
  metadata: Record<string, unknown>;
  source: string | string[];
  execution_count?: number | null;
  outputs?: IpynbCellOutput[];
}

export interface IpynbNotebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: {
    kernelspec?: {
      display_name: string;
      language: string;
      name: string;
    };
    language_info?: {
      name: string;
      version?: string;
    };
  };
  cells: IpynbCell[];
}

export interface ParseNotebookResult {
  markdown: string;
  title: string;
  cellCount: number;
  codeCellCount: number;
  kernelName: string;
}

/**
 * Parses raw .ipynb JSON into a structured Selene Technical Markdown canvas string.
 */
export function parseIpynbToMarkdown(ipynbContent: string, fallbackTitle = "Imported Notebook"): ParseNotebookResult {
  try {
    const notebook: IpynbNotebook = JSON.parse(ipynbContent);
    const kernelName = notebook.metadata?.kernelspec?.display_name || "Python 3 (ipykernel)";
    let title = fallbackTitle;
    let codeCellCount = 0;

    const markdownBlocks: string[] = [];

    // Add Notebook Header Metadata Banner
    markdownBlocks.push(`<!-- 🪐 Selene Jupyter Notebook Import -->\n`);

    for (const cell of notebook.cells || []) {
      const sourceText = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";

      if (cell.cell_type === "markdown") {
        // Detect potential document title in first H1
        const h1Match = sourceText.match(/^#\s+(.+)$/m);
        if (h1Match && title === fallbackTitle) {
          title = h1Match[1].trim();
        }
        markdownBlocks.push(sourceText.trim());
      } else if (cell.cell_type === "code") {
        codeCellCount++;
        const lang = notebook.metadata?.language_info?.name || "python";

        // Append the live execution code block
        markdownBlocks.push(`\`\`\`${lang}\n${sourceText.trim()}\n\`\`\``);

        // Process outputs (plots, images, and text outputs)
        if (cell.outputs && cell.outputs.length > 0) {
          for (const out of cell.outputs) {
            // 1. Base64 Rendered Images (Matplotlib, Seaborn, Plotly)
            if (out.data && out.data["image/png"]) {
              const base64Data = typeof out.data["image/png"] === "string" ? out.data["image/png"] : "";
              if (base64Data) {
                markdownBlocks.push(
                  `\n![Jupyter Cell Output](data:image/png;base64,${base64Data.trim()})\n`
                );
              }
            }

            // 2. Stream / stdout text output
            let outputText = "";
            if (out.text) {
              outputText = Array.isArray(out.text) ? out.text.join("") : out.text;
            } else if (out.data && out.data["text/plain"]) {
              outputText = Array.isArray(out.data["text/plain"])
                ? out.data["text/plain"].join("")
                : out.data["text/plain"];
            }

            if (outputText && outputText.trim()) {
              // Wrap stream output nicely
              markdownBlocks.push(
                `> 📊 **Output [${cell.execution_count ?? codeCellCount}]**:\n> \`\`\`text\n${outputText
                  .trim()
                  .split("\n")
                  .map((l) => `> ${l}`)
                  .join("\n")}\n> \`\`\``
              );
            }
          }
        }
      }
    }

    return {
      markdown: markdownBlocks.join("\n\n"),
      title,
      cellCount: notebook.cells?.length || 0,
      codeCellCount,
      kernelName,
    };
  } catch (err: unknown) {
    throw new Error(
      `Failed to parse Jupyter Notebook: ${err instanceof Error ? err.message : "Malformed JSON"}`
    );
  }
}

/**
 * Converts a Selene Markdown document into a valid, standard Jupyter Notebook JSON string.
 */
export function exportMarkdownToIpynb(markdownContent: string, title: string): string {
  const cells: IpynbCell[] = [];

  // Regex to match code blocks ```[lang]\n[code]\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let executionCount = 1;

  while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
    const textBefore = markdownContent.substring(lastIndex, match.index).trim();
    if (textBefore) {
      cells.push({
        cell_type: "markdown",
        metadata: {},
        source: textBefore.split("\n").map((line, idx, arr) => (idx < arr.length - 1 ? `${line}\n` : line)),
      });
    }

    const lang = (match[1] || "").toLowerCase();
    const code = match[2] || "";

    // If it's a Python or computational cell, emit as executable code cell
    if (lang === "python" || lang === "py" || lang === "notebook" || lang === "duckdb" || lang === "") {
      cells.push({
        cell_type: "code",
        execution_count: executionCount++,
        metadata: {
          language: lang || "python",
        },
        outputs: [],
        source: code.split("\n").map((line, idx, arr) => (idx < arr.length - 1 ? `${line}\n` : line)),
      });
    } else {
      // Other blocks (tsx, rust, mermaid, chart) are kept as markdown code fences
      cells.push({
        cell_type: "markdown",
        metadata: {},
        source: [`\`\`\`${lang}\n`, ...code.split("\n").map((l) => `${l}\n`), "```\n"],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Trailing markdown text after the last code block
  const remainingText = markdownContent.substring(lastIndex).trim();
  if (remainingText) {
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: remainingText.split("\n").map((line, idx, arr) => (idx < arr.length - 1 ? `${line}\n` : line)),
    });
  }

  // If no cells were generated, generate a fallback markdown cell
  if (cells.length === 0) {
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: [`# ${title}\n`, "\n", markdownContent],
    });
  }

  const notebook: IpynbNotebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3 (ipykernel)",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.11.0",
      },
    },
    cells,
  };

  return JSON.stringify(notebook, null, 2);
}
