import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { VirtualFile } from "@/types/editor.types";
import PublicSnippetViewer from "./public-snippet-viewer";

export const dynamic = "force-dynamic";

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: snippet, error: snipErr } = await supabase
    .from("snippets")
    .select("*, profile:profiles(username, full_name, avatar_url)")
    .eq("slug", slug)
    .single();

  if (snipErr || !snippet || snippet.visibility === "private") {
    notFound();
  }

  const { data: files } = await supabase
    .from("snippet_files")
    .select("*")
    .eq("snippet_id", snippet.id)
    .order("order_index", { ascending: true });

  const virtualFiles: VirtualFile[] = (files || []).map((f) => ({
    id: f.id,
    path: f.file_path,
    name: f.file_path.split("/").pop() || f.file_path,
    language: f.language,
    content: f.code,
  }));

  return (
    <PublicSnippetViewer
      snippetTitle={snippet.title}
      snippetDescription={snippet.description}
      author={snippet.profile}
      files={virtualFiles}
    />
  );
}