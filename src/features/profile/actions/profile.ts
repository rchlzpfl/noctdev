// src/features/profile/actions/profile.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function getCurrentProfile(): Promise<{ profile: Profile | null; email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { profile: null, email: "" };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    profile: data as Profile | null,
    email: user.email || "",
  };
}

export async function updateProfile(input: {
  username: string;
  full_name: string;
  bio: string;
  tech_stack: string[];
  is_public: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const sanitizedUsername = input.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

  if (!sanitizedUsername) {
    return { success: false, error: "Username cannot be empty." };
  }

  // Check if another user already has this username
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", sanitizedUsername)
    .neq("id", user.id)
    .maybeSingle();

  if (existingUser) {
    return {
      success: false,
      error: `Username "${sanitizedUsername}" is already taken by another account.`,
    };
  }

  // Update profile row
  const { error } = await supabase
    .from("profiles")
    .update({
      username: sanitizedUsername,
      full_name: input.full_name.trim(),
      bio: input.bio.trim(),
      tech_stack: input.tech_stack,
      is_public: input.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: `Username "${sanitizedUsername}" is already in use.` };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${sanitizedUsername}`);
  return { success: true };
}