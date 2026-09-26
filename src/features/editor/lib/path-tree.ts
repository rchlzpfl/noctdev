// src/features/editor/lib/path-tree.ts
import { VirtualFile, VirtualFolder, VirtualTree } from "@/types/editor.types";

/**
 * Transforms a flat array of VirtualFiles with path strings (e.g. "src/lib/utils.ts")
 * into a structured tree of nested folders and files for the sidebar UI.
 */
export function buildVirtualTree(files: VirtualFile[]): VirtualTree {
  const rootTree: VirtualTree = {
    files: [],
    folders: [],
  };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);

    // Root-level file (e.g., "package.json")
    if (parts.length === 1) {
      rootTree.files.push(file);
      continue;
    }

    // Nested file (e.g., "src/auth/route.ts")
    let currentFolders = rootTree.folders;
    let currentPath = "";

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      let folder = currentFolders.find((f) => f.name === folderName);

      if (!folder) {
        folder = {
          id: `folder-${currentPath}`,
          name: folderName,
          path: currentPath,
          files: [],
          folders: [],
          isOpen: true,
        };
        currentFolders.push(folder);
      }

      currentFolders = folder.folders;

      // If we are at the immediate parent folder of the file
      if (i === parts.length - 2) {
        folder.files.push(file);
      }
    }
  }

  // Sort alphabetically: folders first, then files
  const sortFolders = (folders: VirtualFolder[]) => {
    folders.sort((a, b) => a.name.localeCompare(b.name));
    for (const f of folders) {
      f.files.sort((a, b) => a.name.localeCompare(b.name));
      sortFolders(f.folders);
    }
  };

  sortFolders(rootTree.folders);
  rootTree.files.sort((a, b) => a.name.localeCompare(b.name));

  return rootTree;
}