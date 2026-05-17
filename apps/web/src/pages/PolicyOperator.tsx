import { useEffect, useMemo, useState } from "react";
import { ArrowRight, GitBranch, ShieldAlert } from "lucide-react";
import { getJson, postJson, type Customer, type PolicyEvaluation } from "../api/client";
import { RiskScore } from "../components/RiskScore";
import { StatusBadge } from "../components/StatusBadge";

type PolicyMap = Record<string, Array<{ id: string; title: string; severity: string; description: string }>>;

export function PolicyOperator() {
  const [policies, setPolicies] = useState<PolicyMap>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null);

  useEffect(() => {
    Promise.all([getJson<PolicyMap>("/api/policies"), getJson<Customer[]>("/api/customers")]).then(([policyData, customerData]) => {
      setPolicies(policyData);
      setCustomers(customerData);
      setCustomerId(customerData[0]?.id ?? "");
    });
  }, []);

  const selected = useMemo(
    () => customers.find((customer) => customer.id === customerId) ?? customers[0],
    [customers, customerId]
  );

  const evaluate = async () => {
    if (!selected) return;
    const result = await postJson<PolicyEvaluation>("/api/policies/evaluate", { environment_profile: selected });
    setEvaluation(result);
  };

  const flow = ["Git", "CI Policy Validation", "ArgoCD PreSync", "Gatekeeper/Azure Policy", "Runtime Audit", "Support Runbook"];
  const failed = evaluation?.policy_results.filter((result) => result.status === "fail") ?? [];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Policy Operator</h2>
          <p className="page-subtitle">Policy enforcement prevents environment drift and reduces incident volume through repeatable validation gates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setEvaluation(null); }} className="input min-w-64">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          <button onClick={evaluate} className="primary-button">
            <ShieldAlert size={17} />
            Evaluate Policies
          </button>
        </div>
      </div>

      <div className="mt-6 panel">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch size={18} className="text-blue-600" />
          <h3 className="panel-title">Policy Flow</h3>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {flow.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className="min-w-40 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-800">
                {step}
              </div>
              {index < flow.length - 1 ? <ArrowRight className="hidden text-slate-400 xl:block" size={18} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatusCard label="Gatekeeper policy pack" status="pass" detail="Kubernetes baseline active" />
            <StatusCard label="Azure Policy add-on" status={selected?.platform_type === "Azure AKS" ? "pass" : "not applicable"} detail="Mapped where supported" />
            <StatusCard label="ArgoCD PreSync" status="pass" detail="Validation hook available" />
            <StatusCard label="CI/CD policy validation" status="pass" detail="Pipeline gate modeled" />
          </div>

          <div className="panel">
            <h3 className="panel-title">Policy Controls</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {Object.entries(policies).map(([category, controls]) => (
                <div key={category} className="rounded-md border border-slate-200 p-4">
                  <p className="font-bold text-slate-950">{category}</p>
                  <div className="mt-3 space-y-2">
                    {controls.map((control) => (
                      <div key={control.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                        <span className="text-sm font-semibold text-slate-700">{control.title}</span>
                        <StatusBadge value={control.severity} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h3 className="panel-title">Current Evaluation</h3>
            {evaluation ? (
              <div className="mt-4 space-y-5">
                <RiskScore value={100 - evaluation.risk_score} label="Policy confidence" />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Metric label="Passed" value={evaluation.summary.passed} />
                  <Metric label="Failed" value={evaluation.summary.failed} />
                  <Metric label="Total" value={evaluation.summary.total} />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">Run evaluation to calculate policy confidence, failures, and platform mappings.</p>
            )}
          </div>

          <div className="panel">
            <h3 className="panel-title">Current Violations</h3>
            <div className="mt-4 space-y-3">
              {failed.length ? failed.slice(0, 6).map((item) => (
                <div key={item.control_id} className="rounded-md border border-rose-200 bg-rose-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-rose-950">{item.control}</p>
                    <StatusBadge value="fail" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-rose-800">{item.remediation}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No evaluation yet, or no active violations.</p>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Platform Mappings</h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p><strong>OpenShift SCC:</strong> restricted-v2 and service account mapping.</p>
              <p><strong>Tanzu:</strong> package-aware pod security and ingress policy mapping.</p>
              <p><strong>Azure:</strong> Azure Policy add-on and diagnostic settings initiative.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ label, status, detail }: { label: string; status: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-slate-950">{label}</p>
        <StatusBadge value={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
