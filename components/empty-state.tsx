import Link from "next/link";
import { ClipboardList } from "lucide-react";

export function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-mint text-leaf">
        <ClipboardList aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink">No roadmap yet</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Create a readiness plan from your target role, skills, and weekly study hours. Demo mode includes a polished sample path for judges.
      </p>
      <Link
        href="/onboarding"
        className="focus-ring mt-5 inline-flex rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white"
      >
        Build my roadmap
      </Link>
    </div>
  );
}
