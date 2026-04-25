import { GoogleGenAI } from "@google/genai";
import type { CareerInput, GeneratePlanResponse } from "@/lib/types";
import { buildCareerPlanPrompt } from "@/lib/ai/prompts";
import { extractJson, validateGeneratedPlan } from "@/lib/ai/parse";
import type { GeneratedPlan, InterviewQuestion, ProjectRecommendation, SkillGap } from "@/lib/types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEMO_MODE_NOTICE = "Demo mode: sample AI-generated roadmap loaded for evaluation.";

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key.includes("your-") || key === "demo") return null;
  return key;
}

function deriveBaselineReadiness(input: CareerInput, gaps: SkillGap[]) {
  const levelBase = input.currentLevel === "Advanced" ? 58 : input.currentLevel === "Intermediate" ? 42 : 26;
  const skillCoverage = Math.min(input.currentSkills.length * 5, 22);
  const hoursBoost = input.weeklyHours >= 10 ? 8 : input.weeklyHours >= 6 ? 5 : 2;
  const highGapPenalty = gaps.filter((gap) => gap.priority === "High").length * 5;
  const mediumGapPenalty = gaps.filter((gap) => gap.priority === "Medium").length * 2;
  return Math.max(18, Math.min(82, Math.round(levelBase + skillCoverage + hoursBoost - highGapPenalty - mediumGapPenalty)));
}

const stringListSchema = {
  type: "array",
  minItems: 1,
  maxItems: 6,
  items: { type: "string" }
};

const careerPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "targetRole",
    "readinessScore",
    "readinessSummary",
    "aiInsight",
    "planRationale",
    "riskWarnings",
    "nextBestAction",
    "strengths",
    "missingSkills",
    "roadmap",
    "projects",
    "interviewQuestions"
  ],
  propertyOrdering: [
    "targetRole",
    "readinessScore",
    "readinessSummary",
    "aiInsight",
    "planRationale",
    "riskWarnings",
    "nextBestAction",
    "strengths",
    "missingSkills",
    "roadmap",
    "projects",
    "interviewQuestions"
  ],
  properties: {
    targetRole: { type: "string" },
    readinessScore: { type: "integer", minimum: 0, maximum: 100 },
    readinessSummary: { type: "string" },
    aiInsight: {
      type: "object",
      additionalProperties: false,
      required: ["whyGenerated", "biggestGaps", "fastestPath", "focusFirst"],
      properties: {
        whyGenerated: { type: "string" },
        biggestGaps: { type: "string" },
        fastestPath: { type: "string" },
        focusFirst: { type: "string" }
      }
    },
    planRationale: {
      type: "object",
      additionalProperties: false,
      required: ["skillPriority", "orderReasoning", "timelineFit"],
      properties: {
        skillPriority: { type: "string" },
        orderReasoning: { type: "string" },
        timelineFit: { type: "string" }
      }
    },
    riskWarnings: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["risk", "impact"],
        properties: {
          risk: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    nextBestAction: {
      type: "object",
      additionalProperties: false,
      required: [
        "whatToDoToday",
        "topicToStudyNext",
        "estimatedTime",
        "whyItMatters",
        "expectedOutcome",
        "whatComesNext"
      ],
      properties: {
        whatToDoToday: { type: "string" },
        topicToStudyNext: { type: "string" },
        estimatedTime: { type: "string" },
        whyItMatters: { type: "string" },
        expectedOutcome: { type: "string" },
        whatComesNext: { type: "string" }
      }
    },
    strengths: stringListSchema,
    missingSkills: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["skill", "priority", "why"],
        properties: {
          skill: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          why: { type: "string" }
        }
      }
    },
    roadmap: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["weekNumber", "title", "focus", "outcomes", "tasks", "resources", "estimatedHours"],
        properties: {
          weekNumber: { type: "integer", minimum: 1, maximum: 8 },
          title: { type: "string" },
          focus: { type: "string" },
          outcomes: stringListSchema,
          tasks: stringListSchema,
          resources: stringListSchema,
          estimatedHours: { type: "integer", minimum: 1, maximum: 40 }
        }
      }
    },
    projects: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "difficulty", "description", "skills", "deliverables"],
        properties: {
          title: { type: "string" },
          difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
          description: { type: "string" },
          skills: stringListSchema,
          deliverables: stringListSchema
        }
      }
    },
    interviewQuestions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "skill", "idealAnswer"],
        properties: {
          question: { type: "string" },
          skill: { type: "string" },
          idealAnswer: { type: "string" }
        }
      }
    }
  }
} as const;

function roleProfile(role: string): {
  missingSkills: SkillGap[];
  projects: ProjectRecommendation[];
  interviewQuestions: InterviewQuestion[];
  coreTools: string[];
} {
  const normalized = role.toLowerCase();
  if (normalized.includes("data")) {
    return {
      coreTools: ["SQL", "Python analysis", "statistics", "dashboarding"],
      missingSkills: [
        { skill: "Intermediate SQL", priority: "High", why: "Most analyst roles require joins, aggregations, and clean query logic." },
        { skill: "Data cleaning with Python", priority: "High", why: "Real datasets need cleaning before insight generation." },
        { skill: "Statistics fundamentals", priority: "Medium", why: "Analysts must explain trends, variance, and confidence clearly." },
        { skill: "BI dashboards", priority: "Medium", why: "Hiring teams expect clear visual storytelling and metrics." }
      ],
      projects: [
        {
          title: "Sales Insights Dashboard",
          difficulty: "Beginner",
          description: "Clean a sales dataset, analyze trends, and present KPIs in a dashboard.",
          skills: ["SQL", "Excel or Power BI", "Data cleaning", "Storytelling"],
          deliverables: ["Clean dataset", "Dashboard", "Insights summary", "GitHub README"]
        },
        {
          title: "Customer Churn Analysis",
          difficulty: "Intermediate",
          description: "Explore customer behavior, find churn drivers, and recommend retention actions.",
          skills: ["Python", "Pandas", "EDA", "Visualization"],
          deliverables: ["Notebook", "Charts", "Findings deck", "Action recommendations"]
        },
        {
          title: "Public Data Case Study",
          difficulty: "Intermediate",
          description: "Use a public dataset to answer a practical business or social question.",
          skills: ["SQL", "Statistics", "Data storytelling", "Documentation"],
          deliverables: ["Question framing", "Analysis", "Dashboard", "Case study page"]
        }
      ],
      interviewQuestions: [
        { question: "How would you find duplicate rows in a dataset?", skill: "Data cleaning", idealAnswer: "Check key columns, group records, count duplicates, inspect patterns, and remove or merge only after confirming business rules." },
        { question: "Explain the difference between inner join and left join.", skill: "SQL", idealAnswer: "Inner join keeps only matching rows. Left join keeps all left-table rows and fills unmatched right-table values with null." },
        { question: "How do you choose the right chart for a metric?", skill: "Visualization", idealAnswer: "Match the chart to the comparison: trends use lines, category comparisons use bars, distributions use histograms or box plots." },
        { question: "What would you do with missing values?", skill: "Data quality", idealAnswer: "Measure missingness, identify causes, decide whether to drop, impute, or flag values, and document the decision." },
        { question: "How do you communicate an analysis to non-technical stakeholders?", skill: "Storytelling", idealAnswer: "Start with the decision, show the key evidence, explain assumptions, and end with clear recommended actions." }
      ]
    };
  }
  if (normalized.includes("ml") || normalized.includes("machine")) {
    return {
      coreTools: ["Python", "model evaluation", "feature engineering", "deployment basics"],
      missingSkills: [
        { skill: "Machine learning fundamentals", priority: "High", why: "You need supervised learning, metrics, and validation basics." },
        { skill: "Data preprocessing", priority: "High", why: "Model quality depends on clean, well-shaped training data." },
        { skill: "Model evaluation", priority: "High", why: "Accuracy alone is often misleading in real ML projects." },
        { skill: "Experiment documentation", priority: "Medium", why: "Good ML portfolios explain tradeoffs and reproducibility." }
      ],
      projects: [
        {
          title: "Prediction Model Notebook",
          difficulty: "Beginner",
          description: "Train and evaluate a regression or classification model on a clean public dataset.",
          skills: ["Python", "scikit-learn", "EDA", "Metrics"],
          deliverables: ["Notebook", "Model report", "Evaluation charts", "README"]
        },
        {
          title: "Feature Engineering Case Study",
          difficulty: "Intermediate",
          description: "Improve a baseline model by testing feature transformations and documenting results.",
          skills: ["Feature engineering", "Validation", "Pandas", "Experiment tracking"],
          deliverables: ["Baseline", "Feature experiments", "Comparison table", "Decision notes"]
        },
        {
          title: "Mini ML Demo App",
          difficulty: "Intermediate",
          description: "Wrap a trained model in a simple web app where users can submit inputs and see predictions.",
          skills: ["Model serving", "UI basics", "API design", "Deployment"],
          deliverables: ["Model file", "Prediction UI", "API route", "Live demo"]
        }
      ],
      interviewQuestions: [
        { question: "How do you detect overfitting?", skill: "Model evaluation", idealAnswer: "Compare train and validation performance, inspect learning curves, and test whether simpler models generalize better." },
        { question: "Why split data into train and test sets?", skill: "Validation", idealAnswer: "The split estimates performance on unseen data and prevents judging the model only on examples it learned from." },
        { question: "When would precision matter more than recall?", skill: "Metrics", idealAnswer: "Precision matters when false positives are costly, such as incorrectly flagging legitimate users or transactions." },
        { question: "What is feature leakage?", skill: "Feature engineering", idealAnswer: "Leakage happens when training data includes information unavailable at prediction time, causing unrealistic performance." },
        { question: "How would you explain a model to a stakeholder?", skill: "Communication", idealAnswer: "Describe the goal, data, key signals, limitations, and business impact without relying on algorithm jargon." }
      ]
    };
  }
  if (normalized.includes("backend")) {
    return {
      coreTools: ["APIs", "databases", "authentication", "testing"],
      missingSkills: [
        { skill: "REST API design", priority: "High", why: "Backend roles require clear endpoints, status codes, and request validation." },
        { skill: "Database modeling", priority: "High", why: "Reliable apps depend on clean schemas and relationships." },
        { skill: "Authentication", priority: "Medium", why: "Most backend services protect user data and sessions." },
        { skill: "Testing and logging", priority: "Medium", why: "Services need observable, repeatable behavior in production." }
      ],
      projects: [
        {
          title: "Task API with Auth",
          difficulty: "Beginner",
          description: "Build a CRUD API with authentication, validation, and user-owned records.",
          skills: ["REST", "Auth", "Database schema", "Validation"],
          deliverables: ["API routes", "Schema", "Auth flow", "Postman collection"]
        },
        {
          title: "Analytics Event Service",
          difficulty: "Intermediate",
          description: "Create a service that records events and returns aggregate usage metrics.",
          skills: ["SQL", "Indexes", "Aggregation", "Logging"],
          deliverables: ["Event endpoint", "Metrics endpoint", "Seed data", "README"]
        },
        {
          title: "Production-Ready API Starter",
          difficulty: "Intermediate",
          description: "Package auth, validation, error handling, and deployment docs into a reusable starter.",
          skills: ["Error handling", "Testing", "Deployment", "Documentation"],
          deliverables: ["Starter repo", "Tests", "Env guide", "Live API"]
        }
      ],
      interviewQuestions: [
        { question: "What makes an API endpoint well designed?", skill: "API design", idealAnswer: "It has clear resource naming, validation, predictable status codes, useful errors, and secure authorization checks." },
        { question: "How would you model users and tasks?", skill: "Database design", idealAnswer: "Use separate users and tasks tables, connect tasks with user_id, and enforce ownership with constraints or policies." },
        { question: "Why are indexes useful?", skill: "Databases", idealAnswer: "Indexes speed up reads for common filters and joins, though they add write overhead and storage cost." },
        { question: "How do you handle invalid input?", skill: "Validation", idealAnswer: "Validate at the API boundary, return clear 400 errors, and avoid trusting client-side checks alone." },
        { question: "What should logs capture?", skill: "Observability", idealAnswer: "Logs should capture request context, failures, timing, and identifiers without exposing secrets or sensitive data." }
      ]
    };
  }
  return {
    coreTools: ["React", "TypeScript", "API integration", "responsive UI"],
    missingSkills: [
      { skill: "React fundamentals", priority: "High", why: "Most frontend roles expect component-based UI development and hooks." },
      { skill: "TypeScript", priority: "High", why: "Type safety is common in production frontend teams." },
      { skill: "API integration", priority: "Medium", why: "Frontend developers need to fetch, transform, and render data." },
      { skill: "Responsive UI polish", priority: "Medium", why: "Portfolio projects should work smoothly on mobile and desktop." }
    ],
    projects: [
      {
        title: "Personal Learning Dashboard",
        difficulty: "Beginner",
        description: "A responsive dashboard that tracks goals, habits, and weekly learning stats.",
        skills: ["React", "TypeScript", "Local storage", "Responsive CSS"],
        deliverables: ["Dashboard page", "Goal form", "Progress widgets", "Deployed link"]
      },
      {
        title: "API-Powered Job Board",
        difficulty: "Intermediate",
        description: "A searchable job board that filters roles by skill, location, and seniority.",
        skills: ["API fetching", "Search UX", "Loading states", "Next.js routing"],
        deliverables: ["Search page", "Role details page", "Saved jobs state", "README"]
      },
      {
        title: "Portfolio Case Study Site",
        difficulty: "Intermediate",
        description: "A polished portfolio project with project writeups, screenshots, and deployment notes.",
        skills: ["UI polish", "Content structure", "Accessibility", "Deployment"],
        deliverables: ["Home page", "Case study page", "Contact section", "Live demo"]
      }
    ],
    interviewQuestions: [
      { question: "How do props and state differ in React?", skill: "React fundamentals", idealAnswer: "Props are parent-provided inputs. State is component-owned data that changes through interaction or application events." },
      { question: "What makes a component reusable?", skill: "Component design", idealAnswer: "Reusable components have clear props, avoid page-specific assumptions, and separate display concerns from business logic." },
      { question: "How would you handle API loading and error states?", skill: "API integration", idealAnswer: "Track loading, success, and failure states, render useful feedback, and guard against incomplete data." },
      { question: "Why use TypeScript in frontend projects?", skill: "TypeScript", idealAnswer: "It documents contracts, catches shape mismatches early, and makes refactors safer across a growing UI." },
      { question: "How do you make a page responsive?", skill: "Responsive design", idealAnswer: "Use flexible layouts, sensible breakpoints, stable spacing, and test core workflows across device sizes." }
    ]
  };
}

function roleResources(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes("data")) {
    return {
      foundation: ["Mode SQL Tutorial", "Kaggle Pandas course"],
      core: ["Mode SQL joins lesson", "SQLBolt practice"],
      practical: ["Kaggle data cleaning course", "Pandas user guide"],
      project: ["Tableau Public gallery", "GitHub README guide"],
      polish: ["Storytelling with Data examples", "Portfolio case study examples"],
      interview: ["Data analyst interview practice", "SQL interview questions"]
    };
  }
  if (normalized.includes("ml") || normalized.includes("machine")) {
    return {
      foundation: ["Kaggle Intro to Machine Learning", "scikit-learn getting started"],
      core: ["scikit-learn model selection docs", "Kaggle validation lesson"],
      practical: ["Kaggle feature engineering course", "Pandas user guide"],
      project: ["Model card examples", "GitHub README guide"],
      polish: ["Hugging Face Spaces docs", "Vercel deployment docs"],
      interview: ["ML interview practice", "Machine learning metrics guide"]
    };
  }
  if (normalized.includes("backend")) {
    return {
      foundation: ["MDN HTTP overview", "Postman API basics"],
      core: ["REST API design guide", "Next.js route handlers docs"],
      practical: ["Supabase database docs", "Prisma data modeling guide"],
      project: ["Postman collection guide", "GitHub README guide"],
      polish: ["OWASP API security basics", "Vercel deployment docs"],
      interview: ["Backend interview practice", "System design primer basics"]
    };
  }
  return {
    foundation: ["MDN JavaScript Guide", "React Learn: Describing the UI"],
    core: ["React Learn: State", "React Learn: Effects"],
    practical: ["TypeScript Handbook", "React TypeScript Cheatsheet"],
    project: ["Next.js App Router docs", "GitHub README guide"],
    polish: ["web.dev responsive design", "Vercel deployment docs"],
    interview: ["Frontend interview practice", "React interview questions"]
  };
}

function buildFallbackPlan(input: CareerInput): GeneratedPlan {
  const profile = roleProfile(input.targetRole);
  const resources = roleResources(input.targetRole);
  const hours = Math.min(Math.max(input.weeklyHours || 8, 3), 15);
  const strengths = input.currentSkills.length
    ? input.currentSkills.slice(0, 4)
    : ["Clear target role", "Motivation to learn"];

  return {
    targetRole: input.targetRole,
    readinessScore: deriveBaselineReadiness(input, profile.missingSkills),
    readinessSummary: `Build ${profile.coreTools.slice(0, 3).join(", ")} through weekly practice and portfolio proof.`,
    aiInsight: {
      whyGenerated: `This plan was generated from a ${input.currentLevel.toLowerCase()} ${input.targetRole} profile with ${input.currentSkills.slice(0, 3).join(", ") || "early-stage"} skills and ${input.weeklyHours} weekly study hours.`,
      biggestGaps: `The biggest readiness gaps are ${profile.missingSkills
        .filter((skill) => skill.priority === "High")
        .map((skill) => skill.skill)
        .join(", ") || profile.coreTools.slice(0, 2).join(", ")}.`,
      fastestPath: `The fastest path is to strengthen ${profile.coreTools[0]}, apply it in ${profile.projects[0].title}, then practice role-specific interview explanations.`,
      focusFirst: `Start with ${profile.coreTools[0]} because it unlocks the next roadmap weeks and makes the first project credible.`
    },
    planRationale: {
      skillPriority: `${profile.coreTools.slice(0, 3).join(", ")} are prioritized because they are the highest-signal skills for ${input.targetRole} readiness.`,
      orderReasoning: "The roadmap moves from foundations to applied portfolio work, then finishes with interview polish so each week compounds.",
      timelineFit: `${hours} hours per week is enough for focused weekly milestones without overloading the student.`
    },
    riskWarnings: [
      {
        risk: `Skipping ${profile.coreTools[0]}`,
        impact: "Later roadmap weeks will feel harder because the first project depends on this foundation."
      },
      {
        risk: `Ignoring ${profile.projects[0].title}`,
        impact: "Portfolio strength will stay weak even if the learning checklist is completed."
      },
      {
        risk: "Leaving interview practice until the end",
        impact: "The student may know the topic but struggle to explain tradeoffs under time pressure."
      }
    ],
    nextBestAction: {
      whatToDoToday: `Complete one focused practice task using ${profile.coreTools[0]} and write three notes about what you learned.`,
      topicToStudyNext: profile.coreTools[0],
      estimatedTime: `${Math.max(45, Math.min(hours * 15, 120))} minutes`,
      whyItMatters: `This is the highest-leverage next step for improving ${input.targetRole} readiness from the current skill profile.`,
      expectedOutcome: `A visible practice artifact that proves progress in ${profile.coreTools[0]}.`,
      whatComesNext: `Apply it inside ${profile.projects[0].title} and document the decision in the project README.`
    },
    strengths,
    missingSkills: profile.missingSkills,
    roadmap: [
      {
        weekNumber: 1,
        title: `${input.targetRole} Foundations`,
        focus: `Refresh the core concepts and tools used in ${input.targetRole} roles.`,
        outcomes: ["Understand the role workflow", "Set up a practical learning environment"],
        tasks: ["Review role expectations", `Practice ${profile.coreTools[0]}`, "Create a learning tracker"],
        resources: resources.foundation,
        estimatedHours: hours
      },
      {
        weekNumber: 2,
        title: `Core Tooling: ${profile.coreTools[0]}`,
        focus: `Build confidence with ${profile.coreTools[0]} through small exercises.`,
        outcomes: ["Complete focused drills", "Explain the tool in interview language"],
        tasks: ["Finish 3 guided exercises", "Write short notes", `Apply ${profile.coreTools[0]} to a mini role-specific task`],
        resources: resources.core,
        estimatedHours: hours
      },
      {
        weekNumber: 3,
        title: `Practical Skill: ${profile.coreTools[1]}`,
        focus: `Use ${profile.coreTools[1]} in a realistic mini task.`,
        outcomes: ["Complete a small practical build", "Document decisions"],
        tasks: ["Pick a small scenario", "Implement the main workflow", "Capture screenshots or outputs"],
        resources: resources.practical,
        estimatedHours: hours
      },
      {
        weekNumber: 4,
        title: "Project Sprint 1",
        focus: `Start ${profile.projects[0].title} and make it presentable.`,
        outcomes: ["Create a working first version", "Write a concise README"],
        tasks: ["Define scope", "Build core flow", "Add clean empty and error states"],
        resources: resources.project,
        estimatedHours: hours
      },
      {
        weekNumber: 5,
        title: "Project Sprint 2",
        focus: `Improve portfolio quality with ${profile.coreTools[2]} and polish.`,
        outcomes: ["Add one advanced feature", "Improve visual or analytical clarity"],
        tasks: ["Refactor rough areas", "Add validation", "Prepare demo notes"],
        resources: resources.polish,
        estimatedHours: hours
      },
      {
        weekNumber: 6,
        title: "Interview and Portfolio Polish",
        focus: "Practice questions, tighten storytelling, and deploy final work.",
        outcomes: ["Answer common interview prompts", "Share a live portfolio-ready project"],
        tasks: ["Practice 5 questions", "Record a 2-minute walkthrough", "Deploy and test links"],
        resources: resources.interview,
        estimatedHours: hours
      }
    ],
    projects: profile.projects,
    interviewQuestions: profile.interviewQuestions
  };
}

export async function generateCareerPlan(input: CareerInput): Promise<GeneratePlanResponse> {
  const apiKey = getGeminiApiKey();
  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return {
      plan: buildFallbackPlan(input),
      source: "fallback",
      warning: DEMO_MODE_NOTICE
    };
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: buildCareerPlanPrompt(input),
      config: {
        temperature: 0.25,
        topP: 0.85,
        responseMimeType: "application/json",
        responseJsonSchema: careerPlanJsonSchema
      }
    });

    const text = result.text;
    if (!text) {
      return {
        plan: buildFallbackPlan(input),
        source: "fallback",
        warning: DEMO_MODE_NOTICE
      };
    }

    const parsed = JSON.parse(extractJson(text));
    const validated = validateGeneratedPlan(parsed);

    if (!validated.ok) {
      return {
        plan: buildFallbackPlan(input),
        source: "fallback",
        warning: DEMO_MODE_NOTICE
      };
    }

    return {
      plan: {
        ...validated.data,
        readinessScore: deriveBaselineReadiness(input, validated.data.missingSkills)
      },
      source: "gemini"
    };
  } catch (error) {
    return {
      plan: buildFallbackPlan(input),
      source: "fallback",
      warning: DEMO_MODE_NOTICE
    };
  }
}
