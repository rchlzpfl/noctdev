// src/features/kanban/actions/kanban.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Task, TaskStatus } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export interface TaskWithSnippet extends Task {
  snippet?: {
    id: string;
    title: string;
  } | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  snippet_id?: string;
}

export async function getKanbanTasks(): Promise<TaskWithSnippet[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      snippet:snippets(id, title)
    `)
    .eq("user_id", user.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return (data || []) as unknown as TaskWithSnippet[];
}

export async function createKanbanTask(input: CreateTaskInput): Promise<TaskWithSnippet> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      status: input.status || "todo",
      snippet_id: input.snippet_id || null,
      order_index: 0,
    })
    .select(`
      *,
      snippet:snippets(id, title)
    `)
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/kanban");
  return data as unknown as TaskWithSnippet;
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  newOrderIndex: number
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      order_index: newOrderIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) console.error("Error updating task status:", error);
}

export async function deleteKanbanTask(taskId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/kanban");
}