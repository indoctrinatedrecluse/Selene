`# 🚀 Publishing, Cloud Sharing & Academic LaTeX Export

Welcome to the **Selene Publishing & Sharing Ecosystem**! Selene is engineered not just for authoring technical documents, but for distributing them across the world with mathematical fidelity, zero dependencies, and multi-format versatility.

> [!NOTE]
> 🌐 **Multi-Channel Publishing Suite**:
> - **Selene Cloud Share & Gists**: Instant public or passphrase-protected short links (\`/share/[id]\`) hosted on Google Cloud Run with view counters, optional expiration timers, and scannable mobile QR codes.
> - **Zero-Dependency Standalone HTML**: Bundles the entire document, Tailwind styling, KaTeX fonts, Mermaid SVGs, and interactive sandboxes into a self-contained portable HTML file that runs 100% offline.
> - **Publication-Grade Academic LaTeX**: Generates ready-to-compile \`.tex\` manuscripts conforming to IEEE, ACM, and Springer LNCS specifications.
> - **Static Site Generator (SSG) Export**: Formats markdown and frontmatter metadata specifically tailored for Hugo, Astro Starlight, Nextra, and Docusaurus 3.
> - **Interactive Presentation Decks**: Export standalone offline slide decks with full keyboard navigation and speaker notes.

---

## 📐 1. Formal Mathematical Formulation

Equations and theorems typeset in LaTeX math syntax with sub-millisecond precision:

\`\`\`math
\\oint_{\\partial \\Omega} \\mathbf{E} \\cdot d\\mathbf{l} = -\\frac{\\partial}{\\partial t} \\iint_{\\Omega} \\mathbf{B} \\cdot d\\mathbf{A} \\quad \\Longleftrightarrow \\quad \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}
\`\`\`

---

## 📊 2. Embedded Declarative Visualization

Interactive charts compile to crisp scalable vector graphics (SVG) with zero external script dependencies:

\`\`\`chart
{
  "type": "line",
  "title": "Global Edge Content Delivery Latency",
  "description": "99th percentile round-trip time (RTT in ms) across distribution regions",
  "xKey": "region",
  "yKey": ["cdn_edge", "origin_direct"],
  "colors": ["#38bdf8", "#f43f5e"],
  "data": [
    { "region": "North America", "cdn_edge": 12.4, "origin_direct": 68.2 },
    { "region": "Europe West", "cdn_edge": 14.8, "origin_direct": 74.5 },
    { "region": "Asia Pacific", "cdn_edge": 18.2, "origin_direct": 112.0 },
    { "region": "Latin America", "cdn_edge": 22.5, "origin_direct": 135.4 },
    { "region": "Oceania", "cdn_edge": 19.1, "origin_direct": 128.6 }
  ]
}
\`\`\`

---

## 🖼️ 3. Public Responsive \`<iframe>\` Embeds

To embed this live document canvas into your blog, documentation portal, or Notion page:

\`\`\`html
<!-- Selene Responsive Canvas Embed -->
<iframe
  src="https://selene-h5zdysrkqa-uc.a.run.app/share/preview?embed=true&theme=dark"
  width="100%"
  height="650px"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25);"
  allow="clipboard-write; fullscreen"
  loading="lazy"
></iframe>
\`\`\`

---

## ⚡ 4. 1-Click Multi-Format Export

Open the **Publish & Export Suite** in the top navigation bar to export this document in any format:
1. **Publication PDF**: Clean white paper or lunar dark palette with print-optimized pagination.
2. **Academic LaTeX**: Download clean \`.tex\` source ready for Overleaf, TeX Live, or ArXiv submission.
3. **SSG Markdown**: 1-click export for Hugo, Astro, Nextra, or Docusaurus with framework-tailored frontmatter.
4. **Jupyter Notebook**: Standard \`.ipynb\` JSON compatible with Google Colab and VS Code.
5. **Standalone HTML**: 100% portable single-file web application with offline runtimes.
`,