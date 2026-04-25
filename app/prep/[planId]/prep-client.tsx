"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, MessageSquareText } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { LoadingState } from "@/components/loading-state";
import { NavHeader } from "@/components/nav-header";
import type { StoredPlan } from "@/lib/types";
import { getStoredPlan } from "@/lib/storage";

export function PrepClient({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const stored = await getStoredPlan(planId);
        setPlan(stored);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load prep kit.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId]);

  if (loading) {
    return (
      <main>
        <NavHeader showSignOut />
        <LoadingState label="Loading prep kit..." />
      </main>
    );
  }

  if (!plan) {
    return (
      <main>
        <NavHeader showSignOut />
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <ErrorBanner message={error || "Prep kit not found. Open the dashboard sample or create a new plan."} />
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
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
          <ArrowLeft size={16} aria-hidden="true" />
          Dashboard
        </Link>
        <div className="mt-5">
          <p className="text-sm font-semibold text-leaf">Projects and interview prep</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{plan.targetRole} prep kit</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Three practical portfolio projects and five interview questions generated for this student profile.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <BriefcaseBusiness className="text-leaf" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-ink">Recommended projects</h2>
            </div>
            <div className="grid gap-4">
              {plan.projects.map((project) => (
                <article key={project.title} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-xl font-bold text-ink">{project.title}</h3>
                    <span className="rounded-lg bg-mint px-3 py-1 text-xs font-bold text-leaf">
                      {project.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/65">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <span key={skill} className="rounded-lg bg-skywash px-3 py-1 text-xs font-semibold text-ink/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-ink">Deliverables</p>
                    <ul className="mt-2 grid gap-2 text-sm text-ink/65">
                      {project.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareText className="text-coral" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-ink">Interview questions</h2>
            </div>
            <div className="grid gap-4">
              {plan.interviewQuestions.map((item, index) => (
                <article key={item.question} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-leaf">
                    Question {index + 1} · {item.skill}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-7 text-ink">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink/65">{item.idealAnswer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
