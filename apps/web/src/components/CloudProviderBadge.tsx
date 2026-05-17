const colors: Record<string, string> = {
  Azure: "border-blue-200 bg-blue-50 text-blue-700",
  AWS: "border-orange-200 bg-orange-50 text-orange-700",
  GCP: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Hybrid: "border-violet-200 bg-violet-50 text-violet-700"
};

export function CloudProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${colors[provider] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {provider}
    </span>
  );
}
