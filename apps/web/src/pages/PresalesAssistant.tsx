import { useEffect, useMemo, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { getJson, postJson, type Assessment, type Customer } from "../api/client";
import { CloudProviderBadge } from "../components/CloudProviderBadge";
import { RiskScore } from "../components/RiskScore";
import { StatusBadge } from "../components/StatusBadge";

export function PresalesAssistant() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [packVisible, setPackVisible] = useState(false);

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

  useEffect(() => {
    if (selected) {
      postJson<Assessment>("/api/assess", { customer_profile: selected }).then(setAssessment);
      setPackVisible(false);
    }
  }, [selected]);

  if (!selected || !assessment) {
    return <div className="panel">Loading pre-sales assistant...</div>;
  }

  const generatedAnswers = [
    ...assessment.suggested_questions,
    {
      question: "What observability is included?",
      answer: `${selected.platform_type} includes deployment drift, policy violation, health, audit, and support readiness signals.`,
      confidence: 90
    },
    {
      question: "What support model is required after go-live?",
      answer: "Technical Support owns runbook-first triage. Platform Engineering receives only escalations with validation evidence.",
      confidence: 87
    },
    {
      question: "How is policy compliance enforced?",
      answer: "CI checks, ArgoCD PreSync validation, Gatekeeper, cloud policy mappings, and runtime audit work together.",
      confidence: 92
    }
  ];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Pre-Sales Assistant</h2>
          <p className="page-subtitle">Reusable technical answers for Sales and Customer Success, grounded in customer profiles and validated platform patterns.</p>
        </div>
        <button onClick={() => setPackVisible(true)} className="primary-button">
          <FileText size={17} />
          Generate Pre-Sales Pack
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="panel">
          <label className="mini-label" htmlFor="customer">
            Mock customer
          </label>
          <select id="customer" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="input mt-2">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <div className="mt-5 rounded-md border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-950">{selected.name}</p>
                <p className="text-sm text-slate-500">{selected.industry}</p>
              </div>
              <CloudProviderBadge provider={selected.cloud_provider} />
            </div>
            <div className="mt-4 space-y-4">
              <RiskScore value={assessment.pre_sales_readiness_score} label="Pre-sales readiness" />
              <RiskScore value={assessment.supportability_score} label="Supportability" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <p className="mini-label">Platform fit</p>
              <p className="font-semibold text-slate-900">{selected.platform_type}</p>
            </div>
            <div>
              <p className="mini-label">Deployment approach</p>
              <p className="text-sm leading-6 text-slate-600">{assessment.recommended_deployment_pattern}</p>
            </div>
            <div>
              <p className="mini-label">Compliance notes</p>
              <div className="mt-2"><StatusBadge value={selected.compliance_level} /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <h3 className="panel-title">Generated Customer Answers</h3>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {generatedAnswers.map((item) => (
                <div key={item.question} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-950">{item.question}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.confidence}%</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {packVisible ? (
            <div className="panel border-blue-200">
              <h3 className="panel-title">Visible Pre-Sales Pack</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="mini-label">Fit</p>
                  <p className="mt-2 font-bold text-blue-950">{selected.platform_type} on {selected.cloud_provider}</p>
                </div>
                <div className="rounded-md bg-emerald-50 p-4">
                  <p className="mini-label">Timeline</p>
                  <p className="mt-2 font-bold text-emerald-950">5 business days after prerequisites</p>
                </div>
                <div className="rounded-md bg-amber-50 p-4">
                  <p className="mini-label">Confidence</p>
                  <p className="mt-2 font-bold text-amber-950">{assessment.pre_sales_readiness_score}% readiness</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mini-label">Operational expectations</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    {assessment.required_platform_capabilities.map((capability) => (
                      <li key={capability}>- {capability}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mini-label">Risks and mitigations</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    {assessment.risks_and_mitigations.slice(0, 4).map((item) => (
                      <li key={item.risk}>- {item.risk}: {item.mitigation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
