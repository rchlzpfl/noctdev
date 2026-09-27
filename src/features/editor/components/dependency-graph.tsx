// src/features/editor/components/dependency-graph.tsx
"use client";

import { useMemo, useState } from "react";
import { VirtualFile } from "@/types/editor.types";
import { detectLanguageByFilename } from "../lib/language-detector";
import { Network, FileCode, ArrowRight, Layers, Box } from "lucide-react";

interface DependencyGraphProps {
  files: VirtualFile[];
  activeFileId: string | null;
  onSelectFile: (file: VirtualFile) => void;
}

interface Node {
  id: string;
  name: string;
  path: string;
  language: string;
  badgeColor: string;
  lines: number;
  imports: string[];
}

export function DependencyGraph({ files, activeFileId, onSelectFile }: DependencyGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(activeFileId);

  // Parse files and detect imports
  const nodes: Node[] = useMemo(() => {
    return files.map((file) => {
      const langMeta = detectLanguageByFilename(file.path);
      const lines = file.content.split("\n").length;

      // Extract relative imports
      const importMatches = file.content.matchAll(/(?:import|from|require)\s*\(?['"]([^'"]+)['"]/g);
      const imports: string[] = [];

      for (const match of importMatches) {
        const importPath = match[1];
        if (importPath.startsWith(".") || importPath.startsWith("@/")) {
          // Normalize import path target
          const clean = importPath.replace(/^@\//, "").replace(/^\.\//, "");
          imports.push(clean);
        }
      }

      return {
        id: file.id,
        name: file.name,
        path: file.path,
        language: langMeta.language,
        badgeColor: langMeta.badgeColor,
        lines,
        imports,
      };
    });
  }, [files]);

  // Compute total edges
  const totalEdges = useMemo(() => {
    let count = 0;
    nodes.forEach((n) => {
      n.imports.forEach((imp) => {
        if (nodes.some((other) => other.path.includes(imp) || other.name.includes(imp))) {
          count++;
        }
      });
    });
    return count;
  }, [nodes]);

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;

  return (
    <div className="flex flex-col h-full bg-[#0B0C10] border-l border-[#232733] select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-10 bg-[#16181F] border-b border-[#232733] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono font-semibold text-[#F6F6F8]">Architecture & Dependency Graph</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1">
            <Box className="w-3 h-3 text-[#38BDF8]" />
            {nodes.length} Files
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#F59E0B]" />
            {totalEdges} Connections
          </span>
        </div>
      </div>

      {/* Main Interactive Map & Details */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Graph Grid */}
        <div className="flex-1 p-6 overflow-auto bg-[#090A0D] relative flex flex-wrap gap-4 items-start justify-center content-start">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  const originalFile = files.find((f) => f.id === node.id);
                  if (originalFile) onSelectFile(originalFile);
                }}
                style={{ borderColor: isSelected ? "#F59E0B" : "#232733" }}
                className={`p-4 rounded-xl bg-[#16181F] border hover:border-[#F59E0B]/60 transition-all cursor-pointer min-w-[200px] max-w-[260px] space-y-2 shadow-lg ${
                  isSelected ? "ring-2 ring-[#F59E0B]/30 shadow-[#F59E0B]/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: node.badgeColor, borderColor: `${node.badgeColor}40` }}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/40 border font-semibold"
                  >
                    {node.language}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">{node.lines} lines</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="text-xs font-semibold text-[#F6F6F8] truncate font-mono">{node.name}</span>
                </div>

                <p className="text-[10px] font-mono text-neutral-500 truncate">{node.path}</p>

                {node.imports.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                    <ArrowRight className="w-3 h-3 text-[#F59E0B]" />
                    <span>Imports {node.imports.length} target(s)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Sidebar */}
        {activeNode && (
          <div className="w-72 bg-[#0E0F14] border-l border-[#232733] p-4 space-y-4 shrink-0 overflow-y-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Selected Module</span>
              <h3 className="text-sm font-bold text-[#F6F6F8] font-mono truncate">{activeNode.name}</h3>
              <p className="text-xs font-mono text-neutral-400">{activeNode.path}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#16181F] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Language:</span>
                <span className="text-white font-semibold">{activeNode.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Lines:</span>
                <span className="text-white font-semibold">{activeNode.lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Dependencies:</span>
                <span className="text-[#F59E0B] font-semibold">{activeNode.imports.length} imports</span>
              </div>
            </div>

            {activeNode.imports.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Imports Detected</span>
                <div className="space-y-1">
                  {activeNode.imports.map((imp, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-neutral-300 truncate"
                    >
                      {imp}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
