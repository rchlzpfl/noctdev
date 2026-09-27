// src/features/profile/components/star-flashcard.tsx
"use client";

import { useState } from "react";
import { Highlight } from "@/types/database.types";
import { RotateCw, CheckCircle2 } from "lucide-react";

export function StarFlashcard({ highlight }: { highlight: Highlight }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer min-h-[220px] bg-[#16181F] border border-[#232733] hover:border-[#F59E0B]/50 rounded-2xl p-5 transition-all flex flex-col justify-between select-none relative group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-[#38BDF8]">
            {highlight.project_tag || "Architecture"}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 group-hover:text-[#F59E0B] transition-colors">
            <RotateCw className="w-3 h-3" />
            <span>Click to flip</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[#F6F6F8] leading-snug">
          {highlight.title}
        </h3>

        {!flipped ? (
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                Situation & Task
              </span>
              <p className="text-xs text-neutral-300 mt-0.5 line-clamp-3">
                {highlight.situation || highlight.task || "No background details specified."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#F59E0B] block">
                Action Taken
              </span>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                {highlight.action || "Executed system re-architecture."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#232733] flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {highlight.impact_metrics || highlight.result || "Validated in prod"}
        </span>
        <span className="text-[10px] font-mono text-neutral-500 uppercase">
          {flipped ? "Solution" : "Prompt"}
        </span>
      </div>
    </div>
  );
}