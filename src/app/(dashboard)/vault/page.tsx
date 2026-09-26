// src/app/(dashboard)/vault/page.tsx
import { Plus, FolderGit2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-[#232733] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F6F6F8]">Snippet Vault</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Multi-file boilerplates, configuration recipes, and verified snippets.
          </p>
        </div>

        <Link
          href="/vault/demo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F59E0B] text-black font-semibold text-xs hover:bg-[#F59E0B]/90 transition-all shadow-md shadow-[#F59E0B]/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Multi-File Snippet</span>
        </Link>
      </div>

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Clickable Starter Snippet Card */}
        <Link
          href="/vault/demo"
          className="group p-5 rounded-xl bg-[#16181F] border border-[#232733] hover:border-[#F59E0B]/40 transition-all flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[10px] font-mono text-[#F59E0B]">
                Next.js 16 + Supabase
              </span>
              <ShieldCheck className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-sm text-[#F6F6F8] group-hover:text-white transition-colors">
              Supabase SSR Client & Middleware
            </h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
              Clean separation for server, client, and proxy session handlers with cookie forwarding.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-3 border-t border-white/5 font-mono">
            <span className="flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" /> 3 files
            </span>
            <span className="flex items-center gap-1 group-hover:text-[#F59E0B] transition-colors">
              Open Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}