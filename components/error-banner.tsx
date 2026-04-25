export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-coral/25 bg-coral/10 px-4 py-3 text-sm font-medium text-ink">
      {message}
    </div>
  );
}
