import type { CareerInput, GeneratedPlan, StoredPlan } from "@/lib/types";

export const sampleInput: CareerInput = {
  targetRole: "Frontend Developer",
  currentSkills: ["HTML", "CSS", "JavaScript basics"],
  currentLevel: "Beginner",
  weeklyHours: 8,
  targetTimeline: "8 weeks"
};

export const sampleGeneratedPlan: GeneratedPlan = {
  targetRole: "Frontend Developer",
  readinessScore: 42,
  readinessSummary:
    "You have a solid foundation in web basics. The fastest path is to strengthen TypeScript, React, component thinking, API integration, and deployment habits.",
  aiInsight: {
    whyGenerated:
      "This plan was generated from a beginner frontend profile with HTML, CSS, JavaScript basics, and 8 weekly study hours.",
    biggestGaps: "The biggest blockers are React fundamentals, TypeScript, and API-driven UI work.",
    fastestPath:
      "Move from component foundations to typed data fetching, then prove the skills through a small deployed dashboard.",
    focusFirst: "Start with React components and TypeScript props because they unlock the later portfolio project work."
  },
  planRationale: {
    skillPriority:
      "React and TypeScript are prioritized because they are expected in most modern frontend internship projects.",
    orderReasoning:
      "The roadmap starts with JavaScript and React foundations before introducing typed APIs and deployment polish.",
    timelineFit:
      "Six focused weeks at 8 hours per week is enough for one portfolio-ready build plus interview practice."
  },
  riskWarnings: [
    {
      risk: "Skipping React fundamentals",
      impact: "Later project weeks become slower because component design is the base of the frontend workflow."
    },
    {
      risk: "Ignoring portfolio deliverables",
      impact: "Readiness may improve on paper, but internship reviewers will not see proof of applied skill."
    },
    {
      risk: "Delaying interview practice",
      impact: "Concept gaps may stay hidden until the final week, when they are harder to fix quickly."
    }
  ],
  nextBestAction: {
    whatToDoToday: "Build a small React card component and pass data through typed props.",
    topicToStudyNext: "React components and TypeScript props",
    estimatedTime: "60 minutes",
    whyItMatters: "This is the first skill bridge from static pages to reusable frontend product UI.",
    expectedOutcome: "A reusable, typed component that can become part of the portfolio dashboard.",
    whatComesNext: "Use the component inside a small dashboard layout and connect it to sample data."
  },
  strengths: ["HTML/CSS fundamentals", "JavaScript basics", "Clear target role"],
  missingSkills: [
    {
      skill: "React fundamentals",
      priority: "High",
      why: "Most frontend roles expect component-based UI development and hooks."
    },
    {
      skill: "TypeScript",
      priority: "High",
      why: "Type safety is common in production frontend teams and improves code quality."
    },
    {
      skill: "API integration",
      priority: "Medium",
      why: "Frontend developers need to fetch, transform, and render real data."
    },
    {
      skill: "Testing and debugging",
      priority: "Medium",
      why: "Basic test and browser debugging skills help you ship reliable interfaces."
    }
  ],
  roadmap: [
    {
      weekNumber: 1,
      title: "Modern JavaScript Refresh",
      focus: "ES modules, arrays, objects, async basics",
      outcomes: ["Use modern syntax confidently", "Write small reusable functions"],
      tasks: ["Review map/filter/reduce", "Build a task list with local state", "Practice fetch with a public API"],
      resources: ["MDN JavaScript Guide", "javascript.info async chapter"],
      estimatedHours: 8
    },
    {
      weekNumber: 2,
      title: "React Foundations",
      focus: "Components, props, state, events",
      outcomes: ["Break screens into components", "Manage simple UI state"],
      tasks: ["Build reusable cards and forms", "Practice controlled inputs", "Create a small dashboard mock"],
      resources: ["React Learn: Describing the UI", "React Learn: State"],
      estimatedHours: 8
    },
    {
      weekNumber: 3,
      title: "React Hooks and Data",
      focus: "Effects, loading states, API calls",
      outcomes: ["Fetch data safely", "Handle loading and error states"],
      tasks: ["Build a search page", "Add empty states", "Refactor repeated UI patterns"],
      resources: ["React Learn: Effects", "Next.js data fetching basics"],
      estimatedHours: 8
    },
    {
      weekNumber: 4,
      title: "TypeScript for UI",
      focus: "Types, interfaces, component props",
      outcomes: ["Type React props", "Model API responses"],
      tasks: ["Convert a React mini app to TypeScript", "Add typed utility functions"],
      resources: ["TypeScript Handbook", "React TypeScript Cheatsheet"],
      estimatedHours: 8
    },
    {
      weekNumber: 5,
      title: "Next.js App Router",
      focus: "Routing, layouts, server/client components",
      outcomes: ["Build multi-page apps", "Understand deployment structure"],
      tasks: ["Create landing, dashboard, and detail pages", "Use route params", "Deploy a preview"],
      resources: ["Next.js App Router docs", "Vercel deployment docs"],
      estimatedHours: 8
    },
    {
      weekNumber: 6,
      title: "Polish and Portfolio",
      focus: "Responsive UI, accessibility, project presentation",
      outcomes: ["Ship a portfolio-ready project", "Explain decisions in interviews"],
      tasks: ["Improve mobile layout", "Write a concise README", "Record a two-minute demo"],
      resources: ["web.dev accessibility", "Frontend Mentor style guides"],
      estimatedHours: 8
    }
  ],
  projects: [
    {
      title: "Personal Learning Dashboard",
      difficulty: "Beginner",
      description: "A responsive dashboard that tracks goals, habits, and weekly learning stats.",
      skills: ["React", "TypeScript", "Local storage", "Responsive CSS"],
      deliverables: ["Dashboard page", "Goal form", "Progress widgets", "Deployed link"]
    },
    {
      title: "API-Powered Job Board",
      difficulty: "Intermediate",
      description: "A searchable job board that filters roles by skill, location, and seniority.",
      skills: ["API fetching", "Search UX", "Loading states", "Next.js routing"],
      deliverables: ["Search page", "Role details page", "Saved jobs state", "README"]
    },
    {
      title: "Portfolio Case Study Site",
      difficulty: "Intermediate",
      description: "A polished portfolio project with project writeups, screenshots, and deployment notes.",
      skills: ["UI polish", "Content structure", "Accessibility", "Deployment"],
      deliverables: ["Home page", "Case study page", "Contact section", "Live demo"]
    }
  ],
  interviewQuestions: [
    {
      question: "How do props and state differ in React?",
      skill: "React fundamentals",
      idealAnswer:
        "Props are passed from a parent and treated as inputs. State is owned by a component and changes over time in response to user actions or data."
    },
    {
      question: "What makes a React component reusable?",
      skill: "Component design",
      idealAnswer:
        "Reusable components have clear props, avoid hard-coded page-specific data, and separate display concerns from business logic."
    },
    {
      question: "How would you handle loading and error states for an API request?",
      skill: "API integration",
      idealAnswer:
        "Track loading, success, and error states, show useful feedback for each state, and avoid rendering incomplete data without checks."
    },
    {
      question: "Why is TypeScript useful in frontend projects?",
      skill: "TypeScript",
      idealAnswer:
        "It catches shape mismatches early, documents component contracts, and makes refactors safer across a growing UI codebase."
    },
    {
      question: "How do you make a page responsive?",
      skill: "Responsive design",
      idealAnswer:
        "Use flexible layouts, sensible breakpoints, scalable spacing, and test key workflows across mobile and desktop widths."
    }
  ]
};

export const sampleStoredPlan: StoredPlan = {
  ...sampleGeneratedPlan,
  id: "demo_frontend_path",
  createdAt: new Date().toISOString(),
  input: sampleInput,
  progress: {
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  },
  source: "demo"
};
