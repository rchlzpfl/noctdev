// src/app/api/ai/scaffold/route.ts
import { generateObjectWithFallback } from "@/lib/ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const scaffoldSchema = z.object({
      title: z.string().describe("A concise architectural title for the snippet"),
      description: z.string().describe("Short explanation of how the files work together"),
      files: z.array(
        z.object({
          path: z.string().describe("Virtual file path, e.g. src/Main.java or src/index.ts"),
          code: z.string().describe("Full production code"),
          language: z.string().describe("Monaco language mode: java, typescript, python, etc."),
        })
      ),
    });

    const { object } = await generateObjectWithFallback({
      schema: scaffoldSchema,
      system: `You are an elite software architect. Generate complete, runnable multi-file code based on the user's request. Output valid JSON adhering strictly to the schema.`,
      prompt: `Scaffold this project: "${prompt}"`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI Scaffolding Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}