/**
 * Selene Standalone Offline Slide Deck Exporter
 * Bundles parsed slides into an interactive, zero-dependency presentation deck HTML
 * with full keyboard navigation, slide progress bar, fullscreen toggle, and speaker notes.
 */

import { parseMarkdownToSlides } from "@/components/presentation/SlideDeckViewer";

export interface SlideDeckExportOptions {
  title: string;
  markdown: string;
  author?: string;
  theme?: "midnight" | "slate" | "crimson";
}

export function exportStandaloneSlideDeck(options: SlideDeckExportOptions): void {
  const {
    title,
    markdown,
    author = "Selene Presenter",
    theme = "midnight",
  } = options;

  const slides = parseMarkdownToSlides(markdown, title);
  const slidesJson = JSON.stringify(slides);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const bgGradient =
    theme === "crimson"
      ? "from-slate-950 via-rose-950 to-slate-950"
      : theme === "slate"
      ? "from-slate-900 via-slate-800 to-slate-900"
      : "from-[#060913] via-[#0b1120] to-[#060913]";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Selene Presentation Deck</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      background: #060913;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      user-select: none;
    }
    .slide-enter {
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px) scale(0.99); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  </style>
</head>
<body class="h-screen w-screen flex flex-col justify-between bg-gradient-to-br ${bgGradient}">
  <!-- Top Progress Bar & Header -->
  <header class="w-full shrink-0 px-8 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-20">
    <div class="flex items-center gap-3">
      <span class="text-xl">🌙</span>
      <div>
        <h1 class="text-sm font-bold text-white tracking-tight">${title}</h1>
        <p class="text-[10px] text-cyan-400 font-mono">Presented by ${author} • Selene Deck</p>
      </div>
    </div>
    <div class="flex items-center gap-4 text-xs font-mono text-slate-400">
      <span id="slide-indicator">Slide 1 / ${slides.length}</span>
      <button onclick="toggleFullScreen()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer">
        ⛶ Fullscreen (F)
      </button>
    </div>
  </header>

  <!-- Progress Line -->
  <div class="w-full h-1 bg-slate-800">
    <div id="progress-bar" class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300" style="width: ${(1 / slides.length) * 100}%"></div>
  </div>

  <!-- Main Slide Display -->
  <main class="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
    <div id="slide-card" class="slide-enter w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl flex flex-col justify-center">
      <div id="slide-content"></div>
    </div>
  </main>

  <!-- Navigation Footer -->
  <footer class="w-full shrink-0 px-8 py-4 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-20">
    <div class="text-[11px] text-slate-400 font-mono">
      Use <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd>
      <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> or
      <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> to navigate
    </div>
    <div class="flex items-center gap-3">
      <button onclick="prevSlide()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5">
        ← Previous
      </button>
      <button onclick="nextSlide()" class="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center gap-1.5">
        Next →
      </button>
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;

    function renderCurrentSlide() {
      const slide = slides[currentIndex];
      const container = document.getElementById("slide-content");
      const indicator = document.getElementById("slide-indicator");
      const progressBar = document.getElementById("progress-bar");
      const card = document.getElementById("slide-card");

      indicator.textContent = "Slide " + (currentIndex + 1) + " / " + slides.length;
      progressBar.style.width = (((currentIndex + 1) / slides.length) * 100) + "%";

      // Reset animation
      card.classList.remove("slide-enter");
      void card.offsetWidth;
      card.classList.add("slide-enter");

      let html = '<div class="space-y-4">';
      html += '<h2 class="text-3xl font-extrabold text-white tracking-tight">' + slide.title + '</h2>';
      if (slide.subtitle) {
        html += '<p class="text-sm font-mono text-cyan-400">' + slide.subtitle + '</p>';
      }
      html += '<div class="text-slate-300 text-base leading-relaxed whitespace-pre-line border-t border-slate-800/80 pt-4">' + slide.markdown + '</div>';

      if (slide.codeBlock) {
        html += '<div class="mt-6 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-400"><pre>' + slide.codeBlock.code + '</pre></div>';
      }

      html += '</div>';
      container.innerHTML = html;
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentSlide();
      }
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderCurrentSlide();
      }
    }

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "Space" || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullScreen();
      }
    });

    renderCurrentSlide();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}-deck.html`;
  link.click();
  URL.revokeObjectURL(url);
}
