// src/features/gotchas/actions/gotchas.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Gotcha } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export interface CreateGotchaInput {
  title: string;
  error_message: string;
  solution: string;
  context_tags: string[];
}

export async function getGotchas(): Promise<Gotcha[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("gotchas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gotchas:", error);
    return [];
  }

  return data as Gotcha[];
}

export async function createGotcha(input: CreateGotchaInput): Promise<Gotcha> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("gotchas")
    .insert({
      user_id: user.id,
      title: input.title,
      error_message: input.error_message,
      solution: input.solution,
      context_tags: input.context_tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/gotchas");
  return data as Gotcha;
}

export async function deleteGotcha(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("gotchas").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/gotchas");
}