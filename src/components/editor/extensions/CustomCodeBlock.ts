import CodeBlock, { CodeBlockOptions } from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { LiveCodeBlockView } from "./LiveCodeBlockView";

export const CustomCodeBlock = CodeBlock.extend<CodeBlockOptions>({
  addNodeView() {
    return ReactNodeViewRenderer(LiveCodeBlockView);
  },
});
