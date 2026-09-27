// src/features/editor/components/editor-header.tsx
"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { detectLanguageByFilename } from "../lib/language-detector";
import { VirtualFile } from "@/types/editor.types";
import { exportWorkspaceToZip } from "@/features/snippets/lib/zip-exporter";

interface EditorHeaderProps {
  title: string;
  activeFile: VirtualFile | null;
  allFiles: VirtualFile[];
}

export function EditorHeader({
  title,
  activeFile,
  allFiles,
}: EditorHeaderProps) {
  const [copied, setCopied] = useState(false);

  const langMeta = activeFile
    ? detectLanguageByFilename(activeFile.path)
    : null;

  const handleCopyCode = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportZip = async () => {
    await exportWorkspaceToZip(title, allFiles);
  };

  return (
    <div className="h-10 bg-[#16181F] border-b border-[#232733] px-4 flex items-center justify-between">
      {/* File & Language Info */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-neutral-300">
          {activeFile ? activeFile.path : "No file open"}
        </span>

        {langMeta && (
          <span
            style={{ borderColor: `${langMeta.badgeColor}40`, color: langMeta.badgeColor }}
            className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/40 border"
          >
            {langMeta.language}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyCode}
          disabled={!activeFile}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-black/30 hover:bg-black/60 border border-white/5 rounded transition-all cursor-pointer disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        <button
          onClick={handleExportZip}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#0B0C10] font-medium bg-[#F59E0B] hover:bg-[#F59E0B]/90 rounded transition-all shadow-sm shadow-[#F59E0B]/10 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export ZIP</span>
        </button>
      </div>
    </div>
  );
}