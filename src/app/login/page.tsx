"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email for the magic link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split("@")[0],
              display_name: username || email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        setMessage("Account created. Check email or log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-display font-bold mb-4 shadow-xl shadow-primary/30">
            P
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Peeny
          </h1>
          <p className="text-sm text-muted mt-1">
            AI video for African creators
          </p>
        </div>

        <div className="flex rounded-full glass p-1 mb-6">
          {(["login", "signup", "magic"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setMessage(null);
              }}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors",
                mode === m
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted hover:text-foreground"
              )}
            >
              {m === "magic" ? "Magic" : m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted mb-1.5 block font-medium">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {mode !== "magic" && (
            <div>
              <label className="text-xs text-muted mb-1.5 block font-medium">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-mint bg-mint/10 rounded-xl px-3 py-2">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-primary/25"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : mode === "signup"
                  ? "Create account"
                  : "Send magic link"}
          </button>
        </form>
      </div>
    </div>
  );
}
