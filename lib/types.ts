export type StudentLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CareerInput {
  targetRole: string;
  currentSkills: string[];
  currentLevel: StudentLevel;
  weeklyHours: number;
  targetTimeline?: string;
}

export interface SkillGap {
  skill: string;
  priority: "High" | "Medium" | "Low";
  why: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focus: string;
  outcomes: string[];
  tasks: string[];
  resources: string[];
  estimatedHours: number;
}

export interface ProjectRecommendation {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  skills: string[];
  deliverables: string[];
}

export interface InterviewQuestion {
  question: string;
  skill: string;
  idealAnswer: string;
}

export interface NextBestAction {
  whatToDoToday: string;
  topicToStudyNext: string;
  estimatedTime: string;
  whyItMatters: string;
  expectedOutcome: string;
  whatComesNext: string;
}

export interface AIInsight {
  whyGenerated: string;
  biggestGaps: string;
  fastestPath: string;
  focusFirst: string;
}

export interface PlanRationale {
  skillPriority: string;
  orderReasoning: string;
  timelineFit: string;
}

export interface RiskWarning {
  risk: string;
  impact: string;
}

export interface GeneratedPlan {
  targetRole: string;
  readinessScore: number;
  readinessSummary: string;
  aiInsight: AIInsight;
  planRationale: PlanRationale;
  riskWarnings: RiskWarning[];
  nextBestAction: NextBestAction;
  strengths: string[];
  missingSkills: SkillGap[];
  roadmap: RoadmapWeek[];
  projects: ProjectRecommendation[];
  interviewQuestions: InterviewQuestion[];
}

export interface StoredPlan extends GeneratedPlan {
  id: string;
  createdAt: string;
  input: CareerInput;
  progress: Record<number, boolean>;
  source: "gemini" | "demo" | "fallback";
  warning?: string;
}

export interface GeneratePlanResponse {
  plan: GeneratedPlan;
  source: "gemini" | "fallback";
  warning?: string;
}

export interface AppUser {
  id: string;
  email?: string;
  isDemo: boolean;
}
