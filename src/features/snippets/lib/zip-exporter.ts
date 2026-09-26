// src/features/snippets/lib/zip-exporter.ts
import JSZip from "jszip";
import { VirtualFile } from "@/types/editor.types";

/**
 * Packages all virtual files into a .zip archive preserving relative directory paths.
 */
export async function exportWorkspaceToZip(
  snippetTitle: string,
  files: VirtualFile[]
): Promise<void> {
  const zip = new JSZip();

  // Add each file to its respective relative path in the zip
  for (const file of files) {
    // Normalize path by removing leading slash if present
    const cleanPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
    zip.file(cleanPath, file.content);
  }

  // Generate binary zip blob
  const content = await zip.generateAsync({ type: "blob" });

  // Trigger browser download
  const sanitizedTitle = snippetTitle
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-");
  const fileName = `${sanitizedTitle || "noct-snippet"}.zip`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}