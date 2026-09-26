// src/features/editor/lib/language-detector.ts

export interface LanguageMeta {
  language: string;
  monacoLang: string;
  badgeColor: string;
  iconText: string;
}

const EXTENSION_MAP: Record<string, LanguageMeta> = {
  ts: { language: "TypeScript", monacoLang: "typescript", badgeColor: "#3178C6", iconText: "TS" },
  tsx: { language: "TypeScript React", monacoLang: "typescript", badgeColor: "#3178C6", iconText: "TSX" },
  js: { language: "JavaScript", monacoLang: "javascript", badgeColor: "#F7DF1E", iconText: "JS" },
  jsx: { language: "JavaScript React", monacoLang: "javascript", badgeColor: "#F7DF1E", iconText: "JSX" },
  sql: { language: "PostgreSQL", monacoLang: "sql", badgeColor: "#336791", iconText: "SQL" },
  py: { language: "Python", monacoLang: "python", badgeColor: "#3776AB", iconText: "PY" },
  json: { language: "JSON", monacoLang: "json", badgeColor: "#CBCB41", iconText: "{}" },
  css: { language: "CSS", monacoLang: "css", badgeColor: "#264DE4", iconText: "CSS" },
  html: { language: "HTML", monacoLang: "html", badgeColor: "#E34F26", iconText: "<>" },
  md: { language: "Markdown", monacoLang: "markdown", badgeColor: "#083fa1", iconText: "MD" },
  env: { language: "Environment", monacoLang: "ini", badgeColor: "#F59E0B", iconText: "ENV" },
  sh: { language: "Shell", monacoLang: "shell", badgeColor: "#4EAA25", iconText: "SH" },
  yaml: { language: "YAML", monacoLang: "yaml", badgeColor: "#CB171E", iconText: "YML" },
  yml: { language: "YAML", monacoLang: "yaml", badgeColor: "#CB171E", iconText: "YML" },
};

export function detectLanguageByFilename(filePath: string): LanguageMeta {
  const parts = filePath.split(".");
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";

  return (
    EXTENSION_MAP[ext] || {
      language: "Plain Text",
      monacoLang: "plaintext",
      badgeColor: "#888888",
      iconText: "TXT",
    }
  );
}