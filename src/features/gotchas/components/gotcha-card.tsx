// src/features/gotchas/components/gotcha-card.tsx
"use client";

import { useState } from "react";
import { Gotcha } from "@/types/database.types";
import { Trash2, Copy, Check, Terminal, Lightbulb } from "lucide-react";
import { deleteGotcha } from "../actions/gotchas";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

interface GotchaCardProps {
  gotcha: Gotcha;
  onDeleted?: (id: string) => void;
}

export function GotchaCard({ gotcha, onDeleted }: GotchaCardProps) {
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopySolution = async () => {
    await navigator.clipboard.writeText(gotcha.solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteGotcha(gotcha.id);
      setIsConfirming(false);
      onDeleted?.(gotcha.id);
    } catch (err) {
      alert("Error deleting gotcha: " + (err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-[#16181F] border border-[#232733] rounded-xl overflow-hidden shadow-lg transition-all hover:border-white/10">
        <div className="px-5 py-3.5 border-b border-[#232733] bg-[#0B0C10]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-[#F6F6F8]">{gotcha.title}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {gotcha.context_tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-neutral-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsConfirming(true)}
            className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
            title="Delete Gotcha"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#232733]">
          <div className="p-4 bg-[#0B0C10]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>Runtime / Build Error</span>
              </div>
              <pre className="text-xs font-mono text-red-300/90 whitespace-pre-wrap break-all p-3 rounded-lg bg-black/50 border border-red-950/50 max-h-48 overflow-y-auto">
                {gotcha.error_message}
              </pre>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between bg-[#16181F]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#F59E0B]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>The Fix</span>
                </span>
                <button
                  onClick={handleCopySolution}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-[#F6F6F8] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? "Copied" : "Copy Fix"}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap break-all p-3 rounded-lg bg-black/50 border border-emerald-950/50 max-h-48 overflow-y-auto">
                {gotcha.solution}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirming}
        title="Delete Gotcha Entry"
        description={`Are you sure you want to delete "${gotcha.title}"? You will lose this recorded error log and fix.`}
        confirmText="Delete Gotcha"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}