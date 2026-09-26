// src/app/(dashboard)/gotchas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Search, Loader2 } from "lucide-react";
import { Gotcha } from "@/types/database.types";
import { getGotchas, createGotcha } from "@/features/gotchas/actions/gotchas";
import { GotchaCard } from "@/features/gotchas/components/gotcha-card";

export default function GotchasPage() {
  const [gotchas, setGotchas] = useState<Gotcha[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [solution, setSolution] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGotchas();
        setGotchas(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !errorMessage.trim() || !solution.trim() || submitting) return;

    try {
      setSubmitting(true);
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const created = await createGotcha({
        title: title.trim(),
        error_message: errorMessage.trim(),
        solution: solution.trim(),
        context_tags: tags,
      });

      setGotchas((prev) => [created, ...prev]);
      setTitle("");
      setErrorMessage("");
      setSolution("");
      setTagsInput("");
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save gotcha: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGotchas = gotchas.filter((g) => {
    const query = search.toLowerCase();
    return (
      g.title.toLowerCase().includes(query) ||
      g.error_message.toLowerCase().includes(query) ||
      g.context_tags?.some((t) => t.includes(query))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">Gotchas & Bug Journal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Log obscure errors, hydration mismatches, and their exact solutions so you never debug them twice.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0B0C10] font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Gotcha</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#16181F] border border-[#232733] text-neutral-400 text-xs focus-within:border-[#F59E0B]/50 transition-colors max-w-md">
        <Search className="w-3.5 h-3.5 text-neutral-500" />
        <input
          type="text"
          placeholder="Filter by error log, title, or #tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-neutral-500 text-neutral-200"
        />
      </div>

      {/* Gotchas List */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-neutral-500 font-mono text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
          <span>Reading bug history...</span>
        </div>
      ) : filteredGotchas.length === 0 ? (
        <div className="h-56 border border-dashed border-[#232733] rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-[#16181F]/20">
          <AlertTriangle className="w-8 h-8 text-neutral-600 mb-2" />
          <h3 className="text-sm font-medium text-neutral-300">No Gotchas Logged</h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            Capture stubborn terminal errors and their fixes here for instant recall.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGotchas.map((item) => (
            <GotchaCard
              key={item.id}
              gotcha={item}
              onDeleted={(id) => setGotchas((prev) => prev.filter((g) => g.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-2xl bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-base font-bold text-[#F6F6F8]">Record Obscure Bug / Fix</h2>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Issue Title</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Next.js 16 Turbopack cookies() must be awaited"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-red-400">Terminal / Console Error</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste the raw stack trace or log error..."
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-red-950 focus:border-red-500/60 rounded-lg text-red-200 outline-none font-mono resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-emerald-400">Exact Fix / Solution</label>
                <textarea
                  rows={6}
                  required
                  placeholder="The 2-line code snippet or flag that resolved it..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-emerald-950 focus:border-emerald-500/60 rounded-lg text-emerald-200 outline-none font-mono resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="nextjs, turbopack, supabase, rls"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Gotcha"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}