"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeekProgressToggle({
  checked,
  disabled,
  onChange
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-ring grid h-8 w-8 place-items-center rounded-lg border transition",
        checked ? "border-leaf bg-leaf text-white" : "border-ink/20 bg-white text-transparent",
        disabled && "cursor-not-allowed opacity-60"
      )}
      aria-label={checked ? "Mark week incomplete" : "Mark week complete"}
      title={checked ? "Complete" : "Mark complete"}
    >
      <Check size={18} aria-hidden="true" />
    </button>
  );
}
