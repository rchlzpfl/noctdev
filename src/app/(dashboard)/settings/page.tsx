// src/app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentProfile, updateProfile } from "@/features/profile/actions/profile";
import { changeUserPassword } from "@/features/auth/actions/password";
import {
  User,
  Sliders,
  Sparkles,
  Shield,
  Check,
  Loader2,
  ExternalLink,
  Plus,
  X,
  Copy,
  Lock,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import noctdevLogo from "@/resources/images/noctdevmainlogo.jpeg";
import woodApplesLogoText from "@/resources/images/woodApplesLogoText.png";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "editor" | "ai" | "security">("profile");

  // Profile Form State
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Editor Preferences State (Stored in localStorage)
  const [fontSize, setFontSize] = useState("13");
  const [minimap, setMinimap] = useState(true);
  const [tabSize, setTabSize] = useState("2");

  // AI Preferences State (Stored in localStorage)
  const [aiProvider, setAiProvider] = useState("google");
  const [customKey, setCustomKey] = useState("");

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { profile, email: userEmail } = await getCurrentProfile();
        setEmail(userEmail);
        if (profile) {
          setUserId(profile.id);
          setUsername(profile.username || "");
          setFullName(profile.full_name || "");
          setBio(profile.bio || "");
          setTechStack(profile.tech_stack || []);
          setIsPublic(profile.is_public ?? false);
        }

        if (typeof window !== "undefined") {
          setFontSize(localStorage.getItem("noct_font_size") || "13");
          setMinimap(localStorage.getItem("noct_minimap") !== "false");
          setTabSize(localStorage.getItem("noct_tab_size") || "2");
          setAiProvider(localStorage.getItem("noct_ai_provider") || "google");
          setCustomKey(localStorage.getItem("noct_ai_key") || "");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!newTech.trim()) return;
    const tag = newTech.trim();
    if (!techStack.includes(tag)) {
      setTechStack((prev) => [...prev, tag]);
    }
    setNewTech("");
  };

  const handleRemoveTech = (tag: string) => {
    setTechStack((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage("");

    try {
      const res = await updateProfile({
        username,
        full_name: fullName,
        bio,
        tech_stack: techStack,
        is_public: isPublic,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update profile.");
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("noct_font_size", fontSize);
    localStorage.setItem("noct_minimap", String(minimap));
    localStorage.setItem("noct_tab_size", tabSize);
    localStorage.setItem("noct_ai_provider", aiProvider);
    localStorage.setItem("noct_ai_key", customKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await changeUserPassword(newPassword);
      if (!res.success) {
        setPasswordError(res.error || "Failed to change password.");
      } else {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-neutral-500 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
        <span>Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232733] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#232733] bg-[#16181F] shrink-0 shadow-md shadow-[#F59E0B]/5">
            <Image
              src={noctdevLogo}
              alt="NoctDev Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">Settings & Preferences</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure your developer showcase, Monaco editor, AI engines, and account security.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#232733] select-none">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "border-[#F59E0B] text-[#F6F6F8]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Developer Showcase</span>
        </button>

        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "editor"
              ? "border-[#F59E0B] text-[#F6F6F8]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Editor & Monaco</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "ai"
              ? "border-[#F59E0B] text-[#F6F6F8]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Engine</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "security"
              ? "border-[#F59E0B] text-[#F6F6F8]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: Profile & Showcase */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F6F6F8]">Public Showcase Visibility</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Allows recruiters and peers to view your public snippets and STAR achievements.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#0B0C10] peer-focus:outline-none border border-[#232733] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-[#0B0C10] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
              </label>
            </div>

            {isPublic && username && (
              <div className="p-3 rounded-lg bg-[#0B0C10] border border-[#F59E0B]/30 flex items-center justify-between">
                <span className="text-xs font-mono text-[#F59E0B]">
                  Your public link: /u/{username}
                </span>
                <Link
                  href={`/u/${username}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#F6F6F8]">Profile Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alexdev"
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">Display / Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Bio / Technical Focus</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Staff Engineer specializing in distributed databases and high-throughput APIs..."
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none resize-none"
              />
            </div>

            {/* Tech Stack Interactive Tags */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-neutral-400">Tech Stack Badges</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#0B0C10] border border-[#232733] rounded-lg min-h-[42px] items-center">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#16181F] border border-white/10 text-xs font-mono text-[#F6F6F8]"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-neutral-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Add tech (e.g. Go, Docker)..."
                    className="text-xs bg-transparent outline-none font-mono text-neutral-300 placeholder:text-neutral-600 px-2 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="p-1 text-neutral-500 hover:text-[#F59E0B]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Editor & Monaco Preferences */}
      {activeTab === "editor" && (
        <div className="bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-[#F6F6F8]">Monaco Workspace Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Editor Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
              >
                <option value="12">12px (Compact)</option>
                <option value="13">13px (Default)</option>
                <option value="14">14px (Medium)</option>
                <option value="16">16px (Large)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Tab Indentation</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Minimap</label>
              <select
                value={String(minimap)}
                onChange={(e) => setMinimap(e.target.value === "true")}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 cursor-pointer"
            >
              Apply Editor Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AI Engine Preferences */}
      {activeTab === "ai" && (
        <div className="bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#F6F6F8]">AI Scaffolding Engine</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Choose your active model or override the key locally in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Active Model</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
              >
                <option value="openrouter">OpenRouter Free Models (Auto-Rotating)</option>
                <option value="google">Google Gemini 1.5/2.0 Flash</option>
                <option value="openai">OpenAI Direct</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Custom API Key Override</label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Leave blank to use server environment variables"
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 cursor-pointer"
            >
              Save AI Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Password */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <form onSubmit={handleUpdatePassword} className="bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#F6F6F8] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F59E0B]" />
                <span>Change Account Password</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your new password below. It will update your Supabase Auth credentials immediately.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Password changed successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none font-mono"
                />
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 font-mono">
              Password must be at least 6 characters long.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="px-5 py-2 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organization & Platform Branding */}
      <div className="p-6 bg-[#16181F] border border-[#232733] rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
            <Image
              src={noctdevLogo}
              alt="NoctDev App Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F6F6F8]">NoctDev Platform</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Engineered for developer productivity, STAR interviewing, and code vault management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-[#232733] pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="block text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Created By</span>
            <span className="text-xs font-semibold text-neutral-300">WoodApples</span>
          </div>
          <div className="relative h-9 w-28 overflow-hidden flex items-center bg-black/40 px-3 py-1 rounded-lg border border-white/10">
            <Image
              src={woodApplesLogoText}
              alt="WoodApples Logo"
              className="object-contain h-6 w-auto"
              height={24}
            />
          </div>
        </div>
      </div>

      {/* Account Info Pill */}
      <div className="p-4 bg-[#16181F]/50 border border-[#232733] rounded-xl flex flex-col md:flex-row md:items-center justify-between text-xs text-neutral-400 gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#38BDF8]" />
          <span>Signed in as <strong className="text-white">{email}</strong></span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>ID: {userId.slice(0, 8)}...</span>
          <button
            onClick={() => navigator.clipboard.writeText(userId)}
            className="hover:text-white p-1 cursor-pointer"
            title="Copy User ID"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}