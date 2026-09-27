// src/features/search/actions/search.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchItem {
  id: string;
  type: "workspace" | "file" | "gotcha";
  title: string;
  subtitle: string;
  url: string;
}

export async function searchAll(query: string): Promise<SearchItem[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const q = `%${query.trim().toLowerCase()}%`;

  // Parallel search across snippets, files, and gotchas
  const [snippetsRes, filesRes, gotchasRes] = await Promise.all([
    supabase
      .from("snippets")
      .select("id, title, description")
      .eq("user_id", user.id)
      .or(`title.ilike.${q},description.ilike.${q}`)
      .limit(4),

    supabase
      .from("snippet_files")
      .select("id, snippet_id, file_path, snippets(title)")
      .ilike("file_path", q)
      .limit(4),

    supabase
      .from("gotchas")
      .select("id, title, solution")
      .eq("user_id", user.id)
      .or(`title.ilike.${q},solution.ilike.${q}`)
      .limit(3),
  ]);

  const results: SearchItem[] = [];

  // 1. Snippets
  snippetsRes.data?.forEach((s) => {
    results.push({
      id: `snippet-${s.id}`,
      type: "workspace",
      title: s.title,
      subtitle: s.description || "Snippet Workspace",
      url: `/vault/${s.id}`,
    });
  });

  // 2. Files
  filesRes.data?.forEach((f) => {
    // @ts-expect-error joined snippet relation
    const snippetTitle = f.snippets?.title || "Workspace";
    results.push({
      id: `file-${f.id}`,
      type: "file",
      title: f.file_path,
      subtitle: `In ${snippetTitle}`,
      url: `/vault/${f.snippet_id}`,
    });
  });

  // 3. Gotchas
  gotchasRes.data?.forEach((g) => {
    results.push({
      id: `gotcha-${g.id}`,
      type: "gotcha",
      title: g.title,
      subtitle: g.solution,
      url: `/gotchas`,
    });
  });

  return results;
}