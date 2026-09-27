// // src/lib/ai.ts
// import { createOpenAI } from "@ai-sdk/openai";
// import { generateObject } from "ai";
// import { z } from "zod";

// export const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
//   headers: {
//     "HTTP-Referer": "http://localhost:3000",
//     "X-Title": "NoctDev",
//   },
// });

// // Fallback list of current verified active free models
// const FALLBACK_FREE_MODELS = [
//   "cohere/north-mini-code:free",
//   "google/gemma-4-26b-a4b-it:free",
//   "qwen/qwen3-next-80b-a3b-instruct:free",
//   "nvidia/nemotron-3-super-120b-a12b:free",
// ];

// /**
//  * Queries OpenRouter's live API to discover whatever models are 100% free right now
//  */
// async function getLiveFreeModels(): Promise<string[]> {
//   try {
//     const res = await fetch("https://openrouter.ai/api/v1/models", {
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY}`,
//       },
//       next: { revalidate: 3600 }, // Cache for 1 hour
//     });
//     const data = await res.json();
//     if (data?.data && Array.isArray(data.data)) {
//       const activeFree = data.data
//         .filter(
//           (m: { id: string; pricing?: { prompt?: string } }) =>
//             m.id.endsWith(":free") &&
//             m.pricing?.prompt === "0" &&
//             !m.id.includes("content-safety") // Skip moderation bots
//         )
//         .map((m: { id: string }) => m.id);

//       if (activeFree.length > 0) return activeFree;
//     }
//   } catch (e) {
//     console.warn("[NoctAI] Failed to fetch live model catalog, using fallback list:", e);
//   }
//   return FALLBACK_FREE_MODELS;
// }

// /**
//  * Automatically cycles through live active free models
//  */
// export async function generateObjectWithFallback<T>({
//   schema,
//   prompt,
//   system,
// }: {
//   schema: z.ZodType<T>;
//   prompt: string;
//   system?: string;
// }): Promise<{ object: T; modelUsed: string }> {
//   const modelsToTry = await getLiveFreeModels();
//   let lastError: Error | null = null;

//   for (const modelId of modelsToTry) {
//     try {
//       console.log(`[NoctAI] Trying live free model: ${modelId}...`);

//       const result = await generateObject({
//         model: openrouter(modelId),
//         schema,
//         prompt,
//         system,
//       });

//       console.log(`[NoctAI] Success with: ${modelId}`);
//       return { object: result.object, modelUsed: modelId };
//     } catch (err) {
//       console.warn(
//         `[NoctAI] ${modelId} failed: ${(err as Error).message}. Rotating to next free model...`
//       );
//       lastError = err as Error;
//     }
//   }

//   throw new Error(`All active free models failed. Last error: ${lastError?.message}`);
// }

// src/lib/ai.ts
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "NoctDev",
  },
});

const PREFERRED_CODING_KEYWORDS = ["coder", "code", "dots", "qwen", "gemma", "instruct"];
const EXCLUDED_KEYWORDS = ["safety", "sante", "fin", "med", "guard", "embed"];

async function getLiveFreeModels(): Promise<string[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY}`,
      },
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    if (data?.data && Array.isArray(data.data)) {
      // 1. Filter out moderation, medical, and financial models
      const validFree = data.data
        .filter(
          (m: { id: string; pricing?: { prompt?: string } }) =>
            m.id.endsWith(":free") &&
            m.pricing?.prompt === "0" &&
            !EXCLUDED_KEYWORDS.some((kw) => m.id.toLowerCase().includes(kw))
        )
        .map((m: { id: string }) => m.id);

      // 2. Sort so coding/instruct models are tried first
      validFree.sort((a: string, b: string) => {
        const aScore = PREFERRED_CODING_KEYWORDS.some((k) => a.toLowerCase().includes(k)) ? 1 : 0;
        const bScore = PREFERRED_CODING_KEYWORDS.some((k) => b.toLowerCase().includes(k)) ? 1 : 0;
        return bScore - aScore;
      });

      if (validFree.length > 0) return validFree;
    }
  } catch (e) {
    console.warn("[NoctAI] Failed to fetch live models, using fallback list:", e);
  }

  return ["dots-studio/dots-3-note-preview:free", "google/gemma-4-26b-a4b-it:free"];
}

export async function generateObjectWithFallback<T>({
  schema,
  prompt,
  system,
}: {
  schema: z.ZodType<T>;
  prompt: string;
  system?: string;
}): Promise<{ object: T; modelUsed: string }> {
  const modelsToTry = await getLiveFreeModels();
  let lastError: Error | null = null;

  for (const modelId of modelsToTry) {
    try {
      console.log(`[NoctAI] Trying free model: ${modelId}...`);

      const result = await generateObject({
        model: openrouter(modelId),
        schema,
        prompt,
        system,
      });

      console.log(`[NoctAI] Success with: ${modelId}`);
      return { object: result.object, modelUsed: modelId };
    } catch (err) {
      console.warn(
        `[NoctAI] ${modelId} failed: ${(err as Error).message}. Rotating to next free model...`
      );
      lastError = err as Error;
    }
  }

  throw new Error(`All active free models failed. Last error: ${lastError?.message}`);
}