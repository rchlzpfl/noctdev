"use client";

import { useState, useMemo } from "react";
import { VirtualFile } from "@/types/editor.types";
import { buildVirtualTree } from "@/features/editor/lib/path-tree";
import { FileTree } from "@/features/editor/components/file-tree";
import { TabBar } from "@/features/editor/components/tab-bar";
import { MonacoEditor } from "@/features/editor/components/monaco-editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { Terminal, Shield } from "lucide-react";
import Link from "next/link";

interface PublicSnippetViewerProps {
  snippetTitle: string;
  snippetDescription: string | null;
  author: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  files: VirtualFile[];
}

export default function PublicSnippetViewer({
  snippetTitle,
  snippetDescription,
  author,
  files,
}: PublicSnippetViewerProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(
    files.length > 0 ? files[0].id : null
  );
  const [openTabs, setOpenTabs] = useState(
    files.length > 0
      ? [
          {
            fileId: files[0].id,
            path: files[0].path,
            name: files[0].name,
            language: files[0].language,
          },
        ]
      : []
  );

  const tree = useMemo(() => buildVirtualTree(files), [files]);
  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) || null,
    [files, activeFileId]
  );

  const handleSelectFile = (file: VirtualFile) => {
    setActiveFileId(file.id);
    if (!openTabs.some((t) => t.fileId === file.id)) {
      setOpenTabs((prev) => [
        ...prev,
        { fileId: file.id, path: file.path, name: file.name, language: file.language },
      ]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextTabs = openTabs.filter((t) => t.fileId !== fileId);
    setOpenTabs(nextTabs);
    if (activeFileId === fileId && nextTabs.length > 0) {
      setActiveFileId(nextTabs[nextTabs.length - 1].fileId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col text-[#F6F6F8]">
      {/* Public Header */}
      <header className="h-14 border-b border-[#232733] bg-[#0B0C10] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/login" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16181F] border border-white/5 text-[#F59E0B]">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">NOCTDEV</span>
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-xs text-neutral-400 font-mono">
            @{author?.username || "developer"}
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-xs font-semibold text-[#F6F6F8] truncate max-w-xs" title={snippetDescription || undefined}>
            {snippetTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16181F] border border-white/5 text-[11px] font-mono text-neutral-400">
            <Shield className="w-3 h-3 text-[#38BDF8]" />
            <span>Read-Only Preview</span>
          </div>
          <Link
            href="/login"
            className="px-3 py-1 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 transition-colors"
          >
            Fork to Vault
          </Link>
        </div>
      </header>

      {/* Editor Main */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
        <FileTree
          tree={tree}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onAddFile={() => {}}
          onDeleteFile={() => {}}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-[#0B0C10]">
          <TabBar
            openTabs={openTabs}
            activeFileId={activeFileId}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
          />
          <EditorHeader
            title={snippetTitle}
            activeFile={activeFile}
            allFiles={files}
          />
          <div className="flex-1 min-h-0">
            {activeFile ? (
              <MonacoEditor
                code={activeFile.content}
                language={activeFile.language}
                onChange={() => {}}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                Select a file from the sidebar to inspect code
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Allows both `import PublicSnippetViewer` and `import { PublicSnippetViewer }`
export { PublicSnippetViewer };