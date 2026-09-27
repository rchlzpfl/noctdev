// src/app/api/ai/audit/route.ts
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { filename, code } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "No code provided for analysis." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Rule-based heuristic fallback if OPENAI_API_KEY is not configured
      const issues = [];
      let score = 92;
      let rating = "A";

      if (code.includes("eval(") || code.includes("dangerouslySetInnerHTML")) {
        issues.push({
          severity: "high",
          title: "Unsafe Code Execution",
          description: "Use of eval() or raw innerHTML can lead to XSS vulnerabilities.",
          suggestedFix: "// Sanitize or replace eval with safe parser",
        });
        score -= 25;
        rating = "C";
      }

      if (code.includes("var ")) {
        issues.push({
          severity: "low",
          title: "Legacy Variable Declaration",
          description: "Replace 'var' with 'const' or 'let' for block scoping.",
        });
        score -= 5;
      }

      if (/sk-[a-zA-Z0-9]{20,}/.test(code) || /AIzaSy[a-zA-Z0-9_-]{33}/.test(code)) {
        issues.push({
          severity: "high",
          title: "Hardcoded API Key / Secret Detected",
          description: "Hardcoded credentials exposed in source code. Move to process.env.",
        });
        score -= 30;
        rating = "F";
      }

      if (issues.length === 0) {
        issues.push({
          severity: "low",
          title: "Strict Type Hints Recommendation",
          description: "Ensure all parameters and async signatures specify concrete return types.",
        });
      }

      return NextResponse.json({
        qualityScore: Math.max(score, 40),
        securityRating: rating,
        summary: `Code audit completed for ${filename || "file"}. Identified ${issues.length} item(s) for optimization.`,
        issues,
      });
    }

    // Call OpenAI GPT-4o-mini via AI SDK
    const prompt = `Analyze the following file "${filename || "source"}" inside a multi-file project.
Provide a JSON audit response matching this exact structure:
{
  "qualityScore": number (0-100),
  "securityRating": "A+" | "A" | "B" | "C" | "F",
  "summary": "2-sentence summary of architecture and security posture",
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "line": optional line number,
      "title": "short issue title",
      "description": "detailed vulnerability or optimization explanation",
      "suggestedFix": "optional replacement code snippet"
    }
  ]
}

Code to analyze:
\`\`\`
${code}
\`\`\``;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "AI Audit failed." },
      { status: 500 }
    );
  }
}
