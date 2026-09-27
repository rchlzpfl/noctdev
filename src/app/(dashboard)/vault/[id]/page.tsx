// src/app/(dashboard)/vault/[id]/page.tsx
"use client";

import { useState, useMemo, useRef, use } from "react";
import { VirtualFile, EditorTab } from "@/types/editor.types";
import { buildVirtualTree } from "@/features/editor/lib/path-tree";
import { detectLanguageByFilename } from "@/features/editor/lib/language-detector";
import { FileTree } from "@/features/editor/components/file-tree";
import { TabBar } from "@/features/editor/components/tab-bar";
import { MonacoEditor } from "@/features/editor/components/monaco-editor";
import { EditorHeader, ViewMode } from "@/features/editor/components/editor-header";
import { LiveSandbox } from "@/features/editor/components/live-sandbox";
import { DependencyGraph } from "@/features/editor/components/dependency-graph";
import { AiAuditorModal } from "@/features/editor/components/ai-auditor-modal";
import {
  saveFileContent,
  createSnippetFile,
  deleteSnippetFile,
  uploadSnippetFiles,
} from "@/features/snippets/actions/snippets";
import { useSnippet } from "@/lib/hooks/use-cached-data";
import { scanCodeForSecrets } from "@/lib/sanitizers/secret-scanner";
import { AlertCircle, Loader2 } from "lucide-react";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: snippetId } = use(params);
  const { snippetData, loading, refreshSnippet } = useSnippet(snippetId);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive files from SWR database data and active local edits
  const files: VirtualFile[] = useMemo(() => {
    if (!snippetData) return [];
    return snippetData.files.map((f) => ({
      id: f.id,
      path: f.file_path,
      name: f.file_path.split("/").pop() || f.file_path,
      language: f.language,
      content: editedContents[f.id] !== undefined ? editedContents[f.id] : f.code,
    }));
  }, [snippetData, editedContents]);

  const activeFileId = selectedFileId || (files.length > 0 ? files[0].id : null);

  const tree = useMemo(() => buildVirtualTree(files), [files]);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) || null,
    [files, activeFileId]
  );

  // Real-time secret scanning
  const detectedSecrets = useMemo(() => {
    if (!activeFile) return 0;
    return scanCodeForSecrets(activeFile.content).length;
  }, [activeFile]);

  const handleSelectFile = (file: VirtualFile) => {
    setSelectedFileId(file.id);
    if (!openTabs.some((t) => t.fileId === file.id)) {
      setOpenTabs((prev) => [
        ...prev,
        { fileId: file.id, path: file.path, name: file.name, language: file.language },
      ]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const updatedTabs = openTabs.filter((t) => t.fileId !== fileId);
    setOpenTabs(updatedTabs);
    if (activeFileId === fileId && updatedTabs.length > 0) {
      setSelectedFileId(updatedTabs[updatedTabs.length - 1].fileId);
    }
  };

  // Debounced auto-save directly to Supabase
  const handleCodeChange = (newCode: string | undefined) => {
    if (!activeFile) return;
    const updatedCode = newCode || "";

    setEditedContents((prev) => ({
      ...prev,
      [activeFile.id]: updatedCode,
    }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveFileContent(activeFile.id, updatedCode);
    }, 700);
  };

  const handleAddFile = async (filePath: string) => {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    const lang = detectLanguageByFilename(fileName);

    try {
      const dbFile = await createSnippetFile(snippetId, filePath, lang.monacoLang);
      const newFile: VirtualFile = {
        id: dbFile.id,
        path: dbFile.file_path,
        name: fileName,
        language: dbFile.language,
        content: dbFile.code,
      };

      handleSelectFile(newFile);
      await refreshSnippet();
    } catch (err) {
      alert("Error adding file: " + (err as Error).message);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteSnippetFile(fileId);
      handleCloseTab(fileId);
      await refreshSnippet();
    } catch (err) {
      alert("Error deleting file: " + (err as Error).message);
    }
  };

  const handleUploadFiles = async (
    uploaded: { path: string; code: string; language: string }[]
  ) => {
    try {
      const dbFiles = await uploadSnippetFiles(snippetId, uploaded);
      const newVirtualFiles: VirtualFile[] = dbFiles.map((dbf) => ({
        id: dbf.id,
        path: dbf.file_path,
        name: dbf.file_path.split("/").pop() || dbf.file_path,
        language: dbf.language,
        content: dbf.code,
      }));

      if (newVirtualFiles.length > 0) {
        handleSelectFile(newVirtualFiles[0]);
      }
      await refreshSnippet();
    } catch (err) {
      alert("Error uploading files: " + (err as Error).message);
    }
  };

  const snippetTitle = snippetData?.snippet.title || "Workspace";

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0B0C10] font-mono text-xs text-neutral-500 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
        <span>Decrypting workspace from vault...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <FileTree
        tree={tree}
        activeFileId={activeFileId}
        onSelectFile={handleSelectFile}
        onAddFile={handleAddFile}
        onDeleteFile={handleDeleteFile}
        onUploadFiles={handleUploadFiles}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0C10]">
        <TabBar
          openTabs={openTabs}
          activeFileId={activeFileId}
          onSelectTab={setSelectedFileId}
          onCloseTab={handleCloseTab}
        />

        <EditorHeader
          title={snippetTitle}
          activeFile={activeFile}
          allFiles={files}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenAudit={() => setIsAuditOpen(true)}
        />

        {detectedSecrets > 0 && viewMode === "editor" && (
          <div className="h-7 bg-red-950/70 border-b border-red-500/30 px-4 flex items-center justify-between text-[11px] text-red-300">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Detected {detectedSecrets} exposed secret(s) in active file.
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {viewMode === "editor" && (
            activeFile ? (
              <MonacoEditor
                code={activeFile.content}
                language={detectLanguageByFilename(activeFile.path).monacoLang}
                onChange={handleCodeChange}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                Select or create a file to start editing
              </div>
            )
          )}

          {viewMode === "sandbox" && (
            <LiveSandbox files={files} activeFile={activeFile} />
          )}

          {viewMode === "graph" && (
            <DependencyGraph files={files} activeFileId={activeFileId} onSelectFile={handleSelectFile} />
          )}
        </div>
      </div>

      {/* AI Security & Architecture Auditor Modal */}
      <AiAuditorModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        activeFile={activeFile}
        allFiles={files}
        onApplyFix={(fixedCode) => {
          handleCodeChange(fixedCode);
          setIsAuditOpen(false);
        }}
      />
    </div>
  );
}