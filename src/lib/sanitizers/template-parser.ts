// src/lib/sanitizers/template-parser.ts

export function extractTemplateVariables(content: string): string[] {
  const matches = content.match(/\{\{([A-Z0-9_]+)\}\}/g) || [];
  const uniqueVars = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ""))));
  return uniqueVars;
}

export function replaceTemplateVariables(
  content: string,
  values: Record<string, string>
): string {
  let result = content;
  for (const [key, val] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, val);
  }
  return result;
}