"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/lib/storage";

export function NavHeader({ showSignOut = false }: { showSignOut?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf text-white">
            <BrainCircuit size={20} aria-hidden="true" />
          </span>
          <span>PathWise AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white"
          >
            <Sparkles size={16} aria-hidden="true" />
            New plan
          </Link>
          {showSignOut ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-ink/15 bg-white text-ink"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
