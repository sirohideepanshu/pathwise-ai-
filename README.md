# PathWise AI

PathWise AI is a full-stack hackathon MVP for student career readiness. It helps students choose a target role, detect skill gaps, generate a personalized action path, build portfolio proof, practice interviews, and track progress toward internship/job readiness.

## Problem Statement

Students often know the job title they want, but not the exact path from their current skills to a portfolio-ready profile. Generic course lists do not account for skill level, weekly availability, or interview readiness.

## Solution Overview

PathWise AI asks for a target career role, current skills, current level, weekly study hours, and an optional timeline. It uses Gemini to generate a structured career plan with:

- Skill-gap analysis
- 6-8 week personalized roadmap
- 3 portfolio project recommendations
- 5 interview questions with answer guidance
- Next best action for what to do today
- AI insight summary, plan rationale, and contextual risk warnings
- Readiness score and summary
- Checkbox progress tracking

If Gemini or Supabase environment variables are not configured, PathWise intentionally enters demo mode with a realistic sample AI-generated roadmap and browser local storage. The demo flow remains polished for judging while real mode works when keys are present.

## Features

- Next.js landing, auth/demo, onboarding, dashboard, roadmap, and prep screens
- Supabase email/password auth when configured
- Guest demo mode when auth setup is not available
- Gemini-powered structured JSON generation
- Typed validation and fallback handling for malformed AI output
- Derived readiness score based on skill match, roadmap completion, and plan consistency
- Supabase persistence for profiles, plans, roadmap weeks, projects, questions, and progress
- Responsive Tailwind UI with loading, error, empty, and sample states

## Architecture

- `app/api/generate-plan/route.ts`: validates user input and calls Gemini
- `lib/ai/prompts.ts`: reusable strict JSON prompt builder
- `lib/ai/parse.ts`: JSON extraction, normalization, and validation
- `lib/storage.ts`: Supabase persistence with local demo fallback
- `database/schema.sql`: Supabase tables, constraints, and RLS policies
- `app/*`: App Router pages for demo flow

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Next.js API route
- AI: Gemini API via the GA `@google/genai` SDK
- Database/Auth: Supabase
- Deployment: Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs without env vars in intentional demo mode. Add real keys when you want live Gemini generation and Supabase persistence.

## Environment Variables

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`GEMINI_API_KEY` is used only on the server. `NEXT_PUBLIC_SUPABASE_*` values are safe browser client values from Supabase project settings.

## Gemini Setup

1. Create or open a Google AI Studio project.
2. Generate an API key.
3. Add `GEMINI_API_KEY` to `.env.local` and to Vercel project environment variables.
4. Optionally set `GEMINI_MODEL`; the default is `gemini-2.5-flash`.

When Gemini is unavailable or returns malformed JSON, PathWise returns a deterministic role-specific demo plan with polished demo copy.

## Supabase Setup

1. Create a Supabase project.
2. Run `database/schema.sql` in the SQL editor.
3. Optionally run `database/seed.sql` for table inspection.
4. Enable email/password auth in Supabase.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` and Vercel.
6. Keep Row Level Security enabled; the included policies scope data to the authenticated user.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example`.
4. Vercel will use `vercel.json` with `npm install` and `npm run build`.
5. Deploy.

No custom build command is required. Vercel will run `npm install` and `npm run build`.

## Demo Flow

1. Open the landing page.
2. Click `Try sample path` or open `Sign in`.
3. Click `Try demo path`.
4. Review the sample dashboard.
5. Create a new plan from onboarding.
6. Toggle weekly progress.
7. Open roadmap details and prep kit.

Demo fallback account label: `demo@pathwise.ai`.

## How Gemini Is Used

Gemini generates the main intelligence layer: skill gaps, roadmap, projects, interview questions, next best action, AI insight summary, plan rationale, risk warnings, and readiness summary. The server uses the production `@google/genai` SDK, requests `application/json`, sends a response JSON schema, strips accidental code fences, validates fields and enum values, normalizes array lengths, and returns deterministic role-specific demo content if parsing fails.

Prompt details live in `docs/prompts.md`.

## Known Limitations

- Demo mode stores data in browser local storage.
- Supabase auth email confirmation depends on project settings.
- AI output quality depends on the configured Gemini model and API availability.
- This MVP focuses on one active student plan flow, not team/admin workflows.

## Future Scope

- Resume upload and skill extraction
- Calendar reminders
- Multi-role comparison
- Course/resource recommendations with links
- Mentor review and peer accountability
- Exportable PDF roadmap
