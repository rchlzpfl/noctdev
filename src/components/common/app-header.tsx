// src/components/common/app-header.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Code2, FileCode, AlertTriangle, X, ArrowRight, Kanban, Settings } from "lucide-react";
import { searchAll, SearchItem } from "@/features/search/actions/search";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMac] = useState(() =>
    typeof navigator !== "undefined" ? navigator.userAgent.toUpperCase().indexOf("MAC") >= 0 : false
  );
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchAll(val);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(url);
  };

  return (
    <>
      <header className="h-16 border-b border-[#232733] bg-[#0B0C10]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => setOpen(true)}
          className="w-96 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#16181F] border border-[#232733] hover:border-[#F59E0B]/50 text-neutral-400 text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-500">Quick search files, workspaces, bugs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-neutral-400 font-mono">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#16181F] border border-white/5 text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Connected</span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-xl bg-[#16181F] border border-[#232733] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-[#232733] flex items-center gap-3">
              <Search className="w-4 h-4 text-[#F59E0B]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type a file (e.g. pom.xml), workspace, or bug..."
                className="w-full bg-transparent text-sm text-[#F6F6F8] outline-none placeholder:text-neutral-500"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {results.length > 0 ? (
                results.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelect(res.url)}
                    className="p-3 rounded-lg hover:bg-white/5 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {res.type === "workspace" && <Code2 className="w-4 h-4 text-[#F59E0B]" />}
                      {res.type === "file" && <FileCode className="w-4 h-4 text-[#38BDF8]" />}
                      {res.type === "gotcha" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <div>
                        <p className="text-xs font-medium text-[#F6F6F8] group-hover:text-[#F59E0B] transition-colors">
                          {res.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{res.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                ))
              ) : query.length >= 2 && !loading ? (
                <div className="p-6 text-center text-xs text-neutral-500 font-mono">
                  No matching files or workspaces found.
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-neutral-500 px-3 py-1">
                    Quick Navigation
                  </div>
                  <div
                    onClick={() => handleSelect("/vault")}
                    className="p-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3 cursor-pointer text-xs text-neutral-300 hover:text-white"
                  >
                    <Code2 className="w-4 h-4 text-[#F59E0B]" />
                    <span>Go to Code Vault</span>
                  </div>
                  <div
                    onClick={() => handleSelect("/kanban")}
                    className="p-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3 cursor-pointer text-xs text-neutral-300 hover:text-white"
                  >
                    <Kanban className="w-4 h-4 text-[#38BDF8]" />
                    <span>Go to Kanban Board</span>
                  </div>
                  <div
                    onClick={() => handleSelect("/settings")}
                    className="p-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3 cursor-pointer text-xs text-neutral-300 hover:text-white"
                  >
                    <Settings className="w-4 h-4 text-neutral-400" />
                    <span>Settings & Preferences</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}