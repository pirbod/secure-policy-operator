export function RiskScore({ value, label = "Score" }: { value: number; label?: string }) {
  const tone = value >= 85 ? "bg-emerald-500" : value >= 72 ? "bg-sky-500" : value >= 60 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="min-w-32">
      <div className="mb-2 flex items-end justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-lg font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(5, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}
