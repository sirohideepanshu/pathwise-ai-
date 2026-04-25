-- Optional local/demo seed. This is useful for inspecting tables in Supabase.
-- The running app also includes browser demo data, so this seed is not required.

insert into public.users (id, email)
values ('00000000-0000-0000-0000-000000000001', 'demo@pathwise.ai')
on conflict (id) do nothing;

insert into public.user_profiles (user_id, target_role, current_level, current_skills, weekly_hours, target_timeline)
values (
  '00000000-0000-0000-0000-000000000001',
  'Frontend Developer',
  'Beginner',
  array['HTML', 'CSS', 'JavaScript basics'],
  8,
  '8 weeks'
)
on conflict (user_id) do update set
  target_role = excluded.target_role,
  current_level = excluded.current_level,
  current_skills = excluded.current_skills,
  weekly_hours = excluded.weekly_hours,
  target_timeline = excluded.target_timeline;

with inserted_plan as (
  insert into public.plans (
    id,
    user_id,
    target_role,
    current_skills,
    current_level,
    weekly_hours,
    target_timeline,
    readiness_score,
    readiness_summary,
    ai_insight,
    plan_rationale,
    risk_warnings,
    next_best_action,
    strengths,
    missing_skills
  )
  values (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Frontend Developer',
    array['HTML', 'CSS', 'JavaScript basics'],
    'Beginner',
    8,
    '8 weeks',
    42,
    'Strengthen React, TypeScript, API integration, and deployment habits to become job-project ready.',
    '{"whyGenerated":"This plan was generated from a beginner frontend profile with HTML, CSS, JavaScript basics, and 8 weekly study hours.","biggestGaps":"The biggest blockers are React fundamentals, TypeScript, and API-driven UI work.","fastestPath":"Move from component foundations to typed data fetching, then prove the skills through a deployed dashboard.","focusFirst":"Start with React components and TypeScript props because they unlock portfolio project work."}'::jsonb,
    '{"skillPriority":"React and TypeScript are prioritized because they are expected in most modern frontend internship projects.","orderReasoning":"The roadmap starts with JavaScript and React foundations before introducing typed APIs and deployment polish.","timelineFit":"Six focused weeks at 8 hours per week is enough for one portfolio-ready build plus interview practice."}'::jsonb,
    '[{"risk":"Skipping React fundamentals","impact":"Later project weeks become slower because component design is the base of the frontend workflow."},{"risk":"Ignoring portfolio deliverables","impact":"Readiness may improve on paper, but internship reviewers will not see proof of applied skill."}]'::jsonb,
    '{"whatToDoToday":"Build a small React card component and pass data through typed props.","topicToStudyNext":"React components and TypeScript props","estimatedTime":"60 minutes","whyItMatters":"This is the first skill bridge from static pages to reusable frontend product UI.","expectedOutcome":"A reusable, typed component that can become part of the portfolio dashboard.","whatComesNext":"Use the component inside a small dashboard layout and connect it to sample data."}'::jsonb,
    '["HTML/CSS fundamentals", "JavaScript basics", "Clear target role"]'::jsonb,
    '[
      {"skill":"React fundamentals","priority":"High","why":"Most frontend roles expect component-driven UI work."},
      {"skill":"TypeScript","priority":"High","why":"Type safety is common in production frontend teams."},
      {"skill":"API integration","priority":"Medium","why":"Frontend apps usually render real backend data."},
      {"skill":"Testing and debugging","priority":"Medium","why":"Reliable UI work requires systematic issue finding."}
    ]'::jsonb
  )
  on conflict (id) do update set readiness_score = excluded.readiness_score
  returning id
)
insert into public.roadmap_weeks (plan_id, week_number, title, focus, outcomes, tasks, resources, estimated_hours)
select '10000000-0000-0000-0000-000000000001', week_number, title, focus, outcomes, tasks, resources, 8
from (
  values
  (1, 'Modern JavaScript Refresh', 'ES modules, arrays, objects, async basics', array['Use modern syntax confidently'], array['Review map/filter/reduce', 'Build a task list'], array['MDN JavaScript Guide']),
  (2, 'React Foundations', 'Components, props, state, events', array['Break screens into components'], array['Build reusable cards', 'Practice controlled inputs'], array['React Learn']),
  (3, 'React Hooks and Data', 'Effects, loading states, API calls', array['Fetch data safely'], array['Build a search page', 'Add empty states'], array['React Effects docs']),
  (4, 'TypeScript for UI', 'Interfaces, types, component props', array['Type React props'], array['Convert a mini app to TypeScript'], array['TypeScript Handbook']),
  (5, 'Next.js App Router', 'Routing, layouts, deployment', array['Build multi-page apps'], array['Create route pages', 'Deploy preview'], array['Next.js docs']),
  (6, 'Polish and Portfolio', 'Responsive UI, accessibility, project presentation', array['Ship a portfolio-ready project'], array['Improve mobile layout', 'Record demo'], array['web.dev accessibility'])
) as rows(week_number, title, focus, outcomes, tasks, resources)
on conflict (plan_id, week_number) do nothing;
