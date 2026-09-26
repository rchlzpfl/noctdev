// src/app/api/ai/brag-sheet/route.ts
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

    const { rawNotes, projectTag } = await req.json();

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        title: z.string().describe("Headline of the technical accomplishment"),
        situation: z.string().describe("The business context or architectural bottleneck"),
        task: z.string().describe("The specific technical responsibility or goal"),
        action: z.string().describe("The engineering decisions, tools, and algorithms deployed"),
        result: z.string().describe("Measurable outcome, latency reduction, reliability gain"),
        impact_metrics: z.string().describe("E.g. '-45% TTFB, 99.99% uptime, 0 data loss'"),
      }),
      prompt: `Transform these raw engineering notes/tasks into a compelling, high-impact STAR story for a Senior/Staff software engineering portfolio:
"${rawNotes}"`,
    });

    // Save directly to the highlights table
    const { data, error } = await supabase
      .from("highlights")
      .insert({
        user_id: user.id,
        title: object.title,
        situation: object.situation,
        task: object.task,
        action: object.action,
        result: object.result,
        impact_metrics: object.impact_metrics,
        project_tag: projectTag || "Engineering",
        is_featured: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("STAR Generation Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}