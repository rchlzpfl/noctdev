// src/features/editor/components/file-tree.tsx
"use client";

import { useState, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Upload,
  FolderUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { VirtualFile, VirtualFolder, VirtualTree } from "@/types/editor.types";
import { detectLanguageByFilename } from "../lib/language-detector";

interface FileTreeProps {
  tree: VirtualTree;
  activeFileId: string | null;
  onSelectFile: (file: VirtualFile) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (fileId: string) => void;
  onUploadFiles?: (files: { path: string; code: string; language: string }[]) => Promise<void> | void;
}

const IGNORED_PATHS = ["node_modules", ".git", ".DS_Store", "Thumbs.db"];
const BINARY_EXTS = [
  "png", "jpg", "jpeg", "gif", "ico", "pdf", "zip", "tar", "gz", "exe", "bin", "woff", "woff2", "ttf"
];

export function FileTree({
  tree,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onUploadFiles,
}: FileTreeProps) {
  const [creatingTarget, setCreatingTarget] = useState<{
    parentPath: string;
    type: "file" | "folder";
  } | null>(null);
  const [inlineName, setInlineName] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Hidden Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleStartInlineCreate = (parentPath: string, type: "file" | "folder") => {
    if (parentPath) {
      setCollapsedFolders((prev) => ({ ...prev, [`folder-${parentPath}`]: false }));
    }
    setCreatingTarget({ parentPath, type });
    setInlineName("");
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !creatingTarget) return;

    const trimmed = inlineName.trim().replace(/\\/g, "/");
    const parent = creatingTarget.parentPath;

    if (creatingTarget.type === "file") {
      const fullPath = parent ? `${parent}/${trimmed}` : trimmed;
      onAddFile(fullPath);
    } else {
      const fullPath = parent ? `${parent}/${trimmed}/.gitkeep` : `${trimmed}/.gitkeep`;
      onAddFile(fullPath);
    }

    setCreatingTarget(null);
    setInlineName("");
  };

  // Fixed: Snapshots the FileList, reads all files in parallel, normalizes Windows slashes
  const processUploadedFiles = async (fileList: File[]) => {
    if (!onUploadFiles || fileList.length === 0) return;

    setIsProcessingUpload(true);
    try {
      const filesToUpload: { path: string; code: string; language: string }[] = [];

      await Promise.all(
        fileList.map(async (file) => {
          // Normalize Windows backslashes
          const rawPath = file.webkitRelativePath || file.name;
          const relativePath = rawPath.replace(/\\/g, "/").replace(/^\/+/, "");

          if (IGNORED_PATHS.some((p) => relativePath.includes(p))) return;

          const ext = relativePath.split(".").pop()?.toLowerCase() || "";
          if (BINARY_EXTS.includes(ext)) return;

          try {
            const text = await file.text();
            const lang = detectLanguageByFilename(relativePath);
            filesToUpload.push({
              path: relativePath,
              code: text,
              language: lang.monacoLang,
            });
          } catch (err) {
            console.warn(`Skipping unreadable file: ${relativePath}`, err);
          }
        })
      );

      if (filesToUpload.length > 0) {
        await onUploadFiles(filesToUpload);
      }
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    // Snapshot into memory array first before clearing input
    const filesArray = Array.from(e.target.files);
    e.target.value = ""; // Safe to clear now
    await processUploadedFiles(filesArray);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      await processUploadedFiles(filesArray);
    }
  };

  const renderFolder = (folder: VirtualFolder, depth = 0) => {
    const isCollapsed = collapsedFolders[folder.id];
    const isTargetOfCreation = creatingTarget && creatingTarget.parentPath === folder.path;

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => toggleFolder(folder.id)}
          style={{ paddingLeft: `${depth * 12 + 10}px` }}
          className="flex items-center justify-between py-1 px-2 text-xs text-neutral-300 hover:bg-[#16181F] cursor-pointer rounded transition-colors group"
        >
          <div className="flex items-center gap-1.5 truncate">
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            )}
            {isCollapsed ? (
              <Folder className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            ) : (
              <FolderOpen className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartInlineCreate(folder.path, "file");
              }}
              className="p-0.5 hover:text-white text-neutral-400 cursor-pointer"
              title="New File inside this folder"
            >
              <FilePlus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartInlineCreate(folder.path, "folder");
              }}
              className="p-0.5 hover:text-white text-neutral-400 cursor-pointer"
              title="New Subfolder inside this folder"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div>
            {folder.folders.map((sub) => renderFolder(sub, depth + 1))}
            {folder.files.map((file) => renderFile(file, depth + 1))}

            {isTargetOfCreation && (
              <form
                onSubmit={handleInlineSubmit}
                style={{ paddingLeft: `${(depth + 1) * 12 + 16}px` }}
                className="py-1 pr-2"
              >
                <div className="flex items-center gap-1.5 bg-[#0B0C10] border border-[#F59E0B] rounded px-2 py-0.5">
                  {creatingTarget.type === "file" ? (
                    <FileCode className="w-3 h-3 text-[#38BDF8] shrink-0" />
                  ) : (
                    <Folder className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  )}
                  <input
                    type="text"
                    autoFocus
                    value={inlineName}
                    placeholder={creatingTarget.type === "file" ? "file.ts" : "folder-name"}
                    onChange={(e) => setInlineName(e.target.value)}
                    onBlur={() => {
                      if (!inlineName.trim()) setCreatingTarget(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCreatingTarget(null);
                    }}
                    className="w-full text-[11px] font-mono bg-transparent outline-none text-[#F6F6F8] placeholder:text-neutral-600"
                  />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file: VirtualFile, depth = 0) => {
    if (file.name === ".gitkeep") return null;

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
            setItemToDelete({ id: file.id, name: file.name });
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity cursor-pointer"
          title="Delete file"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`w-60 bg-[#0B0C10] border-r border-[#232733] flex flex-col h-full shrink-0 relative select-none transition-all ${
          isDraggingOver ? "bg-[#16181F] ring-2 ring-[#F59E0B]" : ""
        }`}
      >
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#0B0C10]/95 z-30 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-[#F59E0B] pointer-events-none">
            <Upload className="w-8 h-8 text-[#F59E0B] animate-bounce mb-2" />
            <span className="text-xs font-mono text-[#F6F6F8] font-bold">Drop files or folder</span>
            <span className="text-[10px] text-neutral-400 mt-1">Direct upload to vault</span>
          </div>
        )}

        {isProcessingUpload && (
          <div className="absolute inset-0 bg-[#0B0C10]/80 z-30 flex flex-col items-center justify-center p-4 text-center">
            <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin mb-2" />
            <span className="text-xs font-mono text-neutral-300">Importing workspace files...</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="h-9 px-3 border-b border-[#232733] flex items-center justify-between text-neutral-400 select-none">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 font-mono">
            Files
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStartInlineCreate("", "file")}
              className="p-1 rounded hover:bg-[#16181F] text-neutral-400 hover:text-[#F6F6F8] transition-colors cursor-pointer"
              title="New File at Root"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleStartInlineCreate("", "folder")}
              className="p-1 rounded hover:bg-[#16181F] text-neutral-400 hover:text-[#F6F6F8] transition-colors cursor-pointer"
              title="New Folder at Root"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-[#16181F] text-neutral-400 hover:text-[#F6F6F8] transition-colors cursor-pointer"
              title="Upload File(s)"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="p-1 rounded hover:bg-[#16181F] text-neutral-400 hover:text-[#F6F6F8] transition-colors cursor-pointer"
              title="Upload Entire Folder"
            >
              <FolderUp className="w-3.5 h-3.5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />

            <input
              type="file"
              ref={folderInputRef}
              {...({ webkitdirectory: "", directory: "" } as any)}
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {tree.folders.map((f) => renderFolder(f, 0))}
          {tree.files.map((f) => renderFile(f, 0))}

          {creatingTarget && creatingTarget.parentPath === "" && (
            <form onSubmit={handleInlineSubmit} className="py-1 px-2">
              <div className="flex items-center gap-1.5 bg-[#0B0C10] border border-[#F59E0B] rounded px-2 py-0.5">
                {creatingTarget.type === "file" ? (
                  <FileCode className="w-3 h-3 text-[#38BDF8] shrink-0" />
                ) : (
                  <Folder className="w-3 h-3 text-[#F59E0B] shrink-0" />
                )}
                <input
                  type="text"
                  autoFocus
                  value={inlineName}
                  placeholder={creatingTarget.type === "file" ? "filename.ts" : "folder-name"}
                  onChange={(e) => setInlineName(e.target.value)}
                  onBlur={() => {
                    if (!inlineName.trim()) setCreatingTarget(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setCreatingTarget(null);
                  }}
                  className="w-full text-[11px] font-mono bg-transparent outline-none text-[#F6F6F8] placeholder:text-neutral-600"
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#16181F] border border-[#232733] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F6F6F8]">Delete File</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Are you sure you want to delete <span className="font-mono text-white">{itemToDelete.name}</span>?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232733]">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteFile(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}