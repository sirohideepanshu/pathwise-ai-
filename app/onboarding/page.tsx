"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, WandSparkles } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { NavHeader } from "@/components/nav-header";
import type { CareerInput, GeneratePlanResponse, StudentLevel } from "@/lib/types";
import { saveGeneratedPlan, startDemoSession } from "@/lib/storage";
import { toSkillList } from "@/lib/utils";
import { validateCareerInput } from "@/lib/validators";

const roleOptions = ["Frontend Developer", "Data Analyst", "ML Engineer", "Backend Developer", "UX Designer"];
const levels: StudentLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function OnboardingPage() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [customRole, setCustomRole] = useState("");
  const [skills, setSkills] = useState("Excel, SQL basics, Python basics");
  const [currentLevel, setCurrentLevel] = useState<StudentLevel>("Beginner");
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [targetTimeline, setTargetTimeline] = useState("8 weeks");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const input: CareerInput = {
      targetRole: customRole.trim() || targetRole,
      currentSkills: toSkillList(skills),
      currentLevel,
      weeklyHours,
      targetTimeline: targetTimeline.trim() || undefined
    };

    const validation = validateCareerInput(input);
    if (!validation.ok) {
      setError(Object.values(validation.errors)[0] ?? "Please check the form.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = (await response.json()) as GeneratePlanResponse & { error?: string };
      if (!response.ok || !payload.plan) throw new Error(payload.error || "Plan generation failed.");

      if (payload.warning) setNotice(payload.warning);
      const stored = await saveGeneratedPlan(input, payload.plan, payload.source, payload.warning);
      router.push(`/dashboard?plan=${stored.id}`);
    } catch (generationError) {
      startDemoSession();
      setError(
        generationError instanceof Error
          ? "We could not generate a fresh plan right now. The sample readiness path is still available for evaluation."
          : "The sample readiness path is still available for evaluation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <NavHeader showSignOut />
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-leaf">Career readiness scan</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Build your personalized action path.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Add your target role, current skills, and weekly study time. PathWise will detect gaps, generate a focused
            roadmap, and turn the plan into portfolio and interview prep.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor="role">
                Target role
              </label>
              <select
                id="role"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                className="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-3 text-ink"
              >
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor="customRole">
                Custom role
              </label>
              <input
                id="customRole"
                value={customRole}
                onChange={(event) => setCustomRole(event.target.value)}
                placeholder="Optional"
                className="focus-ring mt-2 w-full rounded-lg border border-ink/15 px-3 py-3 text-ink"
              />
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="skills">
            Current skills
          </label>
          <textarea
            id="skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            rows={3}
            placeholder="React basics, Python, Excel..."
            className="focus-ring mt-2 w-full resize-none rounded-lg border border-ink/15 px-3 py-3 text-ink"
          />

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor="level">
                Current level
              </label>
              <select
                id="level"
                value={currentLevel}
                onChange={(event) => setCurrentLevel(event.target.value as StudentLevel)}
                className="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-3 text-ink"
              >
                {levels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor="hours">
                Hours per week
              </label>
              <input
                id="hours"
                type="number"
                min={1}
                max={40}
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(Number(event.target.value))}
                className="focus-ring mt-2 w-full rounded-lg border border-ink/15 px-3 py-3 text-ink"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor="timeline">
                Target timeline
              </label>
              <input
                id="timeline"
                value={targetTimeline}
                onChange={(event) => setTargetTimeline(event.target.value)}
                placeholder="Optional"
                className="focus-ring mt-2 w-full rounded-lg border border-ink/15 px-3 py-3 text-ink"
              />
            </div>
          </div>

          {notice ? <p className="mt-5 rounded-lg bg-gold/20 px-4 py-3 text-sm font-medium text-ink">{notice}</p> : null}
          {error ? <div className="mt-5"><ErrorBanner message={error} /></div> : null}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <WandSparkles size={18} aria-hidden="true" />}
            {loading ? "Analyzing readiness..." : "Generate readiness plan"}
            {!loading ? <ArrowRight size={18} aria-hidden="true" /> : null}
          </button>
        </form>
      </section>
    </main>
  );
}
