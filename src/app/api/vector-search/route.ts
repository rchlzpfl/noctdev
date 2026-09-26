// src/app/api/vector-search/route.ts
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
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

    // 1. Generate text embedding for the search query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // 2. Query Postgres pgvector function
    const { data: matches, error } = await supabase.rpc("match_snippets", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
      p_user_id: user.id,
    });

    if (error) {
      console.error("Vector search RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: matches || [] });
  } catch (error) {
    console.error("Vector Search Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}