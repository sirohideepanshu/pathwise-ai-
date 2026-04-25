import { sampleGeneratedPlan } from "@/lib/sample-data";
import type {
  AIInsight,
  GeneratedPlan,
  InterviewQuestion,
  NextBestAction,
  PlanRationale,
  ProjectRecommendation,
  RoadmapWeek,
  RiskWarning,
  SkillGap
} from "@/lib/types";
import { clamp } from "@/lib/utils";

type ValidatorResult =
  | { ok: true; data: GeneratedPlan }
  | { ok: false; error: string; data: GeneratedPlan };

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => asString(item)).filter(Boolean);
  return items.length ? items : fallback;
}

function asPriority(value: unknown): SkillGap["priority"] {
  return value === "High" || value === "Medium" || value === "Low" ? value : "Medium";
}

function asDifficulty(value: unknown): ProjectRecommendation["difficulty"] {
  return value === "Beginner" || value === "Intermediate" || value === "Advanced"
    ? value
    : "Intermediate";
}

function parseSkillGap(value: unknown, fallback: SkillGap): SkillGap {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    skill: asString(record.skill, fallback.skill),
    priority: asPriority(record.priority),
    why: asString(record.why, fallback.why)
  };
}

function parseWeek(value: unknown, index: number, fallback: RoadmapWeek): RoadmapWeek {
  const record = asRecord(value);
  if (!record) return { ...fallback, weekNumber: index + 1 };
  const weekNumber = Number(record.weekNumber);
  return {
    weekNumber: Number.isInteger(weekNumber) && weekNumber > 0 ? weekNumber : index + 1,
    title: asString(record.title, fallback.title),
    focus: asString(record.focus, fallback.focus),
    outcomes: asStringArray(record.outcomes, fallback.outcomes).slice(0, 4),
    tasks: asStringArray(record.tasks, fallback.tasks).slice(0, 5),
    resources: asStringArray(record.resources, fallback.resources).slice(0, 4),
    estimatedHours: clamp(Number(record.estimatedHours) || fallback.estimatedHours, 1, 40)
  };
}

function parseProject(value: unknown, fallback: ProjectRecommendation): ProjectRecommendation {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    title: asString(record.title, fallback.title),
    difficulty: asDifficulty(record.difficulty),
    description: asString(record.description, fallback.description),
    skills: asStringArray(record.skills, fallback.skills).slice(0, 6),
    deliverables: asStringArray(record.deliverables, fallback.deliverables).slice(0, 5)
  };
}

function parseQuestion(value: unknown, fallback: InterviewQuestion): InterviewQuestion {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    question: asString(record.question, fallback.question),
    skill: asString(record.skill, fallback.skill),
    idealAnswer: asString(record.idealAnswer, fallback.idealAnswer)
  };
}

function parseNextBestAction(value: unknown, fallback: NextBestAction): NextBestAction {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    whatToDoToday: asString(record.whatToDoToday, fallback.whatToDoToday),
    topicToStudyNext: asString(record.topicToStudyNext, fallback.topicToStudyNext),
    estimatedTime: asString(record.estimatedTime, fallback.estimatedTime),
    whyItMatters: asString(record.whyItMatters, fallback.whyItMatters),
    expectedOutcome: asString(record.expectedOutcome, fallback.expectedOutcome),
    whatComesNext: asString(record.whatComesNext, fallback.whatComesNext)
  };
}

function parseAIInsight(value: unknown, fallback: AIInsight): AIInsight {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    whyGenerated: asString(record.whyGenerated, fallback.whyGenerated),
    biggestGaps: asString(record.biggestGaps, fallback.biggestGaps),
    fastestPath: asString(record.fastestPath, fallback.fastestPath),
    focusFirst: asString(record.focusFirst, fallback.focusFirst)
  };
}

function parsePlanRationale(value: unknown, fallback: PlanRationale): PlanRationale {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    skillPriority: asString(record.skillPriority, fallback.skillPriority),
    orderReasoning: asString(record.orderReasoning, fallback.orderReasoning),
    timelineFit: asString(record.timelineFit, fallback.timelineFit)
  };
}

function parseRiskWarning(value: unknown, fallback: RiskWarning): RiskWarning {
  const record = asRecord(value);
  if (!record) return fallback;
  return {
    risk: asString(record.risk, fallback.risk),
    impact: asString(record.impact, fallback.impact)
  };
}

export function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

export function validateGeneratedPlan(value: unknown): ValidatorResult {
  const record = asRecord(value);
  if (!record) {
    return { ok: false, error: "AI response was not an object.", data: sampleGeneratedPlan };
  }

  const fallback = sampleGeneratedPlan;
  const readinessScore = clamp(Math.round(Number(record.readinessScore) || 0), 0, 100);
  const roadmapInput = Array.isArray(record.roadmap) ? record.roadmap : [];
  const missingInput = Array.isArray(record.missingSkills) ? record.missingSkills : [];
  const projectsInput = Array.isArray(record.projects) ? record.projects : [];
  const questionsInput = Array.isArray(record.interviewQuestions) ? record.interviewQuestions : [];
  const risksInput = Array.isArray(record.riskWarnings) ? record.riskWarnings : [];

  const roadmap = Array.from({ length: clamp(roadmapInput.length || fallback.roadmap.length, 6, 8) }).map(
    (_, index) => parseWeek(roadmapInput[index], index, fallback.roadmap[index] ?? fallback.roadmap[0])
  );

  const missingSkills = Array.from({ length: clamp(missingInput.length || fallback.missingSkills.length, 4, 6) }).map(
    (_, index) =>
      parseSkillGap(missingInput[index], fallback.missingSkills[index] ?? fallback.missingSkills[0])
  );

  const projects = Array.from({ length: 3 }).map((_, index) =>
    parseProject(projectsInput[index], fallback.projects[index] ?? fallback.projects[0])
  );

  const interviewQuestions = Array.from({ length: 5 }).map((_, index) =>
    parseQuestion(questionsInput[index], fallback.interviewQuestions[index] ?? fallback.interviewQuestions[0])
  );

  const riskWarnings = Array.from({ length: clamp(risksInput.length || fallback.riskWarnings.length, 2, 3) }).map(
    (_, index) => parseRiskWarning(risksInput[index], fallback.riskWarnings[index] ?? fallback.riskWarnings[0])
  );

  const data: GeneratedPlan = {
    targetRole: asString(record.targetRole, fallback.targetRole),
    readinessScore,
    readinessSummary: asString(record.readinessSummary, fallback.readinessSummary),
    aiInsight: parseAIInsight(record.aiInsight, fallback.aiInsight),
    planRationale: parsePlanRationale(record.planRationale, fallback.planRationale),
    riskWarnings,
    nextBestAction: parseNextBestAction(record.nextBestAction, fallback.nextBestAction),
    strengths: asStringArray(record.strengths, fallback.strengths).slice(0, 6),
    missingSkills,
    roadmap,
    projects,
    interviewQuestions
  };

  const requiredStringMissing =
    !data.targetRole ||
    !data.readinessSummary ||
    !data.nextBestAction.whatToDoToday ||
    !data.nextBestAction.topicToStudyNext ||
    !data.nextBestAction.estimatedTime ||
    !data.nextBestAction.whyItMatters ||
    !data.nextBestAction.expectedOutcome ||
    !data.nextBestAction.whatComesNext ||
    !data.aiInsight.whyGenerated ||
    !data.aiInsight.biggestGaps ||
    !data.aiInsight.fastestPath ||
    !data.aiInsight.focusFirst ||
    !data.planRationale.skillPriority ||
    !data.planRationale.orderReasoning ||
    !data.planRationale.timelineFit ||
    data.riskWarnings.some((item) => !item.risk || !item.impact) ||
    data.missingSkills.some((item) => !item.skill || !item.why) ||
    data.roadmap.some((week) => !week.title || !week.focus || week.tasks.length === 0) ||
    data.projects.some((project) => !project.title || !project.description) ||
    data.interviewQuestions.some((question) => !question.question || !question.idealAnswer);

  if (requiredStringMissing) {
    return {
      ok: false,
      error: "AI response missed required plan details.",
      data: { ...fallback, targetRole: data.targetRole || fallback.targetRole }
    };
  }

  return { ok: true, data };
}
