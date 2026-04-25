# API Spec

## POST `/api/generate-plan`

Generates a career guidance plan from student onboarding data.

### Request

```json
{
  "targetRole": "Data Analyst",
  "currentSkills": ["Excel", "SQL basics", "Python basics"],
  "currentLevel": "Beginner",
  "weeklyHours": 8,
  "targetTimeline": "8 weeks"
}
```

### Validation

- `targetRole`: required string
- `currentSkills`: at least one item; accepts an array or a comma-separated string
- `currentLevel`: `Beginner`, `Intermediate`, or `Advanced`
- `weeklyHours`: number from `1` to `40`
- `targetTimeline`: optional string

### Success Response

```json
{
  "plan": {
    "targetRole": "Data Analyst",
    "readinessScore": 45,
    "readinessSummary": "Concise readiness summary",
    "aiInsight": {
      "whyGenerated": "Generated from the target role, current skills, level, and weekly hours.",
      "biggestGaps": "SQL depth and dashboard storytelling are the biggest gaps.",
      "fastestPath": "Build SQL fluency, apply it in a dashboard, then practice explaining decisions.",
      "focusFirst": "Intermediate SQL joins"
    },
    "planRationale": {
      "skillPriority": "SQL and data cleaning are prioritized because they unblock most analyst tasks.",
      "orderReasoning": "The roadmap moves from foundations to applied portfolio proof.",
      "timelineFit": "The weekly milestones fit 8 focused study hours."
    },
    "riskWarnings": [
      {
        "risk": "Skipping SQL joins",
        "impact": "Later project analysis will be slower and less credible."
      }
    ],
    "nextBestAction": {
      "whatToDoToday": "Complete one SQL joins exercise and write three notes.",
      "topicToStudyNext": "Intermediate SQL joins",
      "estimatedTime": "60 minutes",
      "whyItMatters": "It unlocks the first analysis project.",
      "expectedOutcome": "A small query artifact you can reuse.",
      "whatComesNext": "Apply the query in the portfolio dashboard."
    },
    "strengths": ["Excel"],
    "missingSkills": [],
    "roadmap": [],
    "projects": [],
    "interviewQuestions": []
  },
  "source": "gemini"
}
```

### Fallback Response

```json
{
  "plan": {},
  "source": "fallback",
  "warning": "Demo mode: sample AI-generated roadmap loaded for evaluation."
}
```

### Error Response

```json
{
  "error": "Invalid career input.",
  "details": {
    "weeklyHours": "Study hours must be between 1 and 40."
  }
}
```
