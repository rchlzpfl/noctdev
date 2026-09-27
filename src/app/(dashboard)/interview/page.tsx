// src/app/(dashboard)/interview/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Highlight, Gotcha } from "@/types/database.types";
import { StarFlashcard } from "@/features/profile/components/star-flashcard";
import { Sparkles, Terminal, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [highlightsRes, gotchasRes] = await Promise.all([
    supabase
      .from("highlights")
      .select("*")
      .eq("user_id", user?.id || "")
      .order("created_at", { ascending: false }),
    supabase
      .from("gotchas")
      .select("*")
      .eq("user_id", user?.id || "")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const highlights = (highlightsRes.data || []) as Highlight[];
  const gotchas = (gotchasRes.data || []) as Gotcha[];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interview Mode // Portfolio Readiness</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">
          Technical & Behavioral Prep
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
          Review your real-world architecture accomplishments (STAR method) and tricky bugs you solved in production so you can articulate them clearly in senior technical interviews.
        </p>
      </div>

      {/* Highlights / STAR Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#232733] pb-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
            STAR Flashcards ({highlights.length})
          </h2>
        </div>

        {highlights.length === 0 ? (
          <div className="p-6 border border-dashed border-[#232733] rounded-xl text-center text-xs text-neutral-500 font-mono">
            No interview highlights recorded yet. Use the AI Brag Sheet generator or create highlights in Supabase.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((h) => (
              <StarFlashcard key={h.id} highlight={h} />
            ))}
          </div>
        )}
      </div>

      {/* Tricky Questions / Debugging Gotchas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#232733] pb-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
            Production Debugging Scenarios (From Your Gotchas)
          </h2>
        </div>

        {gotchas.length === 0 ? (
          <div className="p-6 border border-dashed border-[#232733] rounded-xl text-center text-xs text-neutral-500 font-mono">
            No gotchas logged yet. Add tricky bugs in the Gotchas Journal to generate situational interview questions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gotchas.map((g) => (
              <div
                key={g.id}
                className="p-5 bg-[#16181F] border border-[#232733] rounded-xl space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-semibold">{g.title}</span>
                </div>
                <div className="p-2.5 rounded bg-[#0B0C10] border border-white/5 font-mono text-[11px] text-neutral-400">
                  <span className="text-neutral-600 block mb-1">Interview question:</span>
                  "Tell me about a time you encountered this failure and how you diagnosed it:"
                  <div className="text-red-400 mt-1 truncate">{g.error_message}</div>
                </div>
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{g.solution}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}