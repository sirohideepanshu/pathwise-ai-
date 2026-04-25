# AGENTS.md

## Project
PathWise AI is a hackathon-ready MVP for AI-powered student career guidance.

## Product Priorities
- Keep the app complete, demo-friendly, and easy to deploy.
- Prefer simple working flows over broad feature sets.
- Preserve guest/demo mode whenever external services are unavailable.
- Maintain typed Gemini prompts, parsing, validation, and fallback behavior.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Gemini API
- Vercel deployment target

## Coding Rules
- Use TypeScript for app, API, and data contracts.
- Keep components small and readable.
- Handle loading, empty, and error states for every user flow.
- Do not store secrets in client code. Only `NEXT_PUBLIC_*` Supabase values are browser-exposed.
- If Gemini or Supabase env vars are missing, keep the browser demo flow working.

## Demo Rules
- The fastest judge flow is: Landing -> Demo / Sign in -> Enter demo mode -> Dashboard -> Roadmap -> Prep kit.
- Avoid adding features that make the demo slower or require extra setup.
