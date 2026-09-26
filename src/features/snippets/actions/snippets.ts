// src/features/snippets/actions/snippets.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Snippet, SnippetFile, VisibilityType } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export interface CreateSnippetInput {
  title: string;
  description?: string;
  visibility?: VisibilityType;
  initialFiles?: { path: string; code: string; language: string }[];
}

export async function getUserSnippets(): Promise<Snippet[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching snippets:", error);
    return [];
  }

  return data as Snippet[];
}

export async function getSnippetById(id: string) {
  const supabase = await createClient();

  const { data: snippet, error: snippetError } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .single();

  if (snippetError || !snippet) return null;

  const { data: files, error: filesError } = await supabase
    .from("snippet_files")
    .select("*")
    .eq("snippet_id", id)
    .order("order_index", { ascending: true });

  if (filesError) return null;

  return {
    snippet: snippet as Snippet,
    files: (files || []) as SnippetFile[],
  };
}

export async function createSnippet(input: CreateSnippetInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  // 1. Create Snippet Record
  const { data: snippet, error: snippetErr } = await supabase
    .from("snippets")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      slug,
      visibility: input.visibility || "private",
    })
    .select()
    .single();

  if (snippetErr || !snippet) {
    throw new Error(snippetErr?.message || "Failed to create snippet");
  }

  // 2. Insert Initial Files or default entry point
  const filesToInsert = input.initialFiles && input.initialFiles.length > 0
    ? input.initialFiles.map((f, i) => ({
        snippet_id: snippet.id,
        file_path: f.path,
        code: f.code,
        language: f.language,
        order_index: i,
      }))
    : [
        {
          snippet_id: snippet.id,
          file_path: "index.ts",
          code: "// Noct Dev Workspace\n\nexport default function init() {\n  return 'Ready';\n}\n",
          language: "typescript",
          order_index: 0,
        },
      ];

  const { error: filesErr } = await supabase.from("snippet_files").insert(filesToInsert);

  if (filesErr) {
    throw new Error(filesErr.message);
  }

  revalidatePath("/vault");
  return snippet as Snippet;
}

export async function saveFileContent(fileId: string, code: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("snippet_files")
    .update({ code, updated_at: new Date().toISOString() })
    .eq("id", fileId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createSnippetFile(snippetId: string, filePath: string, language: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("snippet_files")
    .insert({
      snippet_id: snippetId,
      file_path: filePath,
      language,
      code: `// ${filePath}\n`,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SnippetFile;
}

export async function deleteSnippetFile(fileId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("snippet_files").delete().eq("id", fileId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function syncSnippetEmbedding(snippetId: string, textToEmbed: string) {
  try {
    const supabase = await createClient();
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: textToEmbed,
    });

    await supabase
      .from("snippets")
      .update({ embedding })
      .eq("id", snippetId);
  } catch (err) {
    console.error("Embedding sync skipped:", err);
  }
}