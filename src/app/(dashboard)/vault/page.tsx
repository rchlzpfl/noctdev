// src/app/(dashboard)/vault/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Code2,
  Lock,
  Globe,
  ExternalLink,
  Calendar,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  getUserSnippets,
  createSnippet,
  deleteSnippet,
} from "@/features/snippets/actions/snippets";
import { Snippet } from "@/types/database.types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useRouter } from "next/navigation";

export default function VaultGalleryPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workspace Deletion Confirmation State
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  const [deletingSnippet, setDeletingSnippet] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchSnippets() {
      try {
        const data = await getUserSnippets();
        setSnippets(data);
      } finally {
        setLoading(false);
      }
    }
    fetchSnippets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      let initialFiles = undefined;

      // Handle AI Scaffolding
      if (useAi && aiPrompt.trim()) {
        const res = await fetch("/api/ai/scaffold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: aiPrompt }),
        });

        const aiData = await res.json();

        if (!res.ok || !aiData.files) {
          alert("AI Scaffolding Error: " + (aiData.error || "Failed to generate boilerplate."));
          setIsSubmitting(false);
          return;
        }

        initialFiles = aiData.files;
      }

      const created = await createSnippet({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        initialFiles,
      });

      router.push(`/vault/${created.id}`);
    } catch (err) {
      alert("Failed to create snippet: " + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!snippetToDelete) return;
    setDeletingSnippet(true);

    try {
      await deleteSnippet(snippetToDelete.id);
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete.id));
      setSnippetToDelete(null);
    } catch (err) {
      alert("Error deleting workspace: " + (err as Error).message);
    } finally {
      setDeletingSnippet(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">Snippet Vault</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Isolated multi-file architectures, configuration recipes, and verified boilerplates.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0B0C10] font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm shadow-[#F59E0B]/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Grid of Workspaces */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 font-mono text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
          <span>Decrypting vault index...</span>
        </div>
      ) : snippets.length === 0 ? (
        <div className="h-72 border border-dashed border-[#232733] rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-[#16181F]/20">
          <Code2 className="w-10 h-10 text-neutral-600 mb-2" />
          <h3 className="text-sm font-medium text-neutral-300">No Snippets Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            Your vault is empty. Click &quot;+ New Workspace&quot; above to spin up your first multi-file environment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {snippets.map((snip) => (
            <Link
              key={snip.id}
              href={`/vault/${snip.id}`}
              className="group p-5 bg-[#16181F] hover:bg-[#16181F]/80 border border-[#232733] hover:border-[#F59E0B]/40 rounded-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    {snip.visibility === "private" ? (
                      <Lock className="w-3 h-3 text-[#F59E0B]" />
                    ) : (
                      <Globe className="w-3 h-3 text-[#38BDF8]" />
                    )}
                    {snip.visibility}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSnippetToDelete(snip);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#F6F6F8] transition-colors" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#F6F6F8] group-hover:text-[#F59E0B] transition-colors line-clamp-1">
                  {snip.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                  {snip.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#232733] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(snip.created_at).toLocaleDateString()}
                </span>
                <span className="text-neutral-400 group-hover:text-[#F59E0B] transition-colors">
                  Open Workspace →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Creation Modal with AI Generation Option */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-[#16181F] border border-[#232733] rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F6F6F8]">New Snippet Workspace</h2>
              <button
                type="button"
                onClick={() => setUseAi(!useAi)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                  useAi
                    ? "bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]"
                    : "bg-[#0B0C10] border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{useAi ? "AI Scaffold Enabled" : "Scaffold with AI?"}</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Workspace Title</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Spring Boot JWT Auth"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none font-mono"
              />
            </div>

            {useAi ? (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#F59E0B]">
                  AI Blueprint Requirement
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the architecture (e.g. 'Java Spring Boot project with JWT auth, user repository, and controller')..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#F59E0B]/40 focus:border-[#F59E0B] rounded-lg text-[#F6F6F8] outline-none resize-none font-mono placeholder:text-neutral-600"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of architecture, edge cases, purpose..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none resize-none placeholder:text-neutral-600"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#F59E0B]/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{useAi ? "Scaffolding Files..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{useAi ? "Generate & Launch" : "Create Workspace"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal Before Deleting Workspace */}
      <ConfirmDialog
        isOpen={!!snippetToDelete}
        title="Delete Snippet Workspace"
        description={`Are you sure you want to delete "${snippetToDelete?.title}"? All virtual files, configurations, and code inside will be permanently destroyed.`}
        confirmText="Delete Workspace"
        loading={deletingSnippet}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSnippetToDelete(null)}
      />
    </div>
  );
}