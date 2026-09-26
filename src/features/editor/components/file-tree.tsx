// src/features/editor/components/file-tree.tsx
"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { VirtualFile, VirtualFolder, VirtualTree } from "@/types/editor.types";

interface FileTreeProps {
  tree: VirtualTree;
  activeFileId: string | null;
  onSelectFile: (file: VirtualFile) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FileTree({
  tree,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
}: FileTreeProps) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    onAddFile(newFilePath.trim());
    setNewFilePath("");
    setIsCreatingFile(false);
  };

  const renderFolder = (folder: VirtualFolder, depth = 0) => {
    const isCollapsed = collapsedFolders[folder.id];

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => toggleFolder(folder.id)}
          style={{ paddingLeft: `${depth * 12 + 10}px` }}
          className="flex items-center gap-1.5 py-1 px-2 text-xs text-neutral-300 hover:bg-[#16181F] cursor-pointer rounded transition-colors group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          )}
          {isCollapsed ? (
            <Folder className="w-3.5 h-3.5 text-[#F59E0B]" />
          ) : (
            <FolderOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
          )}
          <span className="truncate">{folder.name}</span>
        </div>

        {!isCollapsed && (
          <div>
            {folder.folders.map((sub) => renderFolder(sub, depth + 1))}
            {folder.files.map((file) => renderFile(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file: VirtualFile, depth = 0) => {
    const isActive = file.id === activeFileId;

    return (
      <div
        key={file.id}
        onClick={() => onSelectFile(file)}
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
        className={`group flex items-center justify-between py-1 px-2 text-xs cursor-pointer rounded transition-colors select-none ${
          isActive
            ? "bg-[#16181F] text-[#F6F6F8] font-medium border-l-2 border-[#F59E0B]"
            : "text-neutral-400 hover:bg-[#16181F]/50 hover:text-neutral-200"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-[#38BDF8]" : "text-neutral-500"}`} />
          <span className="truncate font-mono text-[11px]">{file.name}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFile(file.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity"
          title="Delete file"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-60 bg-[#0B0C10] border-r border-[#232733] flex flex-col h-full shrink-0">
      {/* Workspace Header & Action Buttons */}
      <div className="h-9 px-3 border-b border-[#232733] flex items-center justify-between text-neutral-400">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            className="p-1 rounded hover:bg-[#16181F] text-neutral-400 hover:text-[#F6F6F8] transition-colors"
            title="New File (e.g. src/auth/route.ts)"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New File Inline Input */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-[#232733]">
          <input
            type="text"
            autoFocus
            placeholder="path/to/file.ts"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            onBlur={() => {
              if (!newFilePath.trim()) setIsCreatingFile(false);
            }}
            className="w-full px-2 py-1 text-xs bg-[#16181F] border border-[#F59E0B]/50 rounded text-[#F6F6F8] outline-none font-mono placeholder:text-neutral-600"
          />
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {tree.folders.map((f) => renderFolder(f, 0))}
        {tree.files.map((f) => renderFile(f, 0))}
      </div>
    </div>
  );
}