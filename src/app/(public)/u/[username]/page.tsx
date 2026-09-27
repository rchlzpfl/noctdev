// src/app/(public)/u/[username]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StarFlashcard } from "@/features/profile/components/star-flashcard";
import { Code2, Terminal, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Highlight, Snippet } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile || !profile.is_public) {
    notFound();
  }

  // 2. Fetch Public Snippets and Highlights
  const [snippetsRes, highlightsRes] = await Promise.all([
    supabase
      .from("snippets")
      .select("*")
      .eq("user_id", profile.id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false }),
    supabase
      .from("highlights")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_featured", true)
      .order("created_at", { ascending: false }),
  ]);

  const snippets = (snippetsRes.data || []) as Snippet[];
  const highlights = (highlightsRes.data || []) as Highlight[];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F6F6F8]">
      {/* Header */}
      <header className="h-14 border-b border-[#232733] px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#16181F] border border-white/5 text-[#F59E0B]">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">NOCTDEV</span>
        </Link>
        <Link
          href="/login"
          className="px-3 py-1 bg-[#16181F] hover:bg-[#16181F]/80 border border-[#232733] text-xs font-mono rounded-lg transition-colors"
        >
          Create Your Vault
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-8 space-y-10">
        {/* Profile Card */}
        <div className="p-6 bg-[#16181F] border border-[#232733] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[#F6F6F8]">
                {profile.full_name || profile.username}
              </h1>
              <span className="text-xs font-mono text-[#F59E0B]">
                @{profile.username}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              {profile.bio || "Full-stack engineer building resilient systems."}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {profile.tech_stack?.map((tech: string) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-black/40 border border-white/5 text-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Featured Highlights (STAR) */}
        {highlights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Architectural Accomplishments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((h) => (
                <StarFlashcard key={h.id} highlight={h} />
              ))}
            </div>
          </div>
        )}

        {/* Public Snippets Vault */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Open-Source Blueprints & Snippets ({snippets.length})
          </h2>

          {snippets.length === 0 ? (
            <div className="p-8 border border-dashed border-[#232733] rounded-xl text-center text-xs text-neutral-500 font-mono">
              No public snippets published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snippets.map((snip) => (
                <Link
                  key={snip.id}
                  href={`/share/${snip.slug}`}
                  className="p-4 bg-[#16181F] hover:bg-[#16181F]/80 border border-[#232733] hover:border-[#F59E0B]/40 rounded-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-neutral-500 mb-2">
                      <Code2 className="w-4 h-4 text-[#38BDF8]" />
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-[#F6F6F8] line-clamp-1">
                      {snip.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                      {snip.description || "No description provided."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}