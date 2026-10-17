"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  AlertCircle,
  Sigma,
} from "lucide-react";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) return null;

  const handleInlineMath = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (text) {
      editor.chain().focus().insertContent(`$${text}$`).run();
    } else {
      editor.chain().focus().insertContent(`$E=mc^2$`).run();
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md text-slate-300"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("bold")
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("italic")
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("strike")
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("code")
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Inline Code"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-sky-500/20 text-sky-400"
            : "hover:bg-slate-800 text-slate-300 hover:text-white"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 mx-1" />

      <button
        type="button"
        onClick={handleInlineMath}
        className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 transition-colors"
        title="Convert to Math Formula"
      >
        <Sigma className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setCallout({ type: "note" }).run()}
        className="p-1.5 rounded-lg text-sky-400 hover:bg-slate-800 transition-colors"
        title="Wrap in Callout"
      >
        <AlertCircle className="w-3.5 h-3.5" />
      </button>
    </BubbleMenu>
  );
}
