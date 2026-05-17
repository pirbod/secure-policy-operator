import { useEffect, useMemo, useState } from "react";
import { BookOpen, ClipboardCheck, FileText, RotateCcw } from "lucide-react";
import { getJson, type HealthRecord } from "../api/client";
import { RiskScore } from "../components/RiskScore";
import { StatusBadge } from "../components/StatusBadge";

export function EnvironmentOperations() {
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [actionPanel, setActionPanel] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    getJson<HealthRecord[]>("/api/operations/health").then((data) => {
      setHealth(data);
      setSelectedId(data[0]?.customer_id ?? "");
    });
  }, []);

  const selected = useMemo(
    () => health.find((item) => item.customer_id === selectedId) ?? health[0],
    [health, selectedId]
  );

  if (!selected) {
    return <div className="panel">Loading environment operations...</div>;
  }

  const actions = {
    validate: {
      title: "Validation Complete",
      body: `${selected.customer} was checked for drift, failed gates, policy violations, observability coverage, and support readiness.`
    },
    drift: {
      title: "Drift Simulation",
      body: `${selected.customer} now has a simulated namespace label change. The factory flags it before runtime impact.`
    },
    runbook: {
      title: "Runbook Opened",
      body: `Recommended runbook: policy violation remediation for ${selected.platform}, followed by incident handover if unresolved.`
    },
    summary: {
      title: "Support Summary",
      body: `${selected.customer}: ${selected.health_status} health, ${selected.deployment_drift} drift, ${selected.policy_violations} policy signals, ${selected.open_incidents} open incidents.`
    }
  };

  return (
    <section>
      <div>
        <h2 className="page-title">Environment Operations</h2>
        <p className="page-subtitle">Operate customer environments at scale with health, drift, observability, policy, and support readiness in one view.</p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="panel overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="panel-title">Customer Environments</h3>
            <StatusBadge value="live signals" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Health</th>
                  <th className="px-3 py-3">Drift</th>
                  <th className="px-3 py-3">Observability</th>
                  <th className="px-3 py-3">Policy</th>
                  <th className="px-3 py-3">Support</th>
                  <th className="px-3 py-3">Incidents</th>
                  <th className="px-3 py-3">Last validation</th>
                </tr>
              </thead>
              <tbody>
                {health.map((row) => (
                  <tr
                    key={row.customer_id}
                    onClick={() => setSelectedId(row.customer_id)}
                    className={`cursor-pointer border-t border-slate-100 ${selectedId === row.customer_id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-3 py-4">
                      <p className="font-bold text-slate-950">{row.customer}</p>
                      <p className="text-xs text-slate-500">{row.platform}</p>
                    </td>
                    <td className="px-3 py-4"><StatusBadge value={row.health_status} /></td>
                    <td className="px-3 py-4"><StatusBadge value={row.deployment_drift} /></td>
                    <td className="px-3 py-4">{row.observability_coverage}%</td>
                    <td className="px-3 py-4">{row.policy_violations} violations</td>
                    <td className="px-3 py-4">{row.support_readiness}%</td>
                    <td className="px-3 py-4">{row.open_incidents}</td>
                    <td className="px-3 py-4">{new Date(row.last_validation_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h3 className="panel-title">{selected.customer}</h3>
            <p className="mt-1 text-sm text-slate-500">{selected.platform}</p>
            <div className="mt-5 space-y-5">
              <RiskScore value={selected.observability_coverage} label="Observability" />
              <RiskScore value={selected.support_readiness} label="Support readiness" />
              <RiskScore value={100 - selected.policy_violations * 8} label="Policy confidence" />
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Operations Actions</h3>
            <div className="mt-4 grid gap-2">
              <button onClick={() => setActionPanel(actions.validate)} className="secondary-button justify-start">
                <ClipboardCheck size={17} />
                Validate Environment
              </button>
              <button onClick={() => setActionPanel(actions.drift)} className="secondary-button justify-start">
                <RotateCcw size={17} />
                Simulate Drift
              </button>
              <button onClick={() => setActionPanel(actions.runbook)} className="secondary-button justify-start">
                <BookOpen size={17} />
                Open Runbook
              </button>
              <button onClick={() => setActionPanel(actions.summary)} className="primary-button justify-start">
                <FileText size={17} />
                Generate Support Summary
              </button>
            </div>
          </div>

          {actionPanel ? (
            <div className="panel border-blue-200">
              <h3 className="panel-title">{actionPanel.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{actionPanel.body}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
