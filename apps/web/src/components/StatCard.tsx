import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  caption,
  icon,
  accent = "border-slate-200"
}: {
  label: string;
  value: string | number;
  caption?: string;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className={`rounded-lg border ${accent} bg-white p-5 shadow-sm`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon ? <div className="rounded-md bg-slate-50 p-2 text-slate-700">{icon}</div> : null}
      </div>
      <div className="text-3xl font-bold text-slate-950">{value}</div>
      {caption ? <p className="mt-2 text-sm text-slate-500">{caption}</p> : null}
    </div>
  );
}
