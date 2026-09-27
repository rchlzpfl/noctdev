// src/features/scratchpad/components/global-scratchpad-drawer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, X, Check, Loader2 } from "lucide-react";
import { getScratchpadContent, updateScratchpadContent } from "../actions/scratchpad";

export function GlobalScratchpadDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Hotkey listener (Windows/Linux Ctrl+J, Mac Cmd+J)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    // 2. Custom event listener from sidebar click
    const handleToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-scratchpad", handleToggle);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-scratchpad", handleToggle);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !loaded) {
      getScratchpadContent().then((val) => {
        setContent(val);
        setLoaded(true);
      });
    }
  }, [isOpen, loaded]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaving(true);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await updateScratchpadContent(val);
      setSaving(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-6 w-96 md:w-[500px] bg-[#16181F] border border-[#232733] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-150">
      <div className="h-10 px-4 bg-[#0B0C10] border-b border-[#232733] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
          <Terminal className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Quick Scratchpad</span>
          <span className="text-[10px] text-neutral-500 font-sans ml-1">
            {saving ? (
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-2.5 h-2.5" /> Synced
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-white p-1 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        autoFocus
        rows={10}
        value={content}
        onChange={handleChange}
        placeholder="Dump temporary code snippets, tokens, curl commands, or ideas here..."
        className="w-full bg-[#16181F] p-4 text-xs font-mono text-[#F6F6F8] outline-none resize-none placeholder:text-neutral-600"
      />
    </div>
  );
}