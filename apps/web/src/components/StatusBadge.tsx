const tones: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch: "bg-amber-50 text-amber-700 border-amber-200",
  risk: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fail: "bg-rose-50 text-rose-700 border-rose-200",
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tones[key] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {value.split("-").join(" ")}
    </span>
  );
}
