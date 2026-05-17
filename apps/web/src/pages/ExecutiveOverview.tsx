import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock3, Cloud, Headphones, ShieldCheck, TrendingDown, Zap } from "lucide-react";
import { getJson, type Customer, type ExecutiveSummary } from "../api/client";
import { CloudProviderBadge } from "../components/CloudProviderBadge";
import { RiskScore } from "../components/RiskScore";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";

const recurringIssueTrend = [
  { month: "Jan", issues: 22 },
  { month: "Feb", issues: 19 },
  { month: "Mar", issues: 16 },
  { month: "Apr", issues: 13 },
  { month: "May", issues: 10 },
  { month: "Jun", issues: 8 }
];

const chartColors = ["#2563eb", "#f97316", "#16a34a", "#7c3aed", "#0891b2"];

export function ExecutiveOverview() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [focus, setFocus] = useState<"speed" | "support" | "risk">("speed");

  useEffect(() => {
    Promise.all([
      getJson<ExecutiveSummary>("/api/executive-summary"),
      getJson<Customer[]>("/api/customers")
    ]).then(([summaryData, customerData]) => {
      setSummary(summaryData);
      setCustomers(customerData);
    });
  }, []);

  const platformData = useMemo(() => {
    const counts = customers.reduce<Record<string, number>>((acc, customer) => {
      acc[customer.platform_type] = (acc[customer.platform_type] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([platform, count]) => ({ platform, count }));
  }, [customers]);

  if (!summary) {
    return <div className="panel">Loading executive summary...</div>;
  }

  const focusText = {
    speed: "Standard blueprints compress onboarding from long bespoke projects into a five-day factory workflow.",
    support: "Known issue mapping and reusable runbooks let support resolve repeat incidents before engineering joins.",
    risk: "Policy-as-code and drift checks reduce environment inconsistency before it becomes a customer incident."
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Executive Overview</h2>
          <p className="page-subtitle">From months to days, with repeatable customer cloud patterns.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["speed", "support", "risk"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFocus(item)}
              className={focus === item ? "primary-button" : "secondary-button"}
            >
              {item === "speed" ? "Speed" : item === "support" ? "Support" : "Risk"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mini-label">Executive message</p>
        <p className="mt-2 text-lg font-semibold leading-8 text-slate-900">{focusText[focus]}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customer environments" value={summary.total_customer_environments} caption="multi-cloud demo set" icon={<Cloud size={20} />} accent="border-blue-200" />
        <StatCard label="Onboarding time" value={summary.estimated_onboarding_time_reduction} caption="factory target" icon={<Clock3 size={20} />} accent="border-emerald-200" />
        <StatCard label="Support self-service" value={`${summary.business_metrics.support_self_service_potential}%`} caption="deflection potential" icon={<Headphones size={20} />} accent="border-violet-200" />
        <StatCard label="Incident reduction" value={summary.incident_reduction_estimate} caption="consistency estimate" icon={<TrendingDown size={20} />} accent="border-rose-200" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="panel-title">Readiness By Customer</h3>
            <StatusBadge value="validated" />
          </div>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={customers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="readiness_score" radius={[6, 6, 0, 0]}>
                  {customers.map((customer, index) => (
                    <Cell key={customer.id} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Multi-Cloud Coverage</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={platformData} dataKey="count" nameKey="platform" innerRadius={54} outerRadius={92} paddingAngle={3}>
                  {platformData.map((entry, index) => (
                    <Cell key={entry.platform} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {platformData.map((entry) => (
              <div key={entry.platform} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">{entry.platform}</span>
                <span className="font-bold text-slate-950">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="panel">
          <h3 className="panel-title">Environment Factory Scorecards</h3>
          <div className="mt-5 space-y-5">
            <RiskScore value={summary.average_deployment_readiness_score} label="Deployment readiness" />
            <RiskScore value={summary.average_policy_compliance_score} label="Policy compliance" />
            <RiskScore value={Number(summary.business_metrics.observability_coverage_target)} label="Observability target" />
          </div>
        </div>
        <div className="panel">
          <h3 className="panel-title">Recurring Issues Reduced</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={recurringIssueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="issues" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="panel-title">Top Operational Risks</h3>
          </div>
          <div className="space-y-3">
            {summary.top_operational_risks.map((risk) => (
              <div key={risk.risk} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{risk.risk}</p>
                <p className="text-sm text-slate-500">{risk.affected_environments} environment signal</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 panel">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h3 className="panel-title">Latest Environment Health</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{customer.name}</p>
                  <p className="text-sm text-slate-500">{customer.platform_type}</p>
                </div>
                <CloudProviderBadge provider={customer.cloud_provider} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="mini-label">Readiness</p>
                  <p className="font-bold text-slate-950">{customer.readiness_score}</p>
                </div>
                <div>
                  <p className="mini-label">Support</p>
                  <p className="font-bold text-slate-950">{customer.support_readiness}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
