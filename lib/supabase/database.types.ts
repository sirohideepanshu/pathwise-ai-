import type {
  AIInsight,
  InterviewQuestion,
  NextBestAction,
  PlanRationale,
  ProjectRecommendation,
  RiskWarning,
  SkillGap,
  StudentLevel
} from "@/lib/types";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          target_role: string;
          current_level: StudentLevel;
          current_skills: string[];
          weekly_hours: number;
          target_timeline: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_role: string;
          current_level: StudentLevel;
          current_skills: string[];
          weekly_hours: number;
          target_timeline?: string | null;
          updated_at?: string;
        };
        Update: {
          target_role?: string;
          current_level?: StudentLevel;
          current_skills?: string[];
          weekly_hours?: number;
          target_timeline?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          target_role: string;
          current_skills: string[];
          current_level: StudentLevel;
          weekly_hours: number;
          target_timeline: string | null;
          readiness_score: number;
          readiness_summary: string;
          ai_insight: AIInsight | null;
          plan_rationale: PlanRationale | null;
          risk_warnings: RiskWarning[] | null;
          next_best_action: NextBestAction | null;
          strengths: string[];
          missing_skills: SkillGap[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_role: string;
          current_skills: string[];
          current_level: StudentLevel;
          weekly_hours: number;
          target_timeline?: string | null;
          readiness_score: number;
          readiness_summary: string;
          ai_insight?: AIInsight | null;
          plan_rationale?: PlanRationale | null;
          risk_warnings?: RiskWarning[] | null;
          next_best_action?: NextBestAction | null;
          strengths: string[];
          missing_skills: SkillGap[];
          created_at?: string;
        };
        Update: {
          target_role?: string;
          current_skills?: string[];
          current_level?: StudentLevel;
          weekly_hours?: number;
          target_timeline?: string | null;
          readiness_score?: number;
          readiness_summary?: string;
          ai_insight?: AIInsight | null;
          plan_rationale?: PlanRationale | null;
          risk_warnings?: RiskWarning[] | null;
          next_best_action?: NextBestAction | null;
          strengths?: string[];
          missing_skills?: SkillGap[];
        };
        Relationships: [];
      };
      roadmap_weeks: {
        Row: {
          id: string;
          plan_id: string;
          week_number: number;
          title: string;
          focus: string;
          outcomes: string[];
          tasks: string[];
          resources: string[];
          estimated_hours: number;
        };
        Insert: {
          id?: string;
          plan_id: string;
          week_number: number;
          title: string;
          focus: string;
          outcomes: string[];
          tasks: string[];
          resources: string[];
          estimated_hours: number;
        };
        Update: Partial<Database["public"]["Tables"]["roadmap_weeks"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          plan_id: string;
          title: string;
          difficulty: ProjectRecommendation["difficulty"];
          description: string;
          skills: string[];
          deliverables: string[];
        };
        Insert: {
          id?: string;
          plan_id: string;
          title: string;
          difficulty: ProjectRecommendation["difficulty"];
          description: string;
          skills: string[];
          deliverables: string[];
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      interview_questions: {
        Row: {
          id: string;
          plan_id: string;
          question: string;
          skill: string;
          ideal_answer: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          question: string;
          skill: string;
          ideal_answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["interview_questions"]["Insert"]>;
        Relationships: [];
      };
      progress_tracking: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          week_number: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          week_number: number;
          completed: boolean;
          updated_at?: string;
        };
        Update: {
          completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
