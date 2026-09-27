// src/features/editor/components/ai-auditor-modal.tsx
"use client";

import { useState } from "react";
import { VirtualFile } from "@/types/editor.types";
import { Sparkles, Shield, AlertTriangle, X, Loader2, ArrowRight } from "lucide-react";

interface AuditIssue {
  severity: "high" | "medium" | "low";
  line?: number;
  title: string;
  description: string;
  suggestedFix?: string;
}

interface AuditResult {
  qualityScore: number;
  securityRating: string;
  summary: string;
  issues: AuditIssue[];
}

interface AiAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: VirtualFile | null;
  allFiles: VirtualFile[];
  onApplyFix?: (fixedCode: string) => void;
}

export function AiAuditorModal({
  isOpen,
  onClose,
  activeFile,
  allFiles,
  onApplyFix,
}: AiAuditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    if (!activeFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: activeFile.path,
          code: activeFile.content,
          allFiles: allFiles.map((f) => ({ path: f.path, content: f.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed.");

      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#16181F] border border-[#232733] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232733] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F6F6F8]">AI Security & Architecture Auditor</h2>
              <p className="text-xs text-neutral-400">
                Auditing: <span className="font-mono text-white">{activeFile?.path || "Active File"}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!result && !loading && !error && (
          <div className="p-8 border border-dashed border-[#232733] rounded-xl text-center space-y-3 bg-[#0B0C10]/40">
            <Shield className="w-10 h-10 text-[#38BDF8] mx-auto opacity-80" />
            <h3 className="text-sm font-semibold text-[#F6F6F8]">Scan Active File for Vulnerabilities & Performance</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Our AI engine inspects memory leaks, unhandled async promises, XSS vectors, and hardcoded secrets.
            </p>
            <button
              onClick={handleRunAudit}
              className="mt-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0B0C10] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-[#F59E0B]/20 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Audit</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center font-mono text-xs text-neutral-400 space-y-3">
            <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto" />
            <p>Auditing AST tree, static types, and vulnerability vectors...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Score & Rating Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#0B0C10] border border-white/5 rounded-xl text-center">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Quality Score</span>
                <span className="text-2xl font-bold font-mono text-[#F59E0B]">{result.qualityScore}/100</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Security Rating</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    result.securityRating.startsWith("A")
                      ? "text-emerald-400"
                      : result.securityRating === "B"
                      ? "text-[#38BDF8]"
                      : "text-red-400"
                  }`}
                >
                  {result.securityRating}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Issues Detected</span>
                <span className="text-2xl font-bold font-mono text-[#F6F6F8]">{result.issues.length}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-[#16181F] border border-[#232733] rounded-xl text-xs text-neutral-300 leading-relaxed font-mono">
              <span className="text-neutral-500 block text-[10px] uppercase mb-1">Executive Summary</span>
              {result.summary}
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Detailed Findings</h4>
              {result.issues.map((issue, idx) => (
                <div key={idx} className="p-3 bg-[#0B0C10] border border-[#232733] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold border ${
                        issue.severity === "high"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : issue.severity === "medium"
                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                          : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                      }`}
                    >
                      {issue.severity} severity
                    </span>
                    {issue.line && <span className="text-[10px] font-mono text-neutral-500">Line {issue.line}</span>}
                  </div>

                  <h5 className="text-xs font-semibold text-[#F6F6F8]">{issue.title}</h5>
                  <p className="text-xs text-neutral-400 leading-normal">{issue.description}</p>

                  {issue.suggestedFix && (
                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                      <code className="text-[11px] font-mono text-emerald-300 bg-black/40 px-2 py-1 rounded truncate max-w-sm">
                        {issue.suggestedFix}
                      </code>
                      {onApplyFix && (
                        <button
                          onClick={() => issue.suggestedFix && onApplyFix(issue.suggestedFix)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
