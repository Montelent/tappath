"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {isSignUp ? t.auth.createAccount : t.auth.signIn}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {isSignUp ? (
            <>
              {t.auth.haveAccount}{" "}
              <Link href="/sign-in" className="font-medium text-brand-600 underline-offset-2 hover:underline">
                {t.auth.signIn}
              </Link>
            </>
          ) : (
            <>
              {t.auth.noAccount}{" "}
              <Link href="/sign-up" className="font-medium text-brand-600 underline-offset-2 hover:underline">
                {t.auth.createAccount}
              </Link>
            </>
          )}
        </p>
      </div>

      {isSignUp && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.auth.name}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t.auth.email}</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t.auth.password}</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={8}
        />
      </div>

      {!isSignUp && (
        <div className="text-right text-sm">
          <Link href="/sign-in/forgot" className="text-brand-600 underline-offset-2 hover:underline">
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
    </form>
  );
}
