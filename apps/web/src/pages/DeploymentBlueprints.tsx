import { useEffect, useMemo, useState } from "react";
import { FileCode2, Layers3 } from "lucide-react";
import { getJson, postJson, type Blueprint, type Customer } from "../api/client";
import { RiskScore } from "../components/RiskScore";
import { StatusBadge } from "../components/StatusBadge";

type GeneratedBlueprint = { blueprint: Record<string, unknown>; yaml: string };

export function DeploymentBlueprints() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [target, setTarget] = useState("Azure AKS");
  const [compliance, setCompliance] = useState("high");
  const [dependencies, setDependencies] = useState<string[]>(["OpenSearch"]);
  const [generated, setGenerated] = useState<GeneratedBlueprint | null>(null);

  useEffect(() => {
    Promise.all([getJson<Blueprint[]>("/api/blueprints"), getJson<Customer[]>("/api/customers")]).then(([blueprintData, customerData]) => {
      setBlueprints(blueprintData);
      setCustomers(customerData);
      setCustomerId(customerData[0]?.id ?? "");
      setTarget(blueprintData[0]?.target_platform ?? "Azure AKS");
    });
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId) ?? customers[0],
    [customers, customerId]
  );

  const generate = async () => {
    if (!selectedCustomer) return;
    const result = await postJson<GeneratedBlueprint>("/api/blueprints/generate", {
      customer_profile: selectedCustomer,
      target_cloud: target,
      compliance_level: compliance,
      required_services: selectedCustomer.services_required,
      data_heavy_dependencies: dependencies
    });
    setGenerated(result);
  };

  const dependencyOptions = ["Kafka", "OpenSearch", "PostgreSQL", "Redis", "database-heavy"];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="page-title">Deployment Blueprints</h2>
          <p className="page-subtitle">Standard platform patterns for Azure AKS, AWS EKS, Google GKE, OpenShift, and VMware Tanzu.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {blueprints.map((blueprint) => (
          <div key={blueprint.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-950">{blueprint.target_platform}</h3>
              <Layers3 size={18} className="text-slate-500" />
            </div>
            <p className="min-h-20 text-sm leading-6 text-slate-600">{blueprint.best_fit_customer_type}</p>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Terraform" value={blueprint.terraform_status} />
              <Row label="GitOps" value={blueprint.gitops_status} />
              <Row label="Setup" value={blueprint.estimated_setup_duration} />
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Complexity</span>
                <StatusBadge value={blueprint.complexity_rating} />
              </div>
              <RiskScore value={blueprint.policy_coverage} label="Policy coverage" />
              <RiskScore value={blueprint.observability_coverage} label="Observability" />
              <Row label="Regulated" value={blueprint.regulated_environment_readiness} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[26rem_1fr]">
        <div className="panel">
          <div className="mb-4 flex items-center gap-2">
            <FileCode2 size={18} className="text-blue-600" />
            <h3 className="panel-title">Generate Blueprint</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mini-label" htmlFor="bp-customer">Customer</label>
              <select id="bp-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="input mt-2">
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mini-label" htmlFor="bp-target">Target platform</label>
              <select id="bp-target" value={target} onChange={(event) => setTarget(event.target.value)} className="input mt-2">
                {blueprints.map((blueprint) => (
                  <option key={blueprint.id} value={blueprint.target_platform}>{blueprint.target_platform}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mini-label" htmlFor="bp-compliance">Compliance level</label>
              <select id="bp-compliance" value={compliance} onChange={(event) => setCompliance(event.target.value)} className="input mt-2">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <p className="mini-label">Data-heavy components</p>
              <div className="mt-2 grid gap-2">
                {dependencyOptions.map((dependency) => (
                  <label key={dependency} className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={dependencies.includes(dependency)}
                      onChange={(event) => {
                        setDependencies((current) =>
                          event.target.checked
                            ? [...current, dependency]
                            : current.filter((item) => item !== dependency)
                        );
                      }}
                    />
                    {dependency}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={generate} className="primary-button w-full">Generate Blueprint</button>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Generated YAML</h3>
          {generated ? (
            <pre className="code-panel mt-4">{generated.yaml}</pre>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Choose a customer and target platform, then generate a deployment blueprint.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}
