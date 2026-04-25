"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { LoadingState } from "@/components/loading-state";
import { NavHeader } from "@/components/nav-header";
import { WeekProgressToggle } from "@/components/week-progress-toggle";
import type { StoredPlan } from "@/lib/types";
import { getStoredPlan, updateWeekProgress } from "@/lib/storage";

export function RoadmapClient({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const stored = await getStoredPlan(planId);
        setPlan(stored);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load roadmap.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId]);

  async function toggleWeek(weekNumber: number, completed: boolean) {
    if (!plan) return;
    const previous = plan;
    setSavingWeek(weekNumber);
    setPlan({ ...plan, progress: { ...plan.progress, [weekNumber]: completed } });
    try {
      await updateWeekProgress(plan.id, weekNumber, completed);
    } catch (saveError) {
      setPlan(previous);
      setError(saveError instanceof Error ? saveError.message : "Could not save progress.");
    } finally {
      setSavingWeek(null);
    }
  }

  if (loading) {
    return (
      <main>
        <NavHeader showSignOut />
        <LoadingState label="Opening roadmap..." />
      </main>
    );
  }

  if (!plan) {
    return (
      <main>
        <NavHeader showSignOut />
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <ErrorBanner message={error || "Roadmap not found. Create a new plan or open the dashboard sample."} />
          <Link href="/dashboard" className="mt-4 inline-flex font-semibold text-leaf">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <NavHeader showSignOut />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
          <ArrowLeft size={16} aria-hidden="true" />
          Dashboard
        </Link>
        <div className="mt-5">
          <p className="text-sm font-semibold text-leaf">Roadmap details</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{plan.targetRole}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">{plan.readinessSummary}</p>
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorBanner message={error} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {plan.roadmap.map((week) => (
            <article key={week.weekNumber} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <WeekProgressToggle
                    checked={Boolean(plan.progress[week.weekNumber])}
                    disabled={savingWeek === week.weekNumber}
                    onChange={(checked) => toggleWeek(week.weekNumber, checked)}
                  />
                  <div>
                    <p className="text-sm font-bold text-leaf">Week {week.weekNumber}</p>
                    <h2 className="mt-1 text-2xl font-bold text-ink">{week.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{week.focus}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg bg-skywash px-3 py-2 text-sm font-semibold text-ink/70">
                  <Clock size={16} aria-hidden="true" />
                  {week.estimatedHours} hrs
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-bold text-ink">
                    <CheckCircle2 size={17} className="text-leaf" aria-hidden="true" />
                    Outcomes
                  </div>
                  <ul className="space-y-2 text-sm leading-5 text-ink/65">
                    {week.outcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 font-bold text-ink">
                    <ListChecks size={17} className="text-coral" aria-hidden="true" />
                    Tasks
                  </div>
                  <ul className="space-y-2 text-sm leading-5 text-ink/65">
                    {week.tasks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 font-bold text-ink">
                    <BookOpen size={17} className="text-ink" aria-hidden="true" />
                    Resources
                  </div>
                  <ul className="space-y-2 text-sm leading-5 text-ink/65">
                    {week.resources.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
