import type { CareerInput } from "@/lib/types";

export function buildCareerPlanPrompt(input: CareerInput) {
  const timeline = input.targetTimeline?.trim() || "6 to 8 weeks";
  const skills = input.currentSkills.length ? input.currentSkills.join(", ") : "No specific skills listed";

  return `You are PathWise AI, a concise career coach for students.
Create a practical personalized career plan.

Student:
- Target role: ${input.targetRole}
- Current level: ${input.currentLevel}
- Current skills: ${skills}
- Study time: ${input.weeklyHours} hours/week
- Preferred timeline: ${timeline}

Return ONLY valid JSON. Do not include markdown, comments, prose, or code fences.
Use this exact shape:
{
  "targetRole": "string",
  "readinessScore": 0,
  "readinessSummary": "string, max 28 words",
  "aiInsight": {
    "whyGenerated": "string, why this plan fits the input",
    "biggestGaps": "string, largest readiness blockers",
    "fastestPath": "string, quickest improvement path",
    "focusFirst": "string, first focus area"
  },
  "planRationale": {
    "skillPriority": "string, why these skills are prioritized",
    "orderReasoning": "string, why this roadmap order is chosen",
    "timelineFit": "string, why the timeline fits the weekly hours"
  },
  "riskWarnings": [
    { "risk": "string", "impact": "string" }
  ],
  "nextBestAction": {
    "whatToDoToday": "string, one concrete task",
    "topicToStudyNext": "string",
    "estimatedTime": "string, e.g. 45 minutes or 2 hours",
    "whyItMatters": "string",
    "expectedOutcome": "string",
    "whatComesNext": "string"
  },
  "strengths": ["string"],
  "missingSkills": [
    { "skill": "string", "priority": "High|Medium|Low", "why": "string, max 18 words" }
  ],
  "roadmap": [
    {
      "weekNumber": 1,
      "title": "string",
      "focus": "string",
      "outcomes": ["string"],
      "tasks": ["string"],
      "resources": ["string"],
      "estimatedHours": 8
    }
  ],
  "projects": [
    {
      "title": "string",
      "difficulty": "Beginner|Intermediate|Advanced",
      "description": "string",
      "skills": ["string"],
      "deliverables": ["string"]
    }
  ],
  "interviewQuestions": [
    { "question": "string", "skill": "string", "idealAnswer": "string, max 32 words" }
  ]
}

Rules:
- readinessScore must be an integer from 0 to 100.
- nextBestAction must be immediately actionable today and fit the student's weekly hours.
- aiInsight, planRationale, and riskWarnings must be personalized to the input.
- riskWarnings must contain 2 to 3 items.
- roadmap must contain 6 to 8 weeks.
- each week must fit the student's weekly hours.
- missingSkills must contain 4 to 6 items.
- projects must contain exactly 3 items.
- interviewQuestions must contain exactly 5 items.
- Keep all text specific to the target role and current skills.
- Prefer common free learning resources by name, not URLs.`;
}

export const promptContractSummary = `PathWise asks Gemini for one strict JSON object containing readinessScore, readinessSummary, aiInsight, planRationale, riskWarnings, nextBestAction, strengths, missingSkills, roadmap, projects, and interviewQuestions. The server strips accidental code fences, parses JSON, validates required fields and enum values, normalizes array lengths, and falls back to deterministic role-specific content if parsing fails.`;
