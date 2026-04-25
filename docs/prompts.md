# Gemini Prompts

## Prompt Strategy

PathWise AI uses one deterministic, structured prompt for the MVP. The prompt asks Gemini to behave as a concise student career coach and return only valid JSON. The API call also sends a response JSON schema through the production `@google/genai` SDK, so the model is constrained before the server parser validates the result.

## Input Variables

- Target role
- Current level
- Current skills
- Weekly study hours
- Optional target timeline

## Output Contract

The API expects this typed shape:

```ts
interface GeneratedPlan {
  targetRole: string;
  readinessScore: number;
  readinessSummary: string;
  aiInsight: {
    whyGenerated: string;
    biggestGaps: string;
    fastestPath: string;
    focusFirst: string;
  };
  planRationale: {
    skillPriority: string;
    orderReasoning: string;
    timelineFit: string;
  };
  riskWarnings: Array<{
    risk: string;
    impact: string;
  }>;
  nextBestAction: {
    whatToDoToday: string;
    topicToStudyNext: string;
    estimatedTime: string;
    whyItMatters: string;
    expectedOutcome: string;
    whatComesNext: string;
  };
  strengths: string[];
  missingSkills: SkillGap[];
  roadmap: RoadmapWeek[];
  projects: ProjectRecommendation[];
  interviewQuestions: InterviewQuestion[];
}
```

## JSON Rules

- Return only JSON.
- Gemini is called with `responseMimeType: "application/json"` and a response JSON schema.
- No markdown or code fences.
- Readiness score must be `0-100`.
- Next best action must include task, next topic, estimated time, why it matters, expected outcome, and what comes next.
- AI insight, plan rationale, and risk warnings must be personalized to the input.
- Risk warnings must contain `2-3` items.
- Roadmap must contain `6-8` weeks.
- Projects must contain exactly `3` items.
- Interview questions must contain exactly `5` items.
- Missing skills must contain `4-6` items.
- Enum values are restricted to:
  - Priority: `High`, `Medium`, `Low`
  - Difficulty: `Beginner`, `Intermediate`, `Advanced`

## Fallback Handling

The server:

1. Extracts JSON from the Gemini response.
2. Parses the JSON safely.
3. Validates required fields, arrays, and enum values.
4. Normalizes lengths for roadmap, projects, and questions.
5. Falls back to deterministic role-specific demo data if parsing or validation fails.

## Source File

Prompt builder: `lib/ai/prompts.ts`
