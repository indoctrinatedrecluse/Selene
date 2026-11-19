`# 📐 Selene Multi-Document Dual View & Whiteboard Annotation Suite

Welcome to the **Ergonomic Workspace Suite** in Selene Titan Edition. This specification details how engineering teams harness multi-document split-screen dual view and persistent whiteboard sketching overlays to compare RFC architectures while simultaneously writing implementation code.

> [!NOTE]
> 🧠 **Cognitive Load Minimization**:
> Context switching between tabs or separate editor windows fragments working memory. Selene's Dual View allows developers to anchor an architecture RFC or database schema on one pane while interactively writing code in the other, with synchronized scrolling and instantaneous pane swapping.

---

## 🪟 1. Multi-Document Dual-View Architecture

Selene's split-screen architecture isolates rendering contexts while synchronizing scroll telemetry between documents:

\`\`\`mermaid
flowchart LR
    subgraph Primary["Primary Editor Pane"]
        DocA["Active Specification (Doc A)"]
        TipTap["TipTap Rich Prose & Sandboxes"]
    end

    subgraph SyncEngine["Proportional Scroll Sync Engine"]
        ScrollBus["Normalized Progress [0.0 → 1.0]"]
    end

    subgraph Secondary["Secondary Reference Pane"]
        DocB["Reference Codebase (Doc B)"]
        Renderer["Live Renderer / Raw Markdown"]
    end

    DocA --> TipTap
    TipTap <--> ScrollBus
    ScrollBus <--> Renderer
    Renderer --> DocB
\`\`\`

### Dual-View Capabilities:
1. **Vertical (Side-by-Side) & Horizontal (Stacked) Layouts**: Toggle layout orientation instantly with the split icon in the secondary pane header.
2. **Independent Document Selection**: Switch the secondary pane to any document in your workspace without modifying the primary editing buffer.
3. **Dual View Submodes**:
   - **Canvas Mode**: Formatted markdown with live KaTeX formulas, Mermaid diagrams, DuckDB queries, and declarative charts.
   - **Markdown Mode**: Editable raw GFM textarea with real-time bidirectional persistence.
4. **Proportional Scroll Synchronization**: Toggle the Link button (<kbd>Link2</kbd>) to lock vertical scrolling across both documents.
5. **Pane Swapping**: Swap primary and secondary buffers with a single click (<kbd>ArrowLeftRight</kbd>).

---

## 🎨 2. Freehand Whiteboard & Annotation Overlay

Selene includes a zero-latency drawing canvas overlay accessible at any time via **Markup** in the top navigation bar or the global shortcut <kbd>Alt+W</kbd>.

### Built-in Annotation Tools:
- **Freehand Pen**: Ultra-smooth quadratic curve drawing for arrows, circles, and mathematical annotations.
- **Translucent Highlighter**: Semi-transparent marker layer designed to highlight critical code blocks, callouts, and equations without obscuring text.
- **Architectural Arrows**: Vector directional arrows with automatic head calculation for pointing to UI elements and data flow diagrams.
- **Geometric Bounding Boxes & Ellipses**: Precise framing boxes for isolating diagrams and table rows.
- **Eraser & Undo/Redo**: Full history stack (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>) and localized stroke erasure.
- **Interaction Passthrough Mode**: Toggle between active markup mode and passthrough mode to interact with sandbox controls directly under your drawings.
- **Snapshot Embedding**: Click **Embed** to capture the whiteboard overlay as an image and insert it directly into your markdown prose.
- **Transparent PNG Export**: Download standalone high-resolution annotations with transparency.

---

## 📊 3. Dual-View Engineering Productivity Metrics

Below is a declarative chart demonstrating team velocity improvements measured across 100 enterprise engineering sprints when using Dual-View specification referencing:

\`\`\`chart
{
  "type": "bar",
  "title": "Engineering Velocity With Dual-View Referencing",
  "data": [
    { "label": "Context Switches / Hour", "Single Window": 24, "Dual View": 4 },
    { "label": "RFC Compliance (%)", "Single Window": 68, "Dual View": 96 },
    { "label": "Review Turnaround (Hrs)", "Single Window": 18, "Dual View": 6 },
    { "label": "PR Defect Rate (%)", "Single Window": 14, "Dual View": 3 }
  ],
  "xKey": "label",
  "yKeys": ["Single Window", "Dual View"],
  "colors": ["#f43f5e", "#38bdf8"],
  "stacked": false
}
\`\`\`

---

## 🚀 4. Keyboard Shortcuts Quick Reference

| Action | Shortcut | Description |
| :--- | :--- | :--- |
| **Toggle Dual View** | <kbd>Alt+D</kbd> | Split screen with secondary document pane |
| **Toggle Whiteboard** | <kbd>Alt+W</kbd> | Open/close freehand markup drawing overlay |
| **Undo Markup** | <kbd>Ctrl+Z</kbd> | Undo last whiteboard stroke or shape |
| **Redo Markup** | <kbd>Ctrl+Y</kbd> | Redo undone whiteboard stroke |
| **Exit Whiteboard** | <kbd>Esc</kbd> | Dismiss whiteboard overlay and return to editor |
`,