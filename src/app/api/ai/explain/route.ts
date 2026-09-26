// src/app/api/ai/explain/route.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { code, language, filename } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are an elite code reviewer. Explain the code cleanly in 3 concise sections:
1. 🎯 Purpose & Core Architecture
2. ⚡ Performance & Edge Cases
3. 🔒 Security & Gotchas
Keep explanations technical, dense, and formatted in clean markdown.`,
    prompt: `Analyze this ${language} file (${filename}):\n\n\`\`\`${language}\n${code}\n\`\`\``,
  });

  return result.toDataStreamResponse();
}