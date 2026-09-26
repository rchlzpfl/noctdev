// src/features/editor/components/monaco-editor.tsx
"use client";

import Editor, { Monaco } from "@monaco-editor/react";

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

export function MonacoEditor({ code, language, onChange }: MonacoEditorProps) {
  const handleEditorWillMount = (monaco: Monaco) => {
    // Register the custom "Noct Dark" Theme
    monaco.editor.defineTheme("noct-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "F6F6F8", background: "0B0C10" },
        { token: "comment", foreground: "6B7280", fontStyle: "italic" },
        { token: "keyword", foreground: "F59E0B" }, // Amber glow keywords
        { token: "string", foreground: "34D399" }, // Emerald strings
        { token: "number", foreground: "38BDF8" }, // Cyan numbers
        { token: "type", foreground: "60A5FA" },
        { token: "function", foreground: "93C5FD" },
        { token: "variable", foreground: "F6F6F8" },
      ],
      colors: {
        "editor.background": "#0B0C10",
        "editor.foreground": "#F6F6F8",
        "editorCursor.foreground": "#F59E0B",
        "editor.lineHighlightBackground": "#16181F",
        "editorLineNumber.foreground": "#374151",
        "editorLineNumber.activeForeground": "#9CA3AF",
        "editor.selectionBackground": "#F59E0B25",
        "editor.inactiveSelectionBackground": "#F59E0B15",
        "editorIndentGuide.background1": "#1E222D",
        "editorIndentGuide.activeBackground1": "#374151",
      },
    });
  };

  return (
    <div className="w-full h-full bg-[#0B0C10] overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="noct-dark"
        beforeMount={handleEditorWillMount}
        onChange={onChange}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          minimap: { enabled: true, maxColumn: 80 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          lineNumbersMinChars: 3,
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}