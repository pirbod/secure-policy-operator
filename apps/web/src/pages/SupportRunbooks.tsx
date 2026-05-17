import { useEffect, useMemo, useState } from "react";
import { BookMarked, FileText, LifeBuoy, SearchCheck } from "lucide-react";
import { getJson, postJson, type SupportCase } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";

type RunbookMap = Record<string, Array<{ id: string; title: string; platforms: string[]; triggers: string[]; steps: string[]; expected_outcome: string }>>;
type TriageResult = {
  issue_summary: string;
  likely_root_cause: string;
  severity: string;
  impacted_platform_layer: string;
  matching_known_issue: SupportCase | null;
  known_issue_match: string | null;
  evidence_required: string[];
  recommended_runbook: { id: string; title: string; steps: string[]; expected_outcome: string };
  runbook_steps: string[];
  escalation_path: string;
  escalation_decision: string;
  engineering_involvement_required: boolean;
  suggested_customer_response: string;
};
type Recommendation = { runbook: { id: string; title: string; steps: string[]; expected_outcome: string }; match_confidence: number; reason: string };

export function SupportRunbooks() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [runbooks, setRunbooks] = useState<RunbookMap>({});
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);

  useEffect(() => {
    Promise.all([getJson<SupportCase[]>("/api/support/cases"), getJson<RunbookMap>("/api/runbooks")]).then(([caseData, runbookData]) => {
      setCases(caseData);
      setRunbooks(runbookData);
      setSelectedCaseId(caseData[0]?.id ?? "");
    });
  }, []);

  const selected = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? cases[0],
    [cases, selectedCaseId]
  );

  const runTriage = async () => {
    if (!selected) return;
    setTriage(await postJson<TriageResult>("/api/support/triage", { description: selected.description }));
    setSummaryVisible(false);
  };

  const recommend = async () => {
    if (!selected) return;
    setRecommendation(await postJson<Recommendation>("/api/runbooks/recommend", {
      issue_category: selected.title,
      platform: selected.platform
    }));
  };

  if (!selected) {
    return <div className="panel">Loading support runbooks...</div>;
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Support Runbooks</h2>
          <p className="page-subtitle">Runbook-first triage for repeat issues across AKS, EKS, GKE, OpenShift, Tanzu, Kafka, OpenSearch, and databases.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={recommend} className="secondary-button">
            <BookMarked size={17} />
            Recommend Runbook
          </button>
          <button onClick={() => setSummaryVisible(true)} className="primary-button">
            <FileText size={17} />
            Create Support Summary
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Repeat issue reduction" value="55%" caption="self-service potential" icon={<LifeBuoy size={20} />} accent="border-emerald-200" />
        <StatCard label="Known cases" value={cases.length} caption="mapped to runbooks" icon={<SearchCheck size={20} />} accent="border-blue-200" />
        <StatCard label="Engineering required" value={triage?.engineering_involvement_required ? "Yes" : "No"} caption="current triage decision" icon={<BookMarked size={20} />} accent="border-violet-200" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[24rem_1fr]">
        <div className="panel">
          <h3 className="panel-title">Support Cases</h3>
          <div className="mt-4 space-y-3">
            {cases.map((supportCase) => (
              <button
                key={supportCase.id}
                onClick={() => {
                  setSelectedCaseId(supportCase.id);
                  setTriage(null);
                  setRecommendation(null);
                  setSummaryVisible(false);
                }}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedCaseId === supportCase.id
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="font-bold">{supportCase.title}</p>
                <p className={`mt-1 text-sm ${selectedCaseId === supportCase.id ? "text-slate-200" : "text-slate-500"}`}>{supportCase.platform}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h3 className="panel-title">{selected.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selected.description}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge value={selected.severity} />
                <StatusBadge value={selected.status} />
              </div>
            </div>
            <button onClick={runTriage} className="primary-button mt-5">
              <SearchCheck size={17} />
              Triage Case
            </button>
          </div>

          {triage ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="panel border-blue-200">
                <h3 className="panel-title">Triage Panel</h3>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <p><strong>Likely root cause:</strong> {triage.likely_root_cause}</p>
                  <p><strong>Severity:</strong> {triage.severity}</p>
                  <p><strong>Impacted layer:</strong> {triage.impacted_platform_layer}</p>
                  <p><strong>Known issue match:</strong> {triage.known_issue_match ?? "No exact match"}</p>
                  <p><strong>Escalation decision:</strong> {triage.escalation_decision}</p>
                  <p><strong>Escalation:</strong> {triage.escalation_path}</p>
                  <p><strong>Engineering involvement required:</strong> {triage.engineering_involvement_required ? "true" : "false"}</p>
                </div>
              </div>
              <div className="panel border-emerald-200">
                <h3 className="panel-title">Recommended Runbook</h3>
                <p className="mt-3 font-bold text-slate-950">{triage.recommended_runbook.title}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {triage.runbook_steps.map((step) => (
                    <li key={step}>- {step}</li>
                  ))}
                </ul>
              </div>
              <div className="panel border-amber-200 lg:col-span-2">
                <h3 className="panel-title">Evidence Required</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {triage.evidence_required.map((item) => (
                    <div key={item} className="rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">{item}</div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600"><strong>Customer response:</strong> {triage.suggested_customer_response}</p>
              </div>
            </div>
          ) : null}

          {recommendation ? (
            <div className="panel border-violet-200">
              <h3 className="panel-title">Runbook Recommendation</h3>
              <p className="mt-2 text-sm text-slate-500">{recommendation.reason}</p>
              <p className="mt-4 text-lg font-bold text-slate-950">{recommendation.runbook.title}</p>
              <p className="mt-1 text-sm font-semibold text-violet-700">Confidence {recommendation.match_confidence}%</p>
            </div>
          ) : null}

          {summaryVisible ? (
            <div className="panel border-amber-200">
              <h3 className="panel-title">Knowledge Capture Panel</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selected.title} is captured as a repeat issue. Support should attach the runbook outcome, customer impact, platform layer, and escalation decision to improve future self-service.
              </p>
            </div>
          ) : null}

          <div className="panel">
            <h3 className="panel-title">Runbook Library</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {Object.entries(runbooks).map(([category, entries]) => (
                <div key={category} className="rounded-md border border-slate-200 p-4">
                  <p className="font-bold capitalize text-slate-950">{category}</p>
                  <p className="mt-1 text-sm text-slate-500">{entries.length} runbook patterns</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
