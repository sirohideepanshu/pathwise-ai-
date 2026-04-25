"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, LogIn, Play } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { NavHeader } from "@/components/nav-header";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { startDemoSession } from "@/lib/storage";

export default function AuthPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("student@pathwise.ai");
  const [password, setPassword] = useState("pathwise-demo");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function enterDemo() {
    startDemoSession();
    router.push("/dashboard");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      enterDemo();
      return;
    }

    setLoading(true);
    const authCall =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error: authError } = await authCall;
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. If email confirmation is enabled, confirm your email, or use demo mode.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main>
      <NavHeader />
      <section className="mx-auto grid min-h-[calc(100vh-66px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <div className="inline-flex rounded-lg bg-mint px-3 py-2 text-sm font-semibold text-leaf">
            Judge-ready demo access
          </div>
          <h1 className="mt-5 text-4xl font-black text-ink">Open a polished sample readiness path instantly.</h1>
          <p className="mt-4 text-base leading-7 text-ink/65">
            Use demo mode for a complete student flow with sample AI-generated guidance, progress tracking, projects,
            and interview prep. Sign in when you want saved Supabase-backed plans.
          </p>
          <button
            type="button"
            onClick={enterDemo}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-leaf px-5 py-3 font-semibold text-white"
          >
            <Play size={18} aria-hidden="true" />
            Try demo path
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <KeyRound aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-ink">Student sign in</h2>
              <p className="text-sm text-ink/55">
                {configured ? "Save personalized plans to Supabase" : "Demo mode is ready for evaluation"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-lg bg-ink/[0.04] p-1">
            {(["signin", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold ${
                  mode === item ? "bg-white text-ink shadow-sm" : "text-ink/60"
                }`}
              >
                {item === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="focus-ring mt-2 w-full rounded-lg border border-ink/15 px-3 py-3 text-ink"
            required
          />

          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-2 w-full rounded-lg border border-ink/15 px-3 py-3 text-ink"
            minLength={6}
            required
          />

          {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
          {message ? <p className="mt-4 rounded-lg bg-mint px-4 py-3 text-sm font-medium text-leaf">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} aria-hidden="true" />
            {loading ? "Working..." : configured ? (mode === "signin" ? "Sign in" : "Create account") : "Continue to demo"}
          </button>
          <p className="mt-4 text-center text-sm text-ink/55">
            Want the fastest walkthrough? <Link className="font-semibold text-leaf" href="/dashboard" onClick={enterDemo}>Open sample readiness dashboard</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
