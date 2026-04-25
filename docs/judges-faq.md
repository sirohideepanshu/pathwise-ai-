# Judges FAQ

## What problem does PathWise AI solve?

It helps students turn a target role into a clear, personalized learning plan with skills, weekly tasks, projects, interview prep, and progress tracking.

## What makes it different from a course list?

PathWise starts from the student profile: current skills, level, study hours, and timeline. The output is a practical plan, not just a list of resources.

## Where is AI used?

Gemini generates the skill gaps, readiness summary, next best action, roadmap, projects, and interview questions. The app requests strict JSON and validates the response before showing or storing it.

## What happens if Gemini fails?

Demo mode loads a realistic sample AI-generated roadmap so the evaluation flow still works end to end.

## What happens if Supabase is not configured?

The app enters guest/demo mode and stores sample plans plus progress in browser local storage.

## Is progress persistent?

Yes. Authenticated users save progress to Supabase. Demo users save progress locally in the browser.

## Is this production-ready?

It is a polished MVP for prototype submission. Production next steps include richer analytics, stronger auth onboarding, PDF exports, resume parsing, and more resource recommendations.
