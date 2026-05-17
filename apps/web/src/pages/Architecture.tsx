import { useState } from "react";
import { ArrowDown, CheckCircle2 } from "lucide-react";

const layers = [
  {
    title: "Pre-sales knowledge layer",
    detail: "Reusable answers, platform fit notes, prerequisites, and delivery expectations for Sales and Customer Success."
  },
  {
    title: "Customer profile and readiness layer",
    detail: "Structured inputs capture compliance, data dependencies, operational risks, and support handover status."
  },
  {
    title: "Deployment blueprint layer",
    detail: "Validated Terraform, GitOps, policy, observability, and runbook patterns per target platform."
  },
  {
    title: "GitOps and CI/CD layer",
    detail: "CI policy validation and ArgoCD PreSync gates stop broken manifests before cluster runtime."
  },
  {
    title: "Policy enforcement layer",
    detail: "Gatekeeper, Azure Policy, OpenShift SCC, and Tanzu mappings enforce baseline controls."
  },
  {
    title: "Observability and drift detection layer",
    detail: "Health, drift, policy violation, audit, and support readiness signals keep environments operable."
  },
  {
    title: "Support runbook layer",
    detail: "Known issue mapping lets Technical Support resolve repeat incidents without engineering by default."
  },
  {
    title: "Multi-cloud target layer",
    detail: "Azure AKS, AWS EKS, Google GKE, OpenShift, VMware Tanzu, and data platforms are handled through reusable patterns."
  }
];

const scaleReasons = [
  "patterns over one-off work",
  "validated blueprints",
  "reusable runbooks",
  "policy-as-code",
  "observable environments",
  "support self-service"
];

export function Architecture() {
  const [active, setActive] = useState(0);

  return (
    <section>
      <div>
        <h2 className="page-title">Architecture</h2>
        <p className="page-subtitle">A simple environment factory model that turns customer cloud delivery into validated, observable, supportable patterns.</p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="panel">
          <h3 className="panel-title">Factory Flow</h3>
          <div className="mt-5 grid gap-3">
            {layers.map((layer, index) => (
              <div key={layer.title}>
                <button
                  onClick={() => setActive(index)}
                  className={`w-full rounded-md border p-4 text-left transition ${
                    active === index
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold">{layer.title}</p>
                  <p className={`mt-2 text-sm leading-6 ${active === index ? "text-slate-200" : "text-slate-500"}`}>{layer.detail}</p>
                </button>
                {index < layers.length - 1 ? (
                  <div className="flex justify-center py-2 text-slate-400">
                    <ArrowDown size={18} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel border-blue-200">
            <p className="mini-label">Selected layer</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">{layers[active].title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{layers[active].detail}</p>
          </div>

          <div className="panel">
            <h3 className="panel-title">Why This Scales</h3>
            <div className="mt-4 space-y-3">
              {scaleReasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-semibold text-slate-800">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Target Platforms</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-800">
              {["Azure AKS", "AWS EKS", "Google GKE", "OpenShift", "VMware Tanzu", "Kafka", "OpenSearch", "Databases"].map((target) => (
                <div key={target} className="rounded-md bg-slate-50 px-3 py-3 text-center">{target}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
