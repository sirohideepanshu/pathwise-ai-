# PathWise AI Architecture

## Overview

PathWise AI is a Next.js App Router MVP with one focused user journey:

Landing -> Auth/Demo -> Onboarding -> AI plan generation -> Dashboard -> Roadmap/Prep -> Progress tracking.

## System Components

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- API: `POST /api/generate-plan` validates onboarding input and calls Gemini.
- AI layer: reusable prompt builder plus typed JSON parser and fallback response.
- Storage layer: Supabase persistence when configured, local storage demo mode otherwise.
- Database: Supabase Postgres with RLS policies scoped to authenticated users.

## Data Flow

1. Student enters target role, current skills, level, weekly hours, and optional timeline.
2. Frontend validates required fields.
3. API route validates again and sends a strict JSON prompt to Gemini.
4. Server parses and validates the Gemini response, including next best action, skill gaps, roadmap, projects, and interview questions.
5. Frontend saves the generated plan to Supabase or local demo storage.
6. Dashboard reads plan data and progress state.
7. Progress toggles update `progress_tracking` or local storage.

## Tables

- `users`: lightweight app user mirror.
- `user_profiles`: latest onboarding profile.
- `plans`: top-level AI-generated career plan, readiness score, and next best action.
- `roadmap_weeks`: week-by-week roadmap details.
- `projects`: recommended portfolio projects.
- `interview_questions`: generated practice questions.
- `progress_tracking`: per-week completion state.

## Deployment

Vercel hosts the Next.js app and API route. Supabase provides auth and Postgres. Gemini runs server-side through `GEMINI_API_KEY`.
