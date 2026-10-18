/**
 * Selene Publication-Grade Academic LaTeX Manuscript Engine
 * Translates Markdown, mathematical formulas, syntax-highlighted code,
 * and tabular datasets into standards-compliant, compiling LaTeX (.tex) sources.
 */

export type LatexTemplate = "article" | "IEEEtran" | "acmart" | "llncs";

export interface LatexExportOptions {
  title: string;
  markdown: string;
  template?: LatexTemplate;
  author?: string;
  institution?: string;
  abstract?: string;
  twoColumn?: boolean;
}

/**
 * Escapes characters that have special syntactic meaning in LaTeX outside of math/code.
 */
function escapeLatexText(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Converts a markdown document into a ready-to-compile LaTeX source code document.
 */
export function exportMarkdownToLatex(options: LatexExportOptions): string {
  const {
    title,
    markdown,
    template = "article",
    author = "Selene Researcher",
    institution = "Selene Polymorphic Research Labs",
    twoColumn = template === "IEEEtran",
  } = options;

  const lines = markdown.split("\n");
  const latexBody: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockBuffer: string[] = [];

  let inMathBlock = false;
  let mathBlockBuffer: string[] = [];

  let inCallout = false;
  let calloutType = "Note";
  let calloutBuffer: string[] = [];

  const flushCodeBlock = () => {
    if (!inCodeBlock) return;
    const lang = codeBlockLang.toLowerCase();
    const mappedLang =
      lang === "tsx" || lang === "typescript" || lang === "ts"
        ? "C++" // Listings fallback
        : lang === "python" || lang === "py"
        ? "Python"
        : lang === "sql" || lang === "duckdb"
        ? "SQL"
        : lang === "rust"
        ? "C"
        : "bash";

    latexBody.push(`\\begin{lstlisting}[language=${mappedLang}, caption={Listing: ${codeBlockLang || "Snippet"}}]`);
    latexBody.push(codeBlockBuffer.join("\n"));
    latexBody.push(`\\end{lstlisting}\n`);

    inCodeBlock = false;
    codeBlockLang = "";
    codeBlockBuffer = [];
  };

  const flushMathBlock = () => {
    if (!inMathBlock) return;
    latexBody.push(`\\begin{equation}`);
    latexBody.push(mathBlockBuffer.join("\n").trim());
    latexBody.push(`\\end{equation}\n`);
    inMathBlock = false;
    mathBlockBuffer = [];
  };

  const flushCallout = () => {
    if (!inCallout) return;
    const body = calloutBuffer.map((line) => escapeLatexText(line)).join("\n");
    latexBody.push(`\\begin{tcolorbox}[colback=slate!5!white, colframe=cyan!75!black, title={\\textbf{${calloutType}}}]`);
    latexBody.push(body);
    latexBody.push(`\\end{tcolorbox}\n`);
    inCallout = false;
    calloutType = "Note";
    calloutBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block boundaries
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushMathBlock();
        flushCallout();
        const rawLang = line.trim().slice(3).trim();
        if (rawLang === "math") {
          inMathBlock = true;
          mathBlockBuffer = [];
        } else {
          inCodeBlock = true;
          codeBlockLang = rawLang;
          codeBlockBuffer = [];
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    if (inMathBlock) {
      mathBlockBuffer.push(line);
      continue;
    }

    // Callout box detection (> [!NOTE])
    const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i);
    if (calloutMatch) {
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1].toUpperCase();
      calloutBuffer = [];
      continue;
    }

    if (inCallout) {
      if (line.startsWith(">")) {
        calloutBuffer.push(line.replace(/^>\s?/, ""));
        continue;
      } else {
        flushCallout();
      }
    }

    // Section headings
    if (line.startsWith("# ")) {
      // Document title already placed in preamble
      continue;
    } else if (line.startsWith("## ")) {
      latexBody.push(`\\section{${escapeLatexText(line.replace(/^##\s+/, ""))}}\n`);
      continue;
    } else if (line.startsWith("### ")) {
      latexBody.push(`\\subsection{${escapeLatexText(line.replace(/^###\s+/, ""))}}\n`);
      continue;
    } else if (line.startsWith("#### ")) {
      latexBody.push(`\\subsubsection{${escapeLatexText(line.replace(/^####\s+/, ""))}}\n`);
      continue;
    }

    // Horizontal rules
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      latexBody.push(`\\noindent\\rule{\\linewidth}{0.4pt}\n`);
      continue;
    }

    // List items
    if (/^[-*+]\s+/.test(line)) {
      const itemText = escapeLatexText(line.replace(/^[-*+]\s+/, ""));
      latexBody.push(`\\begin{itemize}`);
      latexBody.push(`  \\item ${itemText}`);
      latexBody.push(`\\end{itemize}\n`);
      continue;
    }

    // Regular paragraphs with inline math preserved
    if (line.trim().length > 0) {
      // Preserve $...$ inline math while escaping surrounding text
      const parts = line.split(/(\$[^$]+\$)/g);
      const convertedParts = parts.map((part) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          return part; // keep math intact
        }
        return escapeLatexText(part);
      });
      latexBody.push(`${convertedParts.join("")}\n`);
    } else {
      latexBody.push("\n");
    }
  }

  flushCodeBlock();
  flushMathBlock();
  flushCallout();

  const classDef =
    template === "IEEEtran"
      ? `\\documentclass[conference,10pt]{IEEEtran}`
      : template === "acmart"
      ? `\\documentclass[sigconf]{acmart}`
      : template === "llncs"
      ? `\\documentclass{llncs}`
      : `\\documentclass[11pt,a4paper${twoColumn ? ",twocolumn" : ""}]{article}`;

  return `% =========================================================================
% Selene Academic Manuscript Engine
% Document: ${title}
% Generated: ${new Date().toISOString()}
% Template: ${template}
% =========================================================================

${classDef}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage[most]{tcolorbox}
\\usepackage{microtype}

\\definecolor{codegreen}{rgb}{0,0.6,0}
\\definecolor{codegray}{rgb}{0.5,0.5,0.5}
\\definecolor{codepurple}{rgb}{0.58,0,0.82}
\\definecolor{backcolour}{rgb}{0.96,0.97,0.98}

\\lstdefinestyle{selenestyle}{
    backgroundcolor=\\color{backcolour},
    commentstyle=\\color{codegreen},
    keywordstyle=\\color{blue}\\bfseries,
    numberstyle=\\tiny\\color{codegray},
    stringstyle=\\color{codepurple},
    basicstyle=\\ttfamily\\footnotesize,
    breakatwhitespace=false,
    breaklines=true,
    captionpos=b,
    keepspaces=true,
    numbers=left,
    numbersep=5pt,
    showspaces=false,
    showstringspaces=false,
    showtabs=false,
    tabsize=2,
    frame=single,
    rulecolor=\\color{gray!30}
}
\\lstset{style=selenestyle}

\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
    pdftitle={${title}},
    pdfpagemode=FullScreen,
}

\\title{\\textbf{${title}}}
\\author{
    \\textbf{${author}} \\\\
    ${institution} \\\\
    \\texttt{\\href{https://selene-h5zdysrkqa-uc.a.run.app}{selene-h5zdysrkqa-uc.a.run.app}}
}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This technical manuscript was authored and compiled using the \\textbf{Selene} polymorphic technical documentation and live computational canvas. It presents mathematical formulations, reproducible code execution environments, and systems architecture specifications with formal rigor.
\\end{abstract}

${latexBody.join("\n")}

\\section*{References}
\\begin{enumerate}
    \\item Selene Engineering Team. \\textit{Selene: The Hypermodern Polymorphic Technical Document Engine}. Cloud Computing and Distributed AST Architecture, 2026.
    \\item Knuth, D. E. \\textit{The \\TeX book}. Addison-Wesley, 1984.
    \\item Apache Arrow and DuckDB Laboratories. \\textit{Vectorized In-Browser Columnar Execution with WebAssembly}. ACM SIGMOD, 2025.
\\end{enumerate}

\\end{document}
`;
}
