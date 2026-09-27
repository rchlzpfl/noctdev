// src/app/api/vector-search/route.ts
import { embed } from "ai";
import { openrouter } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ results: [] });
    }

    // 1. Try semantic vector embedding search via OpenRouter
    try {
      const { embedding } = await embed({
        model: openrouter.textEmbeddingModel("openai/text-embedding-3-small"),
        value: query,
      });

      const { data: matches } = await supabase.rpc("match_snippets", {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
        p_user_id: user.id,
      });

      if (matches && matches.length > 0) {
        return NextResponse.json({ results: matches });
      }
    } catch {
      // If embedding quota is zero or model is unavailable, gracefully fall back to keyword search below
    }

    // 2. Keyword fallback search (so Ctrl+K always finds results instantly)
    const { data: keywordMatches } = await supabase
      .from("snippets")
      .select("id, title, description, slug")
      .eq("user_id", user.id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);

    return NextResponse.json({ results: keywordMatches || [] });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}