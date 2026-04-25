# PathWise AI Hackathon PPT Content

## Team Details

- Team Name: `[Your Team Name]`
- Members: `[Name 1]`, `[Name 2]`, `[Name 3]`
- Institution/Organization: `[Your Institution]`

## Problem Statement

Students often struggle to convert a career goal into a clear learning path. They need personalized guidance based on current skills, available study time, and readiness for projects and interviews.

## Brief About Solution

PathWise AI is an AI-powered student career guidance platform. It generates a skill-gap analysis, 6-8 week roadmap, project recommendations, interview questions, and progress tracker from a short onboarding form.

## Opportunities / Uniqueness / USP

- Personalized plan instead of generic course lists.
- Demo-ready even without API keys through sample mode.
- Combines learning roadmap, portfolio projects, interview prep, and progress tracking.
- Uses structured Gemini output with typed validation for reliable UX.

## Features

- Career goal input form
- Gemini-powered skill-gap analysis
- 6-8 week personalized roadmap
- 3 portfolio project recommendations
- 5 interview questions
- Next best action for what to do today
- Readiness score
- Weekly checkbox progress tracking
- Supabase auth and persistence
- Guest/demo mode

## Process Flow

Student input -> Gemini generation -> JSON validation -> Save to Supabase/local demo storage -> Dashboard -> Roadmap and prep -> Progress updates.

## Architecture

- Next.js App Router frontend
- Next.js API route backend
- Gemini API for plan generation
- Supabase Auth and Postgres for persistence
- Vercel for deployment

## Technologies

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Gemini API
- Vercel

## MVP Snapshots Placeholders

- `[Landing page screenshot]`
- `[Onboarding form screenshot]`
- `[Dashboard screenshot]`
- `[Roadmap details screenshot]`
- `[Projects and interview prep screenshot]`

## Future Scope

- Resume upload and automatic skill extraction
- Calendar reminders and streaks
- Course/resource link recommendations
- PDF roadmap export
- Mentor feedback
- Multi-role comparison

## Links

- GitHub: `[GitHub link]`
- Demo Video: `[Demo video link]`
- MVP Link: `[Vercel deployment link]`
