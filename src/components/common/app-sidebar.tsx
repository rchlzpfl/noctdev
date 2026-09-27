// src/components/common/app-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Code2, Kanban, AlertTriangle, Sparkles, Terminal, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Code Vault", href: "/vault", icon: Code2 },
  { name: "Kanban Board", href: "/kanban", icon: Kanban },
  { name: "Gotchas & Fixes", href: "/gotchas", icon: AlertTriangle },
  { name: "Interview Prep", href: "/interview", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleOpenScratchpad = () => {
    window.dispatchEvent(new CustomEvent("toggle-scratchpad"));
  };

  return (
    <aside className="w-64 border-r border-[#232733] bg-[#0B0C10] flex flex-col shrink-0 h-screen sticky top-0 select-none">
      <div className="h-16 flex items-center px-6 border-b border-[#232733] gap-3">
        <div className="p-2 rounded-lg bg-[#16181F] border border-white/5 text-[#F59E0B]">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-sm text-[#F6F6F8]">NOCTDEV</span>
          <span className="block text-[10px] text-neutral-500 font-mono tracking-wider">WORKSPACE // v1.0</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#16181F] text-[#F6F6F8] border border-white/10 shadow-sm shadow-[#F59E0B]/5"
                  : "text-neutral-400 hover:text-[#F6F6F8] hover:bg-[#16181F]/50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-[#F59E0B]" : "text-neutral-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Clickable Quick Scratchpad Drawer Trigger */}
      <button
        type="button"
        onClick={handleOpenScratchpad}
        className="text-left p-3.5 mx-3 mb-3 rounded-lg bg-[#16181F]/70 hover:bg-[#16181F] border border-[#232733] hover:border-[#F59E0B]/40 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
          <span className="font-mono font-medium group-hover:text-[#F59E0B] transition-colors">
            Scratchpad
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] text-neutral-300 font-mono">
            {isMac ? "⌘ + J" : "Ctrl + J"}
          </kbd>
        </div>
        <p className="text-[10px] text-neutral-500">Click or press hotkey to open</p>
      </button>

      <div className="p-3 border-t border-[#232733] flex items-center justify-between">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}