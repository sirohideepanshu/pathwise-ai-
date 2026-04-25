-- PathWise AI Supabase schema
-- Run this in the Supabase SQL editor before deploying with auth enabled.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  target_role text not null,
  current_level text not null check (current_level in ('Beginner', 'Intermediate', 'Advanced')),
  current_skills text[] not null default '{}',
  weekly_hours int not null check (weekly_hours between 1 and 40),
  target_timeline text,
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_role text not null,
  current_skills text[] not null default '{}',
  current_level text not null check (current_level in ('Beginner', 'Intermediate', 'Advanced')),
  weekly_hours int not null check (weekly_hours between 1 and 40),
  target_timeline text,
  readiness_score int not null check (readiness_score between 0 and 100),
  readiness_summary text not null,
  ai_insight jsonb not null default '{}'::jsonb,
  plan_rationale jsonb not null default '{}'::jsonb,
  risk_warnings jsonb not null default '[]'::jsonb,
  next_best_action jsonb not null default '{}'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  missing_skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_weeks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  week_number int not null,
  title text not null,
  focus text not null,
  outcomes text[] not null default '{}',
  tasks text[] not null default '{}',
  resources text[] not null default '{}',
  estimated_hours int not null default 8,
  unique (plan_id, week_number)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  title text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  description text not null,
  skills text[] not null default '{}',
  deliverables text[] not null default '{}'
);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  question text not null,
  skill text not null,
  ideal_answer text not null
);

create table if not exists public.progress_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  week_number int not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, plan_id, week_number)
);

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.plans enable row level security;
alter table public.roadmap_weeks enable row level security;
alter table public.projects enable row level security;
alter table public.interview_questions enable row level security;
alter table public.progress_tracking enable row level security;

create policy "Users can manage own user row"
on public.users for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can manage own profile"
on public.user_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own plans"
on public.plans for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read own roadmap weeks"
on public.roadmap_weeks for select
using (exists (select 1 from public.plans p where p.id = roadmap_weeks.plan_id and p.user_id = auth.uid()));

create policy "Users can insert own roadmap weeks"
on public.roadmap_weeks for insert
with check (exists (select 1 from public.plans p where p.id = roadmap_weeks.plan_id and p.user_id = auth.uid()));

create policy "Users can read own projects"
on public.projects for select
using (exists (select 1 from public.plans p where p.id = projects.plan_id and p.user_id = auth.uid()));

create policy "Users can insert own projects"
on public.projects for insert
with check (exists (select 1 from public.plans p where p.id = projects.plan_id and p.user_id = auth.uid()));

create policy "Users can read own interview questions"
on public.interview_questions for select
using (exists (select 1 from public.plans p where p.id = interview_questions.plan_id and p.user_id = auth.uid()));

create policy "Users can insert own interview questions"
on public.interview_questions for insert
with check (exists (select 1 from public.plans p where p.id = interview_questions.plan_id and p.user_id = auth.uid()));

create policy "Users can manage own progress"
on public.progress_tracking for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_progress_tracking_updated_at on public.progress_tracking;
create trigger set_progress_tracking_updated_at
before update on public.progress_tracking
for each row execute function public.set_updated_at();
