// src/app/(dashboard)/vault/[id]/page.tsx
"use client";

import { useState, useMemo } from "react";
import { VirtualFile, EditorTab } from "@/types/editor.types";
import { buildVirtualTree } from "@/features/editor/lib/path-tree";
import { detectLanguageByFilename } from "@/features/editor/lib/language-detector";
import { FileTree } from "@/features/editor/components/file-tree";
import { TabBar } from "@/features/editor/components/tab-bar";
import { MonacoEditor } from "@/features/editor/components/monaco-editor";
import { EditorHeader } from "@/features/editor/components/editor-header";

// Starter template files to showcase multi-file capabilities immediately
const INITIAL_FILES: VirtualFile[] = [
  {
    id: "f1",
    path: "src/lib/supabase/client.ts",
    name: "client.ts",
    language: "typescript",
    content: `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`,
  },
  {
    id: "f2",
    path: "src/proxy.ts",
    name: "proxy.ts",
    language: "typescript",
    content: `import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
`,
  },
  {
    id: "f3",
    path: "package.json",
    name: "package.json",
    language: "json",
    content: `{
  "name": "noctdev-boilerplate",
  "version": "1.0.0",
  "private": true
}
`,
  },
];

export default function WorkspacePage() {
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("f1");
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([
    {
      fileId: "f1",
      path: INITIAL_FILES[0].path,
      name: INITIAL_FILES[0].name,
      language: INITIAL_FILES[0].language,
    },
    {
      fileId: "f2",
      path: INITIAL_FILES[1].path,
      name: INITIAL_FILES[1].name,
      language: INITIAL_FILES[1].language,
    },
  ]);

  // Transform flat files into visual folder/file hierarchy
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
        {
          fileId: file.id,
          path: file.path,
          name: file.name,
          language: file.language,
        },
      ]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const updatedTabs = openTabs.filter((t) => t.fileId !== fileId);
    setOpenTabs(updatedTabs);
    if (activeFileId === fileId && updatedTabs.length > 0) {
      setActiveFileId(updatedTabs[updatedTabs.length - 1].fileId);
    }
  };

  const handleCodeChange = (newCode: string | undefined) => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, content: newCode || "" } : f))
    );
  };

  const handleAddFile = (filePath: string) => {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    const lang = detectLanguageByFilename(fileName);

    const newFile: VirtualFile = {
      id: `file-${Date.now()}`,
      path: filePath,
      name: fileName,
      language: lang.monacoLang,
      content: `// ${fileName}\n\n`,
    };

    setFiles((prev) => [...prev, newFile]);
    handleSelectFile(newFile);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    handleCloseTab(fileId);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* 1. Left Virtual File Tree */}
      <FileTree
        tree={tree}
        activeFileId={activeFileId}
        onSelectFile={handleSelectFile}
        onAddFile={handleAddFile}
        onDeleteFile={handleDeleteFile}
      />

      {/* 2. Monaco Code Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0C10]">
        <TabBar
          openTabs={openTabs}
          activeFileId={activeFileId}
          onSelectTab={setActiveFileId}
          onCloseTab={handleCloseTab}
        />

        <EditorHeader
          title="Supabase SSR Architecture"
          activeFile={activeFile}
          allFiles={files}
        />

        <div className="flex-1 min-h-0">
          {activeFile ? (
            <MonacoEditor
              code={activeFile.content}
              language={activeFile.language}
              onChange={handleCodeChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
              Select or create a file to start editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}