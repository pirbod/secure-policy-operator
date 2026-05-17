import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { getJson, postJson, type Assessment, type Customer } from "../api/client";
import { RiskScore } from "../components/RiskScore";
import { StatusBadge } from "../components/StatusBadge";

export function OnboardingFactory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [planVisible, setPlanVisible] = useState(false);

  useEffect(() => {
    getJson<Customer[]>("/api/customers").then((data) => {
      setCustomers(data);
      setSelectedId(data[0]?.id ?? "");
    });
  }, []);

  const selected = useMemo(
    () => customers.find((customer) => customer.id === selectedId) ?? customers[0],
    [customers, selectedId]
  );

  const runAssessment = async () => {
    if (!selected) return;
    const result = await postJson<Assessment>("/api/assess", { customer_profile: selected });
    setAssessment(result);
  };

  if (!selected) {
    return <div className="panel">Loading onboarding factory...</div>;
  }

  const timeline = [
    "Customer profile captured",
    "Cloud prerequisites validated",
    "Blueprint generated",
    "GitOps baseline synced",
    "Policy and observability gates passed",
    "Support handover completed"
  ];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Onboarding Factory</h2>
          <p className="page-subtitle">A repeatable path from customer inputs to validated, supportable cloud environments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={runAssessment} className="primary-button">
            <PlayCircle size={17} />
            Run Readiness Assessment
          </button>
          <button onClick={() => setPlanVisible(true)} className="secondary-button">
            <ClipboardList size={17} />
            Generate Onboarding Plan
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="panel">
          <label className="mini-label" htmlFor="onboarding-customer">Customer selection</label>
          <select id="onboarding-customer" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setAssessment(null); setPlanVisible(false); }} className="input mt-2">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>

          <div className="mt-5 space-y-4">
            <RiskScore value={selected.readiness_score} label="Current readiness" />
            <RiskScore value={selected.policy_compliance_score} label="Policy score" />
          </div>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="mini-label">Manual effort removed</p>
              <p className="mt-1 text-xl font-bold text-slate-950">65%</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="mini-label">Estimated time saved</p>
              <p className="mt-1 text-xl font-bold text-slate-950">12 weeks to 5 days</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel">
              <h3 className="panel-title">Onboarding Checklist</h3>
              <div className="mt-4 space-y-3">
                {selected.required_inputs.map((input, index) => (
                  <div key={input} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                    <CheckCircle2 size={18} className={index < 3 ? "text-emerald-600" : "text-slate-300"} />
                    <span className="text-sm font-semibold text-slate-700">{input}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3 className="panel-title">Readiness Gates</h3>
              <div className="mt-4 grid gap-3">
                <Gate label="Prerequisites" status={selected.blockers.length ? "watch" : "pass"} />
                <Gate label="Blueprint status" status={selected.deployment_status.includes("ready") || selected.deployment_status === "validated" ? "pass" : "watch"} />
                <Gate label="Policy validation" status={selected.policy_compliance_score >= 80 ? "pass" : "watch"} />
                <Gate label="Support handover" status={selected.support_handover_status === "complete" ? "pass" : "watch"} />
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Deployment Workflow Timeline</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {timeline.map((step, index) => (
                <div key={step} className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-400">Step {index + 1}</p>
                  <p className="mt-2 font-semibold text-slate-900">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {assessment ? (
            <div className="panel border-emerald-200">
              <h3 className="panel-title">Readiness Assessment Result</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <RiskScore value={assessment.pre_sales_readiness_score} label="Readiness" />
                <RiskScore value={100 - assessment.deployment_complexity_score} label="Simplicity" />
                <RiskScore value={assessment.security_and_policy_score} label="Security" />
                <RiskScore value={assessment.supportability_score} label="Support" />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <InfoList title="Missing information" items={selected.missing_information.length ? selected.missing_information : ["None"]} />
                <InfoList title="Blockers" items={selected.blockers.length ? selected.blockers : ["No active blockers"]} />
                <InfoList title="Automatable steps" items={selected.automatable_steps} />
                <InfoList title="Support handover requirements" items={["runbook mapping", "observability dashboard", "known issue owner", "go-live validation note"]} />
              </div>
            </div>
          ) : null}

          {planVisible ? (
            <div className="panel border-blue-200">
              <h3 className="panel-title">Generated Onboarding Plan</h3>
              <div className="mt-4 space-y-3">
                {timeline.map((step, index) => (
                  <div key={step} className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3">
                    <span className="font-semibold text-blue-950">{step}</span>
                    <span className="text-sm font-bold text-blue-700">Day {Math.min(index + 1, 5)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Gate({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 p-3">
      <span className="font-semibold text-slate-800">{label}</span>
      <StatusBadge value={status} />
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mini-label">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
