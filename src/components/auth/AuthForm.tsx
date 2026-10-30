"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n/LanguageProvider";

type Mode = "sign-in" | "sign-up";

type Props = {
  mode: Mode;
};

export default function AuthForm({ mode }: Props) {
  const isSignUp = mode === "sign-up";
  const { signIn, signUp } = useAuth();
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isSignUp && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = isSignUp
      ? await signUp(name, email, password)
      : await signIn(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(async () => {
      try {
        const me = await fetch("/api/auth/me", { credentials: "include" });
        const data = await me.json();
        if (data?.user?.role === "admin") {
          router.push("/admin");
          return;
        }
      } catch {
        /* fall through */
      }
      router.push("/");
    }, 400);
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        <h2 className="mt-4 text-xl font-bold tracking-tight">
          {isSignUp ? "Account created" : "Signed in"}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Redirecting…</p>
        <a
          href="/admin"
          className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white"
        >
          Open Admin →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignUp && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            {t.auth.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          {t.auth.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isSignUp && (
        <div className="flex justify-end">
          <Link
            href="/sign-in/forgot"
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSignUp ? t.auth.createAccount : t.auth.signIn}
      </button>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        Demo: user@tappath.com / user1234 · admin@tappath.com / admin1234
      </p>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">{t.auth.or}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setError("Connect Google OAuth via Clerk or Auth.js for production.")}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]"
      >
        {t.auth.continueGoogle}
      </button>
    </form>
  );
}
