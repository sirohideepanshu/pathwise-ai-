import { clamp } from "@/lib/utils";

export function ReadinessMeter({ score }: { score: number }) {
  const safeScore = clamp(score, 0, 100);
  const color = safeScore >= 70 ? "#2f6f4e" : safeScore >= 45 ? "#f5a43b" : "#f47b64";

  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${safeScore * 3.6}deg, rgba(23,32,26,0.1) 0deg)`
        }}
      />
      <div className="absolute inset-3 rounded-full bg-white" />
      <div className="relative text-center">
        <div className="text-3xl font-bold text-ink">{safeScore}</div>
        <div className="text-xs font-medium uppercase text-ink/55">Ready</div>
      </div>
    </div>
  );
}
