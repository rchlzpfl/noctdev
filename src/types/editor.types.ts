// src/types/editor.types.ts

export interface VirtualFile {
  id: string;
  path: string; // e.g. "src/components/button.tsx"
  name: string; // e.g. "button.tsx"
  content: string;
  language: string; // e.g. "typescript"
  isDirty?: boolean;
}

export interface VirtualFolder {
  id: string;
  name: string;
  path: string; // e.g. "src/components"
  files: VirtualFile[];
  folders: VirtualFolder[];
  isOpen?: boolean;
}

export interface VirtualTree {
  files: VirtualFile[];
  folders: VirtualFolder[];
}

export interface LineComment {
  id: string;
  fileId: string;
  lineNumber: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface EditorTab {
  fileId: string;
  path: string;
  name: string;
  language: string;
}