// src/app/(auth)/login/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Terminal, AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Official GitHub Vector
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// Official Google Vector
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Email + Password Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "register") {
        if (!username.trim()) {
          throw new Error("Please enter a username.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: username.trim().toLowerCase(),
            },
          },
        });

        if (error) throw error;

        // If session was returned immediately (Confirm email is off)
        if (data.session) {
          router.push("/vault");
          router.refresh();
        } else {
          setSuccessMsg("Account created! Check your email to confirm registration.");
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/vault");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // OAuth Provider Handler (GitHub or Google)
  const handleOAuth = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to authenticate with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#16181F] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F59E0B]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">NOCTDEV</h1>
            <p className="text-xs text-neutral-400">The developer&apos;s midnight vault</p>
          </div>
        </div>

        {/* Sign In vs Register Mode Switcher */}
        <div className="flex p-1 mb-6 rounded-lg bg-black/40 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-[#16181F] text-[#F6F6F8] shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#16181F] text-[#F6F6F8] shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="eric_noct"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-[#F6F6F8] placeholder:text-neutral-600 focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="dev@noct.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-[#F6F6F8] placeholder:text-neutral-600 focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-[#F6F6F8] placeholder:text-neutral-600 focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#F59E0B] text-black font-semibold text-xs hover:bg-[#F59E0B]/90 transition-all shadow-md shadow-[#F59E0B]/10 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading
              ? "Processing..."
              : mode === "register"
              ? "Create Free Vault Account"
              : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#16181F] px-2 text-[10px] text-neutral-500 font-mono tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>
        </div>

        {/* Direct Dev Bypass */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => router.push("/vault")}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 font-mono cursor-pointer"
          >
            [Dev Bypass: Enter Workspace Directly &rarr;]
          </button>
        </div>
      </div>
    </div>
  );
}