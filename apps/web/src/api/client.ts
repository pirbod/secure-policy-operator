export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type Customer = {
  id: string;
  name: string;
  industry: string;
  cloud_provider: string;
  platform_type: string;
  environment_stage: string;
  compliance_level: string;
  services_required: string[];
  data_heavy_components: string[];
  readiness_score: number;
  policy_compliance_score: number;
  deployment_status: string;
  operational_risks: string[];
  support_handover_status: string;
  required_inputs: string[];
  missing_information: string[];
  blockers: string[];
  automatable_steps: string[];
  support_readiness: number;
  last_validation_time: string;
  observability_coverage: number;
  drift_status: string;
  incidents_open: number;
};

export type ExecutiveSummary = {
  total_customer_environments: number;
  average_deployment_readiness_score: number;
  average_policy_compliance_score: number;
  estimated_onboarding_time_reduction: string;
  open_support_cases: number;
  repeat_issues_avoided: number;
  incident_reduction_estimate: string;
  top_operational_risks: Array<{ risk: string; affected_environments: number }>;
  latest_environment_health_data: HealthRecord[];
  business_metrics: Record<string, number | string>;
};

export type Blueprint = {
  id: string;
  target_platform: string;
  best_fit_customer_type: string;
  required_prerequisites: string[];
  terraform_modules: string[];
  gitops_pattern: string;
  policy_controls: string[];
  observability_pattern: string;
  support_runbooks: string[];
  estimated_setup_duration: string;
  complexity_rating: string;
  terraform_status: string;
  gitops_status: string;
  policy_coverage: number;
  observability_coverage: number;
  regulated_environment_readiness: string;
};

export type HealthRecord = {
  customer_id: string;
  customer: string;
  platform: string;
  health_status: string;
  deployment_drift: string;
  failed_checks: number;
  policy_violations: number;
  observability_coverage: number;
  open_incidents: number;
  support_readiness: number;
  last_validation_time: string;
};

export type SupportCase = {
  id: string;
  title: string;
  description: string;
  platform: string;
  status: string;
  severity: string;
  repeat_issue: boolean;
  customer_id: string;
};

export type Assessment = {
  pre_sales_readiness_score: number;
  deployment_complexity_score: number;
  security_and_policy_score: number;
  observability_maturity_score: number;
  supportability_score: number;
  recommended_deployment_pattern: string;
  required_platform_capabilities: string[];
  risks_and_mitigations: Array<{ risk: string; mitigation: string }>;
  suggested_questions: Array<{ question: string; answer: string; confidence: number }>;
};

export type PolicyEvaluation = {
  policy_results: Array<{
    category: string;
    control_id: string;
    control: string;
    status: string;
    severity: string;
    remediation: string;
    gatekeeper_policy_mapping: string;
    azure_policy_mapping: string;
    openshift_scc_mapping: string;
    tanzu_policy_mapping: string;
  }>;
  risk_score: number;
  summary: { passed: number; failed: number; total: number };
  remediation_suggestions: string[];
};

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
