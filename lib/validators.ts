import type { CareerInput, StudentLevel } from "@/lib/types";

const levels: StudentLevel[] = ["Beginner", "Intermediate", "Advanced"];

export function validateCareerInput(input: CareerInput) {
  const errors: Partial<Record<keyof CareerInput, string>> = {};

  if (!input.targetRole.trim()) errors.targetRole = "Choose a target role.";
  if (input.targetRole.trim().length > 80) errors.targetRole = "Keep the target role under 80 characters.";
  if (!levels.includes(input.currentLevel)) errors.currentLevel = "Choose a valid level.";
  if (!input.currentSkills.length) errors.currentSkills = "Add at least one current skill.";
  if (input.currentSkills.some((skill) => skill.length > 40)) {
    errors.currentSkills = "Keep each skill under 40 characters.";
  }
  if (!Number.isFinite(input.weeklyHours) || input.weeklyHours < 1 || input.weeklyHours > 40) {
    errors.weeklyHours = "Study hours must be between 1 and 40.";
  }
  if (input.targetTimeline && input.targetTimeline.length > 40) {
    errors.targetTimeline = "Keep the timeline under 40 characters.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors
  };
}
