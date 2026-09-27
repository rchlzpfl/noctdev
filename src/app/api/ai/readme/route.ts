// src/app/api/ai/readme/route.ts
import { generateText } from "ai";
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

    const { title, files } = await req.json();

    const fileSummary = (files || [])
      .map((f: { path: string; code: string }) => `File: ${f.path}\n\`\`\`\n${f.code.slice(0, 500)}\n\`\`\``)
      .join("\n\n");

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: "You generate clean, professional GitHub-ready README.md documentation for code modules.",
      prompt: `Generate a README.md for the snippet '${title}' with the following files:\n\n${fileSummary}\n\nInclude: 1. Overview 2. File Architecture 3. Setup/Environment 4. Usage Example.`,
    });

    return NextResponse.json({ readme: text });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}