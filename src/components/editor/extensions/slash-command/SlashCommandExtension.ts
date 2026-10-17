import { Extension, Editor, Range } from "@tiptap/core";
import Suggestion, {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SLASH_COMMANDS, CommandItem } from "./commands";
import {
  SlashCommandList,
  SlashCommandListRef,
} from "./SlashCommandList";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions<CommandItem>>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          if (!query) return SLASH_COMMANDS;
          const lower = query.toLowerCase();
          return SLASH_COMMANDS.filter(
            (item) =>
              item.title.toLowerCase().includes(lower) ||
              item.description.toLowerCase().includes(lower) ||
              item.category.toLowerCase().includes(lower)
          );
        },
        render: () => {
          let component: ReactRenderer<SlashCommandListRef> | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props: SuggestionProps<CommandItem>) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props: SuggestionProps<CommandItem>) {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }

              return component?.ref?.onKeyDown(props) || false;
            },

            onExit() {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
