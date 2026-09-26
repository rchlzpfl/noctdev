// src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VisibilityType = "private" | "unlisted" | "public";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tech_stack: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  slug: string;
  visibility: VisibilityType;
  framework_versions: Record<string, string>;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SnippetFile {
  id: string;
  snippet_id: string;
  file_path: string; // e.g. "src/auth/route.ts"
  code: string;
  language: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SnippetComment {
  id: string;
  snippet_file_id: string;
  user_id: string;
  line_number: number;
  comment_text: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  snippet_id: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Highlight {
  id: string;
  user_id: string;
  title: string;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  impact_metrics: string | null;
  project_tag: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gotcha {
  id: string;
  user_id: string;
  title: string;
  error_message: string;
  solution: string;
  context_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Scratchpad {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}