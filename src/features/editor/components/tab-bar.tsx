// src/features/editor/components/tab-bar.tsx
"use client";

import { X } from "lucide-react";
import { EditorTab } from "@/types/editor.types";

interface TabBarProps {
  openTabs: EditorTab[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
}

export function TabBar({
  openTabs,
  activeFileId,
  onSelectTab,
  onCloseTab,
}: TabBarProps) {
  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto bg-[#0B0C10] border-b border-[#232733] select-none scrollbar-none h-9">
      {openTabs.map((tab) => {
        const isActive = tab.fileId === activeFileId;

        return (
          <div
            key={tab.fileId}
            onClick={() => onSelectTab(tab.fileId)}
            className={`group flex items-center gap-2 px-3.5 h-full text-xs cursor-pointer border-r border-[#232733] transition-colors shrink-0 ${
              isActive
                ? "bg-[#16181F] text-[#F6F6F8] border-t-2 border-t-[#F59E0B]"
                : "text-neutral-400 hover:bg-[#16181F]/40 hover:text-neutral-200"
            }`}
          >
            <span className="font-mono text-[11px]">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.fileId);
              }}
              className="p-0.5 rounded hover:bg-white/10 text-neutral-500 hover:text-neutral-200 opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}