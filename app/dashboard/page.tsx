"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListChecks,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { LoadingState } from "@/components/loading-state";
import { NavHeader } from "@/components/nav-header";
import { ReadinessMeter } from "@/components/readiness-meter";
import { WeekProgressToggle } from "@/components/week-progress-toggle";
import type { ProjectRecommendation, RoadmapWeek, StoredPlan } from "@/lib/types";
import { getCurrentUser, getStoredPlans, startDemoSession, updateWeekProgress } from "@/lib/storage";
import { clamp } from "@/lib/utils";

const DEMO_NOTICE = "Demo mode: sample AI-generated roadmap loaded for evaluation.";

function SectionCard({
  title,
  eyebrow,
  icon,
  children,
  action,
  className = ""
}: {
  title: string;
  eyebrow?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-ink/10 bg-white p-5 shadow-soft ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-leaf">{icon}</span>
          <div>
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-leaf">{eyebrow}</p> : null}
            <h2 className="text-xl font-bold text-ink">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-ink/10" aria-label={`Progress ${value}%`}>
      <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function getPriorityLabel(plan: StoredPlan) {
  const high = plan.missingSkills.filter((skill) => skill.priority === "High");
  return high.length ? high.map((skill) => skill.skill).slice(0, 3) : plan.missingSkills.map((skill) => skill.skill).slice(0, 3);
}

function getPlanConsistency(plan: StoredPlan) {
  const roadmapScore = plan.roadmap.length >= 6 ? 34 : 18;
  const projectScore = clamp(Math.round((plan.projects.length / 3) * 26), 0, 26);
  const interviewScore = clamp(Math.round((plan.interviewQuestions.length / 5) * 22), 0, 22);
  const actionScore = plan.nextBestAction?.whatToDoToday ? 18 : 0;
  return clamp(roadmapScore + projectScore + interviewScore + actionScore, 0, 100);
}

function getReadiness(plan: StoredPlan, progressPercent: number) {
  const skillMatch = clamp(plan.readinessScore, 0, 100);
  const planConsistency = getPlanConsistency(plan);
  const score = Math.round(skillMatch * 0.5 + progressPercent * 0.35 + planConsistency * 0.15);
  return { score: clamp(score, 0, 100), skillMatch, progressPercent, planConsistency };
}

function getInsight(plan: StoredPlan, readinessScore: number) {
  const blockers = getPriorityLabel(plan);
  const firstBlocker = blockers[0] ?? plan.nextBestAction.topicToStudyNext;
  return {
    why: plan.aiInsight.whyGenerated ||
      `PathWise matched your ${plan.input.currentLevel.toLowerCase()} profile, current skills, and ${plan.input.weeklyHours} weekly study hours against ${plan.targetRole} expectations.`,
    gaps: plan.aiInsight.biggestGaps || (blockers.length
      ? `Your biggest blockers are ${blockers.join(", ")}.`
      : `Your skill profile is close; the next win is stronger portfolio proof.`),
    path:
      plan.aiInsight.fastestPath ||
      `The fastest improvement path is to complete the next roadmap week, ship one visible project milestone, and practice interview answers around ${firstBlocker}.`,
    focus:
      plan.aiInsight.focusFirst ||
      `Start with ${plan.nextBestAction.topicToStudyNext}. This is the highest-leverage topic for moving beyond ${readinessScore}% readiness.`
  };
}

function getTimeToReadiness(plan: StoredPlan, readinessScore: number, completedWeeks: number) {
  if (readinessScore >= 70) return "Already above 70%";
  const remainingWeeks = Math.max(plan.roadmap.length - completedWeeks, 1);
  const remainingScore = 70 - readinessScore;
  const weeklyLift = Math.max(4, Math.round((plan.input.weeklyHours / 8) * 7 + 3));
  const estimatedWeeks = clamp(Math.ceil(remainingScore / weeklyLift), 1, remainingWeeks + 2);
  const hours = estimatedWeeks * plan.input.weeklyHours;
  return `${estimatedWeeks} week${estimatedWeeks === 1 ? "" : "s"} / about ${hours} focused hours`;
}

function getOptimalReasoning(plan: StoredPlan, nextWeek: RoadmapWeek) {
  const blockers = getPriorityLabel(plan);
  return [
    plan.planRationale.skillPriority ||
      `Priority is based on the highest-impact gaps for ${plan.targetRole}: ${blockers.join(", ") || plan.nextBestAction.topicToStudyNext}.`,
    plan.planRationale.orderReasoning ||
      "The order starts with foundations, moves into portfolio proof, then finishes with interview readiness so each week builds on the last.",
    plan.planRationale.timelineFit ||
      `The timeline fits your ${plan.input.weeklyHours} hours/week pace by keeping each milestone small enough to complete and show.`
  ];
}

function getRiskWarnings(plan: StoredPlan) {
  if (plan.riskWarnings.length) return plan.riskWarnings;
  const topSkill = getPriorityLabel(plan)[0] ?? plan.nextBestAction.topicToStudyNext;
  const firstProject = plan.projects[0]?.title ?? "your first portfolio project";
  return [
    {
      risk: `Skipping ${topSkill}`,
      impact: "Readiness growth slows because later roadmap weeks depend on this foundation."
    },
    {
      risk: `Ignoring ${firstProject}`,
      impact: "Portfolio strength weakens even if the learning path is completed."
    },
    {
      risk: "Delaying interview practice",
      impact: "Skill gaps can stay hidden until the final week, when they are harder to fix."
    }
  ];
}

function getEnhancedAction(plan: StoredPlan, nextWeek: RoadmapWeek) {
  const firstTask = nextWeek.tasks[0] ?? plan.nextBestAction.whatToDoToday;
  return {
    task: plan.nextBestAction.whatToDoToday || firstTask,
    why:
      plan.nextBestAction.whyItMatters ||
      `This directly attacks ${plan.nextBestAction.topicToStudyNext}, the next skill most likely to raise readiness for ${plan.targetRole}.`,
    outcome:
      plan.nextBestAction.expectedOutcome ??
      nextWeek.outcomes[0] ??
      `A visible improvement in ${plan.nextBestAction.topicToStudyNext}.`,
    next:
      plan.nextBestAction.whatComesNext ??
      nextWeek.tasks[1] ??
      `Apply it inside ${plan.projects[0]?.title ?? "your first portfolio project"}.`
  };
}

function getWeekStatus(week: RoadmapWeek, plan: StoredPlan, nextWeekNumber: number) {
  if (plan.progress[week.weekNumber]) return "Complete";
  if (week.weekNumber === nextWeekNumber) return "Today";
  return "Queued";
}

function getProjectWhy(project: ProjectRecommendation) {
  const skills = project.skills.slice(0, 2).join(" + ");
  return `Proves ${skills || "role-ready"} skills in a portfolio artifact judges and recruiters can inspect.`;
}

function getProjectOutcome(project: ProjectRecommendation) {
  return project.deliverables[0] ?? "A portfolio-ready project milestone";
}

export default function DashboardPage() {
  const [plans, setPlans] = useState<StoredPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) startDemoSession();
        const storedPlans = await getStoredPlans();
        setPlans(storedPlans);
        const requested = new URLSearchParams(window.location.search).get("plan");
        setActivePlanId(requested || storedPlans[0]?.id || "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load your readiness dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId) ?? plans[0],
    [activePlanId, plans]
  );

  async function toggleWeek(weekNumber: number, completed: boolean) {
    if (!activePlan) return;
    setSavingWeek(weekNumber);
    setError("");
    const previous = plans;
    setPlans((current) =>
      current.map((plan) =>
        plan.id === activePlan.id ? { ...plan, progress: { ...plan.progress, [weekNumber]: completed } } : plan
      )
    );
    try {
      await updateWeekProgress(activePlan.id, weekNumber, completed);
    } catch (saveError) {
      setPlans(previous);
      setError(saveError instanceof Error ? saveError.message : "Could not update progress.");
    } finally {
      setSavingWeek(null);
    }
  }

  if (loading) {
    return (
      <main>
        <NavHeader showSignOut />
        <LoadingState label="Preparing your career readiness dashboard..." />
      </main>
    );
  }

  if (!activePlan) {
    return (
      <main>
        <NavHeader showSignOut />
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <EmptyState />
        </section>
      </main>
    );
  }

  const totalWeeks = activePlan.roadmap.length || 1;
  const completed = activePlan.roadmap.filter((week) => activePlan.progress[week.weekNumber]).length;
  const progressPercent = Math.round((completed / totalWeeks) * 100);
  const nextWeek = activePlan.roadmap.find((week) => !activePlan.progress[week.weekNumber]) ?? activePlan.roadmap[0];
  const readiness = getReadiness(activePlan, progressPercent);
  const insight = getInsight(activePlan, readiness.score);
  const blockers = getPriorityLabel(activePlan);
  const timeToReadiness = getTimeToReadiness(activePlan, readiness.score, completed);
  const optimalReasoning = getOptimalReasoning(activePlan, nextWeek);
  const riskWarnings = getRiskWarnings(activePlan);
  const enhancedAction = getEnhancedAction(activePlan, nextWeek);
  const visibleQuestions = showAllQuestions ? activePlan.interviewQuestions : activePlan.interviewQuestions.slice(0, 2);
  const isDemo = activePlan.source === "demo" || activePlan.source === "fallback" || Boolean(activePlan.warning);

  return (
    <main>
      <NavHeader showSignOut />
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-leaf">Career readiness dashboard</p>
              <span className="inline-flex items-center gap-1 rounded-lg border border-leaf/20 bg-white px-2 py-1 text-xs font-bold text-leaf">
                <Sparkles size={13} aria-hidden="true" />
                Powered by Google Gemini
              </span>
            </div>
            <h1 className="mt-2 text-4xl font-black text-ink">Your personalized action path</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              Skill gap detection, portfolio-building steps, interview preparation, and progress tracking in one judge-ready view.
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              Designed to reduce time-to-job-readiness by focusing only on high-impact skills.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {plans.length > 1 ? (
              <select
                value={activePlan.id}
                onChange={(event) => setActivePlanId(event.target.value)}
                className="focus-ring rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm font-semibold text-ink"
                aria-label="Select roadmap"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.targetRole}
                  </option>
                ))}
              </select>
            ) : null}
            <Link
              href="/onboarding"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white"
            >
              <Sparkles size={16} aria-hidden="true" />
              Generate new plan
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-5">
            <ErrorBanner message={error} />
          </div>
        ) : null}
        {isDemo ? (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-leaf/15 bg-mint px-4 py-3 text-sm font-semibold text-leaf">
            <Sparkles size={17} aria-hidden="true" />
            {DEMO_NOTICE}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_0.85fr_1fr]">
          <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-bold text-leaf">
              <Target size={18} aria-hidden="true" />
              Goal Summary
            </div>
            <h2 className="mt-4 text-2xl font-black text-ink">{activePlan.targetRole}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/64">
              Built for a {activePlan.input.currentLevel.toLowerCase()} student with {activePlan.input.weeklyHours} hours/week.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activePlan.input.currentSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-lg bg-skywash px-2.5 py-1 text-xs font-bold text-ink/70">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-bold text-leaf">
              <BrainCircuit size={18} aria-hidden="true" />
              AI Insight Summary
            </div>
            <p className="mt-4 rounded-lg bg-mint px-3 py-2 text-xs font-bold text-leaf">
              This roadmap and analysis were generated using Gemini based on your inputs.
            </p>
            <p className="mt-3 text-sm leading-6 text-ink/70">{insight.why}</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-ink">{insight.gaps}</p>
          </section>

          <section className="rounded-lg border border-leaf/20 bg-white p-5 text-center shadow-soft">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-leaf">
              <TrendingUp size={18} aria-hidden="true" />
              Readiness Score
            </div>
            <div className="mt-3 flex justify-center">
              <ReadinessMeter score={readiness.score} />
            </div>
            <div className="mt-3 rounded-lg bg-skywash px-3 py-2">
              <p className="text-xs font-bold uppercase text-ink/50">Time to 70%</p>
              <p className="mt-1 text-sm font-black text-ink">{timeToReadiness}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-ink/58">
              Based on skill match, roadmap completion, and plan consistency.
            </p>
          </section>

          <section className="rounded-lg border border-leaf/15 bg-ink p-5 text-white shadow-soft">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              <CalendarCheck2 size={18} aria-hidden="true" />
              Next Best Action
            </div>
            <h2 className="mt-4 text-xl font-black leading-7">{activePlan.nextBestAction.topicToStudyNext}</h2>
            <div className="mt-3 grid gap-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-mint/70">Task</p>
                <p className="mt-1 leading-6 text-white/85">{enhancedAction.task}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-mint/70">Why it matters</p>
                <p className="mt-1 leading-6 text-white/78">{enhancedAction.why}</p>
              </div>
              <div className="grid gap-2 rounded-lg bg-white/10 p-3">
                <p className="font-semibold">Expected outcome: {enhancedAction.outcome}</p>
                <p className="text-white/75">Next: {enhancedAction.next}</p>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold">
              <Clock size={16} aria-hidden="true" />
              {activePlan.nextBestAction.estimatedTime}
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Career readiness snapshot</p>
              <h2 className="mt-2 text-3xl font-black text-ink">
                You are {readiness.score}% ready for {activePlan.targetRole}.
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink/64">{insight.path}</p>
            </div>
            <div className="rounded-lg bg-coral/10 p-4">
              <p className="text-xs font-bold uppercase text-coral">Top blockers</p>
              <div className="mt-3 grid gap-2">
                {blockers.map((blocker) => (
                  <div key={blocker} className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="h-2 w-2 rounded-full bg-coral" />
                    {blocker}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-mint p-4">
              <p className="text-xs font-bold uppercase text-leaf">Fastest improvement path</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-ink">{insight.focus}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Why this plan is optimal"
            eyebrow="AI reasoning"
            icon={<BadgeCheck size={20} aria-hidden="true" />}
          >
            <div className="grid gap-3">
              {optimalReasoning.map((reason, index) => (
                <div key={reason} className="grid grid-cols-[32px_1fr] gap-3 rounded-lg bg-ink/[0.035] p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-leaf text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-6 text-ink/70">{reason}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Risks if ignored" eyebrow="Readiness risks" icon={<ShieldAlert size={20} aria-hidden="true" />}>
            <div className="grid gap-3">
              {riskWarnings.map((risk) => (
                <div key={risk.risk} className="rounded-lg border border-coral/15 bg-coral/10 p-4">
                  <p className="text-sm font-bold text-ink">{risk.risk}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/68">{risk.impact}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="grid gap-6">
            <SectionCard title="Skill Gap Detection" eyebrow="Missing skills" icon={<BrainCircuit size={20} aria-hidden="true" />}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {activePlan.missingSkills.map((skill) => (
                  <li key={skill.skill} className="rounded-lg border border-ink/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-ink">{skill.skill}</p>
                      <span className="rounded-lg bg-coral/10 px-2 py-1 text-xs font-bold text-coral">
                        {skill.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/62">{skill.why}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard
              title="Weekly Readiness Roadmap"
              eyebrow="Personalized action path"
              icon={<BookOpenCheck size={20} aria-hidden="true" />}
              action={
                <Link href={`/roadmap/${activePlan.id}`} className="hidden text-sm font-bold text-leaf sm:inline-flex">
                  Full view
                </Link>
              }
            >
              <div className="grid gap-3">
                {activePlan.roadmap.map((week) => {
                  const status = getWeekStatus(week, activePlan, nextWeek.weekNumber);
                  return (
                    <article key={week.weekNumber} className="rounded-lg border border-ink/10 bg-ink/[0.025] p-4">
                      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                        <WeekProgressToggle
                          checked={Boolean(activePlan.progress[week.weekNumber])}
                          disabled={savingWeek === week.weekNumber}
                          onChange={(checked) => toggleWeek(week.weekNumber, checked)}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-ink">
                              Week {week.weekNumber}: {week.title}
                            </h3>
                            <span
                              className={`rounded-lg px-2 py-1 text-xs font-bold ${
                                status === "Complete"
                                  ? "bg-mint text-leaf"
                                  : status === "Today"
                                    ? "bg-gold/25 text-ink"
                                    : "bg-white text-ink/55"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-ink/65">{week.focus}</p>
                          <ul className="mt-3 grid gap-1 text-sm text-ink/62 sm:grid-cols-2">
                            {week.tasks.slice(0, 2).map((task) => (
                              <li key={task} className="flex gap-2">
                                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-leaf" aria-hidden="true" />
                                {task}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-sm font-semibold text-ink">
                            Milestone: {week.outcomes[0] ?? week.tasks[0] ?? "Complete the weekly skill checkpoint"}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-ink/70">
                          <Clock size={16} aria-hidden="true" />
                          {week.estimatedHours} hrs
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Portfolio-Building Projects"
              eyebrow="Proof of skill"
              icon={<BriefcaseBusiness size={20} aria-hidden="true" />}
              action={
                <Link href={`/prep/${activePlan.id}`} className="hidden text-sm font-bold text-leaf sm:inline-flex">
                  Prep kit
                </Link>
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                {activePlan.projects.map((project) => (
                  <article key={project.title} className="rounded-lg border border-ink/10 p-4">
                    <span className="rounded-lg bg-mint px-2 py-1 text-xs font-bold text-leaf">{project.difficulty}</span>
                    <h3 className="mt-3 text-lg font-bold text-ink">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/62">{project.description}</p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-ink">{getProjectWhy(project)}</p>
                    <p className="mt-3 rounded-lg bg-skywash px-3 py-2 text-xs font-bold text-ink/70">
                      Outcome: {getProjectOutcome(project)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-lg bg-ink/[0.045] px-2 py-1 text-xs font-semibold text-ink/65">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Interview Preparation" eyebrow="Role-specific practice" icon={<MessageSquareText size={20} aria-hidden="true" />}>
              <div className="grid gap-3">
                {visibleQuestions.map((item, index) => (
                  <details key={item.question} className="group rounded-lg border border-ink/10 p-4" open={index === 0}>
                    <summary className="cursor-pointer list-none">
                      <p className="text-xs font-bold uppercase text-leaf">
                        Question {index + 1} · {item.skill}
                      </p>
                      <p className="mt-2 font-bold leading-6 text-ink">{item.question}</p>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-ink/62">{item.idealAnswer}</p>
                  </details>
                ))}
              </div>
              {activePlan.interviewQuestions.length > 2 ? (
                <button
                  type="button"
                  onClick={() => setShowAllQuestions((value) => !value)}
                  className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold text-ink"
                >
                  {showAllQuestions ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                  {showAllQuestions ? "Show fewer questions" : "View all interview questions"}
                </button>
              ) : null}
            </SectionCard>
          </div>

          <aside className="grid content-start gap-6">
            <SectionCard title="Progress Tracker" eyebrow="Roadmap completion" icon={<ListChecks size={20} aria-hidden="true" />}>
              <div className="text-center">
                <p className="text-5xl font-black text-ink">{progressPercent}%</p>
                <p className="mt-2 text-sm text-ink/60">
                  {completed} of {totalWeeks} weeks complete
                </p>
              </div>
              <div className="mt-5">
                <ProgressBar value={progressPercent} />
              </div>
              <div className="mt-5 grid gap-2">
                {activePlan.roadmap.map((week) => (
                  <label
                    key={week.weekNumber}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-ink/[0.035] px-3 py-2 text-sm font-medium text-ink"
                  >
                    <span>Week {week.weekNumber}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(activePlan.progress[week.weekNumber])}
                      disabled={savingWeek === week.weekNumber}
                      onChange={(event) => toggleWeek(week.weekNumber, event.target.checked)}
                      className="h-4 w-4 accent-leaf"
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Score Breakdown" eyebrow="Transparent metric" icon={<TrendingUp size={20} aria-hidden="true" />}>
              <div className="grid gap-3">
                {[
                  ["Skill match", readiness.skillMatch],
                  ["Roadmap completion", readiness.progressPercent],
                  ["Plan consistency", readiness.planConsistency]
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs font-bold text-ink/60">
                      <span>{label}</span>
                      <span>{value}%</span>
                    </div>
                    <ProgressBar value={Number(value)} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/62">
                Readiness is derived from AI skill match, completed weeks, and whether the plan includes roadmap,
                portfolio, interview, and daily action coverage.
              </p>
            </SectionCard>

            <SectionCard title="Up Next" eyebrow="Current checkpoint" icon={<ArrowRight size={20} aria-hidden="true" />}>
              <p className="text-sm font-bold text-ink">
                Week {nextWeek.weekNumber}: {nextWeek.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/62">{nextWeek.focus}</p>
              <Link
                href={`/roadmap/${activePlan.id}`}
                className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white"
              >
                Open roadmap
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </SectionCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
