"use client";

import type { AppUser, CareerInput, GeneratedPlan, StoredPlan } from "@/lib/types";
import { sampleStoredPlan } from "@/lib/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { slugId } from "@/lib/utils";

const PLANS_KEY = "pathwise_plans";
const DEMO_USER_KEY = "pathwise_demo_user";

function normalizePlan(plan: StoredPlan): StoredPlan {
  return {
    ...plan,
    aiInsight: { ...sampleStoredPlan.aiInsight, ...(plan.aiInsight ?? {}) },
    planRationale: { ...sampleStoredPlan.planRationale, ...(plan.planRationale ?? {}) },
    riskWarnings: plan.riskWarnings?.length ? plan.riskWarnings : sampleStoredPlan.riskWarnings,
    nextBestAction: { ...sampleStoredPlan.nextBestAction, ...(plan.nextBestAction ?? {}) },
    progress:
      plan.progress ??
      Object.fromEntries((plan.roadmap.length ? plan.roadmap : sampleStoredPlan.roadmap).map((week) => [week.weekNumber, false]))
  };
}

function readLocalPlans(): StoredPlan[] {
  if (typeof window === "undefined") return [sampleStoredPlan];
  const raw = window.localStorage.getItem(PLANS_KEY);
  if (!raw) {
    window.localStorage.setItem(PLANS_KEY, JSON.stringify([sampleStoredPlan]));
    return [sampleStoredPlan];
  }
  try {
    const parsed = JSON.parse(raw) as StoredPlan[];
    return parsed.length ? parsed.map(normalizePlan) : [sampleStoredPlan];
  } catch {
    window.localStorage.setItem(PLANS_KEY, JSON.stringify([sampleStoredPlan]));
    return [sampleStoredPlan];
  }
}

function writeLocalPlans(plans: StoredPlan[]) {
  window.localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function startDemoSession() {
  window.localStorage.setItem(DEMO_USER_KEY, "true");
  readLocalPlans();
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email ?? undefined,
        isDemo: false
      };
    }
  }

  if (typeof window !== "undefined" && window.localStorage.getItem(DEMO_USER_KEY)) {
    return { id: "demo-user", email: "demo@pathwise.ai", isDemo: true };
  }

  return null;
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  if (supabase) await supabase.auth.signOut();
  window.localStorage.removeItem(DEMO_USER_KEY);
}

export async function getStoredPlans(): Promise<StoredPlan[]> {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();
  if (!supabase || !user || user.isDemo) return readLocalPlans();

  const { data: planRows, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!planRows?.length) return [];

  const planIds = planRows.map((row) => row.id);
  const [weeksRes, projectsRes, questionsRes, progressRes] = await Promise.all([
    supabase.from("roadmap_weeks").select("*").in("plan_id", planIds).order("week_number"),
    supabase.from("projects").select("*").in("plan_id", planIds),
    supabase.from("interview_questions").select("*").in("plan_id", planIds),
    supabase.from("progress_tracking").select("*").in("plan_id", planIds)
  ]);

  const childError = weeksRes.error ?? projectsRes.error ?? questionsRes.error ?? progressRes.error;
  if (childError) throw new Error(childError.message);

  return planRows.map((plan): StoredPlan => {
    const weeks = (weeksRes.data ?? []).filter((week) => week.plan_id === plan.id);
    const projects = (projectsRes.data ?? []).filter((project) => project.plan_id === plan.id);
    const questions = (questionsRes.data ?? []).filter((question) => question.plan_id === plan.id);
    const progressRows = (progressRes.data ?? []).filter((item) => item.plan_id === plan.id);

    return {
      id: plan.id,
      createdAt: plan.created_at,
      targetRole: plan.target_role,
      readinessScore: plan.readiness_score,
      readinessSummary: plan.readiness_summary,
      aiInsight: { ...sampleStoredPlan.aiInsight, ...(plan.ai_insight ?? {}) },
      planRationale: { ...sampleStoredPlan.planRationale, ...(plan.plan_rationale ?? {}) },
      riskWarnings: plan.risk_warnings?.length ? plan.risk_warnings : sampleStoredPlan.riskWarnings,
      nextBestAction: { ...sampleStoredPlan.nextBestAction, ...(plan.next_best_action ?? {}) },
      strengths: plan.strengths ?? [],
      missingSkills: plan.missing_skills ?? [],
      input: {
        targetRole: plan.target_role,
        currentSkills: plan.current_skills ?? [],
        currentLevel: plan.current_level,
        weeklyHours: plan.weekly_hours,
        targetTimeline: plan.target_timeline ?? undefined
      },
      roadmap: weeks.map((week) => ({
        weekNumber: week.week_number,
        title: week.title,
        focus: week.focus,
        outcomes: week.outcomes ?? [],
        tasks: week.tasks ?? [],
        resources: week.resources ?? [],
        estimatedHours: week.estimated_hours
      })),
      projects: projects.map((project) => ({
        title: project.title,
        difficulty: project.difficulty,
        description: project.description,
        skills: project.skills ?? [],
        deliverables: project.deliverables ?? []
      })),
      interviewQuestions: questions.map((question) => ({
        question: question.question,
        skill: question.skill,
        idealAnswer: question.ideal_answer
      })),
      progress: Object.fromEntries(
        weeks.map((week) => [
          week.week_number,
          progressRows.find((item) => item.week_number === week.week_number)?.completed ?? false
        ])
      ),
      source: "gemini"
    };
  });
}

export async function getStoredPlan(planId: string) {
  const plans = await getStoredPlans();
  return plans.find((plan) => plan.id === planId) ?? null;
}

export async function saveGeneratedPlan(
  input: CareerInput,
  generated: GeneratedPlan,
  source: StoredPlan["source"],
  warning?: string
) {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user || user.isDemo || !isSupabaseConfigured()) {
    const stored: StoredPlan = {
      ...generated,
      id: slugId("demo_plan"),
      createdAt: new Date().toISOString(),
      input,
      progress: Object.fromEntries(generated.roadmap.map((week) => [week.weekNumber, false])),
      source,
      warning
    };
    writeLocalPlans([stored, ...readLocalPlans().filter((plan) => plan.id !== sampleStoredPlan.id)]);
    return stored;
  }

  const { error: userError } = await supabase.from("users").upsert({ id: user.id, email: user.email ?? null });
  if (userError) throw new Error(userError.message);

  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      target_role: input.targetRole,
      current_level: input.currentLevel,
      current_skills: input.currentSkills,
      weekly_hours: input.weeklyHours,
      target_timeline: input.targetTimeline || null
    },
    {
      onConflict: "user_id"
    }
  );
  if (profileError) throw new Error(profileError.message);

  const { data: planRow, error: planError } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      target_role: generated.targetRole,
      current_skills: input.currentSkills,
      current_level: input.currentLevel,
      weekly_hours: input.weeklyHours,
      target_timeline: input.targetTimeline || null,
      readiness_score: generated.readinessScore,
      readiness_summary: generated.readinessSummary,
      ai_insight: generated.aiInsight,
      plan_rationale: generated.planRationale,
      risk_warnings: generated.riskWarnings,
      next_best_action: generated.nextBestAction,
      strengths: generated.strengths,
      missing_skills: generated.missingSkills
    })
    .select()
    .single();

  if (planError || !planRow) {
    throw new Error(planError?.message || "Could not save plan.");
  }

  const planId = planRow.id;
  const [weeks, projects, questions, progress] = [
    generated.roadmap.map((week) => ({
      plan_id: planId,
      week_number: week.weekNumber,
      title: week.title,
      focus: week.focus,
      outcomes: week.outcomes,
      tasks: week.tasks,
      resources: week.resources,
      estimated_hours: week.estimatedHours
    })),
    generated.projects.map((project) => ({
      plan_id: planId,
      title: project.title,
      difficulty: project.difficulty,
      description: project.description,
      skills: project.skills,
      deliverables: project.deliverables
    })),
    generated.interviewQuestions.map((question) => ({
      plan_id: planId,
      question: question.question,
      skill: question.skill,
      ideal_answer: question.idealAnswer
    })),
    generated.roadmap.map((week) => ({
      user_id: user.id,
      plan_id: planId,
      week_number: week.weekNumber,
      completed: false
    }))
  ];

  const results = await Promise.all([
    supabase.from("roadmap_weeks").insert(weeks),
    supabase.from("projects").insert(projects),
    supabase.from("interview_questions").insert(questions),
    supabase.from("progress_tracking").insert(progress)
  ]);

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    await supabase.from("plans").delete().eq("id", planId);
    throw new Error(failed.error.message);
  }

  return {
    ...generated,
    id: planId,
    createdAt: planRow.created_at,
    input,
    progress: Object.fromEntries(generated.roadmap.map((week) => [week.weekNumber, false])),
    source,
    warning
  } satisfies StoredPlan;
}

export async function updateWeekProgress(planId: string, weekNumber: number, completed: boolean) {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user || user.isDemo) {
    const plans = readLocalPlans();
    writeLocalPlans(
      plans.map((plan) =>
        plan.id === planId ? { ...plan, progress: { ...plan.progress, [weekNumber]: completed } } : plan
      )
    );
    return;
  }

  const { error } = await supabase
    .from("progress_tracking")
    .upsert(
      {
        user_id: user.id,
        plan_id: planId,
        week_number: weekNumber,
        completed,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,plan_id,week_number" }
    );

  if (error) throw new Error(error.message);
}
