import { Editor, Range } from "@tiptap/core";
import {
  Sparkles,
  SquareCode,
  GitGraph,
  Sigma,
  AlertCircle,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Flame,
  LayoutTemplate,
} from "lucide-react";

export interface CommandItem {
  title: string;
  description: string;
  category: "Live Sandboxes" | "Vector & Math" | "Typography" | "Admonitions";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  command: (params: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
  // --- Live Sandboxes ---
  {
    title: "Live React Sandbox",
    description: "Interactive React + Tailwind component with live HMR",
    category: "Live Sandboxes",
    badge: "TSX",
    icon: Sparkles,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`tsx\nexport function Widget() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <div className="p-4 bg-slate-900 rounded-xl border border-sky-500/30 text-white space-y-2">\n      <h4 className="font-semibold text-sky-400">Interactive Component</h4>\n      <button\n        onClick={() => setCount(c => c + 1)}\n        className="px-3 py-1 bg-sky-500 text-xs rounded-lg font-medium hover:bg-sky-400 transition-colors"\n      >\n        Count: {count}\n      </button>\n    </div>\n  );\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Vue 3 Sandbox",
    description: "Single File Component with isolated preview",
    category: "Live Sandboxes",
    badge: "Vue",
    icon: Flame,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`vue\n<template>\n  <div class="p-4 bg-slate-900 rounded-xl border border-emerald-500/30 text-white">\n    <h3 class="text-emerald-400 font-bold">Vue 3 Live Preview</h3>\n    <p class="text-sm text-slate-300">Count: {{ count }}</p>\n    <button @click="count++" class="mt-2 px-3 py-1 bg-emerald-600 rounded text-xs font-semibold">\n      Increment\n    </button>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Vanilla HTML/CSS",
    description: "Raw HTML & Tailwind markup with instant preview",
    category: "Live Sandboxes",
    badge: "HTML",
    icon: LayoutTemplate,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`html\n<div class="p-6 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl text-white shadow-xl">\n  <h2 class="text-xl font-bold">Modern Web Canvas</h2>\n  <p class="text-sm text-sky-100 mt-1">Rendered with Tailwind runtime inside an isolated sandbox.</p>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Standard Code Block",
    description: "Syntax highlighted source code snippet",
    category: "Live Sandboxes",
    icon: SquareCode,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock({ language: "typescript" })
        .run();
    },
  },

  // --- Vector & Math ---
  {
    title: "Mermaid Diagram",
    description: "Flowcharts, sequence charts, and architectural diagrams",
    category: "Vector & Math",
    badge: "SVG",
    icon: GitGraph,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`mermaid\nflowchart TD\n    A[Client Request] --> B[API Gateway]\n    B --> C{Authentication}\n    C -->|Valid| D[Microservice Engine]\n    C -->|Invalid| E[401 Unauthorized]\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "LaTeX Math Formula",
    description: "Sub-millisecond mathematical typesetting with KaTeX",
    category: "Vector & Math",
    badge: "TeX",
    icon: Sigma,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`math\n\\oint_{\\partial \\Sigma} \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 \\left( I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt} \\right)\n\`\`\`\n`
        )
        .run();
    },
  },

  // --- Admonitions ---
  {
    title: "Note Callout",
    description: "Highlighted informational note box",
    category: "Admonitions",
    badge: "Blue",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "note" })
        .insertContent("Informational note details go here...")
        .run();
    },
  },
  {
    title: "Tip Callout",
    description: "Best practice or performance recommendation",
    category: "Admonitions",
    badge: "Green",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "tip" })
        .insertContent("Pro-tip: Utilize isolated iframes to prevent CSS bleeding.")
        .run();
    },
  },
  {
    title: "Warning Callout",
    description: "Cautionary advice or breaking changes",
    category: "Admonitions",
    badge: "Amber",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "warning" })
        .insertContent("Warning: Ensure all peer dependencies are compatible.")
        .run();
    },
  },

  // --- Typography ---
  {
    title: "Heading 1",
    description: "Large top-level document heading",
    category: "Typography",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    category: "Typography",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Sub-section heading",
    category: "Typography",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Task Checklist",
    description: "Interactive actionable to-do list",
    category: "Typography",
    icon: CheckSquare,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet List",
    description: "Unordered bulleted points",
    category: "Typography",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Sequential numbered points",
    category: "Typography",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Blockquote",
    description: "Quoted passage or callout citation",
    category: "Typography",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Visual horizontal line separator",
    category: "Typography",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];
