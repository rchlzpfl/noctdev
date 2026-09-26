// src/features/scratchpad/actions/scratchpad.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getScratchpadContent(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";

  const { data, error } = await supabase
    .from("scratchpad")
    .select("content")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error reading scratchpad:", error);
    return "";
  }

  return data?.content || "";
}

export async function updateScratchpadContent(content: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("scratchpad")
    .upsert(
      { user_id: user.id, content, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) console.error("Error saving scratchpad:", error);
}