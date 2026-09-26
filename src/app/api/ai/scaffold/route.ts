// src/app/api/ai/scaffold/route.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
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

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        title: z.string().describe("A concise architectural title for the snippet"),
        description: z.string().describe("Short explanation of how the files work together"),
        files: z.array(
          z.object({
            path: z.string().describe("Virtual file path, e.g., src/routes/stripe.ts"),
            code: z.string().describe("Full, clean, production-ready code with types"),
            language: z.string().describe("Monaco language identifier, e.g. typescript, json, sql"),
          })
        ),
      }),
      prompt: `You are an elite principal software engineer. 
Scaffold a complete, multi-file production-ready architectural implementation based on this requirement:
"${prompt}"

Rules:
- Include proper separation of concerns (e.g., config, helper/service, and route/entry point).
- Use TypeScript strict mode and modern idiomatic patterns.
- Do not use markdown backticks in the code property; provide pure raw code.`,
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