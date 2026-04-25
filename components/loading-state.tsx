export function LoadingState({ label = "Loading PathWise..." }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="rounded-lg border border-ink/10 bg-white px-5 py-4 text-sm font-medium text-ink/70 shadow-soft">
        <span className="mr-3 inline-block h-3 w-3 animate-pulse rounded-full bg-leaf" />
        {label}
      </div>
    </div>
  );
}
