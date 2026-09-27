// src/features/editor/lib/language-detector.ts

export interface LanguageMeta {
  language: string;
  monacoLang: string;
  badgeColor: string;
  iconText: string;
}

const EXTENSION_MAP: Record<string, LanguageMeta> = {
  // JVM Languages
  java: { language: "Java", monacoLang: "java", badgeColor: "#E76F00", iconText: "JAVA" },
  kt: { language: "Kotlin", monacoLang: "kotlin", badgeColor: "#7F52FF", iconText: "KT" },
  kts: { language: "Kotlin Script", monacoLang: "kotlin", badgeColor: "#7F52FF", iconText: "KTS" },
  scala: { language: "Scala", monacoLang: "scala", badgeColor: "#DC322F", iconText: "SCALA" },

  // JavaScript / TypeScript
  ts: { language: "TypeScript", monacoLang: "typescript", badgeColor: "#3178C6", iconText: "TS" },
  tsx: { language: "TypeScript React", monacoLang: "typescript", badgeColor: "#3178C6", iconText: "TSX" },
  js: { language: "JavaScript", monacoLang: "javascript", badgeColor: "#F7DF1E", iconText: "JS" },
  jsx: { language: "JavaScript React", monacoLang: "javascript", badgeColor: "#F7DF1E", iconText: "JSX" },

  // Backend & Systems
  py: { language: "Python", monacoLang: "python", badgeColor: "#3776AB", iconText: "PY" },
  go: { language: "Go", monacoLang: "go", badgeColor: "#00ADD8", iconText: "GO" },
  rs: { language: "Rust", monacoLang: "rust", badgeColor: "#DEA584", iconText: "RS" },
  cpp: { language: "C++", monacoLang: "cpp", badgeColor: "#00599C", iconText: "C++" },
  cc: { language: "C++", monacoLang: "cpp", badgeColor: "#00599C", iconText: "C++" },
  cxx: { language: "C++", monacoLang: "cpp", badgeColor: "#00599C", iconText: "C++" },
  c: { language: "C", monacoLang: "c", badgeColor: "#A8B9CC", iconText: "C" },
  h: { language: "C Header", monacoLang: "c", badgeColor: "#A8B9CC", iconText: "H" },
  cs: { language: "C#", monacoLang: "csharp", badgeColor: "#239120", iconText: "C#" },
  php: { language: "PHP", monacoLang: "php", badgeColor: "#777BB4", iconText: "PHP" },
  rb: { language: "Ruby", monacoLang: "ruby", badgeColor: "#CC342D", iconText: "RB" },

  // Config & Data
  xml: { language: "XML", monacoLang: "xml", badgeColor: "#0060AC", iconText: "XML" },
  properties: { language: "Properties", monacoLang: "ini", badgeColor: "#67828A", iconText: "PROP" },
  json: { language: "JSON", monacoLang: "json", badgeColor: "#CBCB41", iconText: "{}" },
  yaml: { language: "YAML", monacoLang: "yaml", badgeColor: "#CB171E", iconText: "YML" },
  yml: { language: "YAML", monacoLang: "yaml", badgeColor: "#CB171E", iconText: "YML" },
  toml: { language: "TOML", monacoLang: "ini", badgeColor: "#9C4221", iconText: "TOML" },
  sql: { language: "SQL", monacoLang: "sql", badgeColor: "#336791", iconText: "SQL" },
  env: { language: "Environment", monacoLang: "ini", badgeColor: "#F59E0B", iconText: "ENV" },
  dockerfile: { language: "Docker", monacoLang: "dockerfile", badgeColor: "#2496ED", iconText: "DOCKER" },

  // Web & Shell
  html: { language: "HTML", monacoLang: "html", badgeColor: "#E34F26", iconText: "<>" },
  css: { language: "CSS", monacoLang: "css", badgeColor: "#264DE4", iconText: "CSS" },
  scss: { language: "SCSS", monacoLang: "scss", badgeColor: "#CF649A", iconText: "SCSS" },
  md: { language: "Markdown", monacoLang: "markdown", badgeColor: "#083FA1", iconText: "MD" },
  sh: { language: "Shell", monacoLang: "shell", badgeColor: "#4EAA25", iconText: "SH" },
  bash: { language: "Bash", monacoLang: "shell", badgeColor: "#4EAA25", iconText: "BASH" },
};

export function detectLanguageByFilename(filePath: string): LanguageMeta {
  const cleanPath = filePath.split("/").pop() || filePath;

  // Handle special dotfiles or Dockerfiles without extensions
  if (cleanPath.toLowerCase() === "dockerfile") {
    return EXTENSION_MAP["dockerfile"];
  }

  const parts = cleanPath.split(".");
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