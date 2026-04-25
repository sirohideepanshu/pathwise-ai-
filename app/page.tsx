import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, CheckCircle2, Route, Sparkles } from "lucide-react";
import { NavHeader } from "@/components/nav-header";

export default function LandingPage() {
  return (
    <main>
      <NavHeader />
      <section className="mx-auto grid min-h-[calc(100vh-66px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-leaf shadow-sm">
            <Sparkles size={16} aria-hidden="true" />
            AI career readiness for students
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-ink sm:text-6xl">
            Know what to learn next for your dream internship.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            PathWise AI detects skill gaps, builds a personalized action path, and turns weekly study time into
            portfolio projects, interview prep, and a clear readiness score.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-leaf px-5 py-3 font-semibold text-white"
            >
              Check my readiness
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="focus-ring inline-flex items-center justify-center rounded-lg border border-leaf/25 bg-white px-5 py-3 font-semibold text-leaf"
            >
              Try sample path
            </Link>
            <Link
              href="/auth"
              className="focus-ring inline-flex items-center justify-center rounded-lg border border-ink/15 bg-white px-5 py-3 font-semibold text-ink"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Skill gap detection", "Personalized action path", "Portfolio + interview prep"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <CheckCircle2 size={17} className="text-leaf" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-leaf text-white">
                <BrainCircuit aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Frontend Developer readiness</p>
                <p className="text-xs text-ink/55">48% ready for internship projects</p>
              </div>
            </div>
            <BadgeCheck className="text-leaf" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ["Week 1", "JS + React refresh", "done"],
              ["Week 2", "Typed components", "today"],
              ["Week 3", "API-driven UI", "next"]
            ].map(([week, title, state]) => (
              <div key={week} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-lg bg-ink/[0.035] p-3">
                <span className="text-xs font-bold uppercase text-ink/45">{week}</span>
                <span className="text-sm font-semibold text-ink">{title}</span>
                <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-leaf">{state}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-mint p-4">
              <Route className="text-leaf" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-ink">Portfolio-building path</p>
              <p className="mt-1 text-xs leading-5 text-ink/60">Projects chosen to prove role-ready skills.</p>
            </div>
            <div className="rounded-lg bg-skywash p-4">
              <Sparkles className="text-ink" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-ink">Interview readiness</p>
              <p className="mt-1 text-xs leading-5 text-ink/60">Practice questions tied to missing skills.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
