"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { CommandItem } from "./commands";

export interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandList = forwardRef<
  SlashCommandListRef,
  SlashCommandListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) =>
          prev <= 0 ? props.items.length - 1 : prev - 1
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev >= props.items.length - 1 ? 0 : prev + 1
        );
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  if (props.items.length === 0) {
    return (
      <div className="p-3 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        No matching commands found.
      </div>
    );
  }

  return (
    <div className="z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-md">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Insert Blocks & Sandboxes
      </div>
      <div className="space-y-0.5">
        {props.items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg transition-all ${
                isSelected
                  ? "bg-sky-500/15 text-sky-200 border border-sky-500/30"
                  : "text-slate-300 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div
                className={`p-1.5 rounded-md ${
                  isSelected
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 font-mono text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";
