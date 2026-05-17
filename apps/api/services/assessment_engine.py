from statistics import mean
from typing import Any


BUSINESS_METRICS = {
    "onboarding_time_reduction": "12 weeks to 5 days",
    "automation_rate": 65,
    "incident_reduction_estimate": 40,
    "support_self_service_potential": 55,
    "policy_coverage_target": 80,
    "observability_coverage_target": 90,
}


CAPABILITY_MAP = {
    "high": ["private networking", "audit logging", "workload identity", "backup policy"],
    "medium": ["standard network policy", "managed identity", "runtime monitoring"],
    "low": ["baseline policy pack", "standard GitOps workflow"],
}


def clamp_score(value: int) -> int:
    return max(0, min(100, value))


def assess_customer_profile(profile: dict[str, Any]) -> dict[str, Any]:
    compliance = str(profile.get("compliance_level", "medium")).lower()
    services = [str(service).lower() for service in profile.get("services_required", [])]
    data_components = [str(item).lower() for item in profile.get("data_heavy_components", [])]
    risks = profile.get("operational_risks", [])

    base_readiness = int(profile.get("readiness_score") or 70)
    policy_score = int(profile.get("policy_compliance_score") or (78 if compliance == "high" else 72))
    observability = int(profile.get("observability_coverage") or (86 if "audit logging" in services else 76))

    complexity = 38
    complexity += 12 if compliance == "high" else 6 if compliance == "medium" else 0
    complexity += min(20, len(data_components) * 7)
    complexity += 8 if any(item in services for item in ["kafka", "opensearch"]) else 0
    complexity += min(15, len(risks) * 3)

    supportability = 86
    supportability -= 10 if compliance == "high" else 4
    supportability -= min(18, len(data_components) * 5)
    supportability += 6 if profile.get("support_handover_status") == "complete" else 0

    readiness = clamp_score(base_readiness)
    security = clamp_score(policy_score)
    observability_score = clamp_score(observability)
    supportability_score = clamp_score(supportability)
    complexity_score = clamp_score(complexity)

    recommended_pattern = _deployment_pattern(profile)
    capabilities = _required_capabilities(compliance, services, data_components)

    return {
        "pre_sales_readiness_score": readiness,
        "deployment_complexity_score": complexity_score,
        "security_and_policy_score": security,
        "observability_maturity_score": observability_score,
        "supportability_score": supportability_score,
        "recommended_deployment_pattern": recommended_pattern,
        "required_platform_capabilities": capabilities,
        "risks_and_mitigations": _risks_and_mitigations(profile, complexity_score),
        "suggested_questions": _suggested_questions(profile),
    }


def executive_summary(customers: list[dict[str, Any]], health: list[dict[str, Any]], cases: list[dict[str, Any]]) -> dict[str, Any]:
    readiness_scores = [customer.get("readiness_score", 0) for customer in customers]
    compliance_scores = [customer.get("policy_compliance_score", 0) for customer in customers]
    open_cases = [case for case in cases if case.get("status") != "resolved"]

    risks: dict[str, int] = {}
    for customer in customers:
        for risk in customer.get("operational_risks", []):
            risks[risk] = risks.get(risk, 0) + 1

    top_risks = [
        {"risk": risk, "affected_environments": count}
        for risk, count in sorted(risks.items(), key=lambda item: item[1], reverse=True)[:5]
    ]

    return {
        "total_customer_environments": len(customers),
        "average_deployment_readiness_score": round(mean(readiness_scores), 1),
        "average_policy_compliance_score": round(mean(compliance_scores), 1),
        "estimated_onboarding_time_reduction": BUSINESS_METRICS["onboarding_time_reduction"],
        "open_support_cases": len(open_cases),
        "repeat_issues_avoided": 18,
        "incident_reduction_estimate": f"{BUSINESS_METRICS['incident_reduction_estimate']}%",
        "top_operational_risks": top_risks,
        "latest_environment_health_data": health,
        "business_metrics": BUSINESS_METRICS,
    }


def _deployment_pattern(profile: dict[str, Any]) -> str:
    platform = str(profile.get("platform_type", "")).lower()
    compliance = str(profile.get("compliance_level", "medium")).lower()
    if "openshift" in platform:
        return "OpenShift regulated platform pattern with SCC mapping"
    if "tanzu" in platform:
        return "VMware Tanzu enterprise ingress and certificate pattern"
    if "aks" in platform and compliance == "high":
        return "Azure AKS private regulated landing zone pattern"
    if "eks" in platform:
        return "AWS EKS rapid onboarding pattern with managed data dependencies"
    if "gke" in platform:
        return "Google GKE identity-first public sector pattern"
    return "Standard multi-cloud Kubernetes GitOps pattern"


def _required_capabilities(compliance: str, services: list[str], data_components: list[str]) -> list[str]:
    capabilities = list(CAPABILITY_MAP.get(compliance, CAPABILITY_MAP["medium"]))
    if any(item in services for item in ["kafka", "opensearch", "postgresql", "redis"]):
        capabilities.append("data platform dependency validation")
    if data_components:
        capabilities.extend(["persistent storage class", "backup and restore runbook"])
    return sorted(set(capabilities))


def _risks_and_mitigations(profile: dict[str, Any], complexity_score: int) -> list[dict[str, str]]:
    risks = profile.get("operational_risks") or ["missing prerequisite evidence"]
    mitigations = []
    for risk in risks:
        mitigation = "Validate through readiness gate and attach matching runbook before go-live."
        lowered = risk.lower()
        if "audit" in lowered:
            mitigation = "Enable audit log collection and prove retention before regulated go-live."
        elif "network" in lowered or "private" in lowered:
            mitigation = "Run private networking and dependency reachability checks during blueprint generation."
        elif "ingress" in lowered or "certificate" in lowered:
            mitigation = "Apply ingress certificate checklist and platform-specific validation runbook."
        elif "data" in lowered or "kafka" in lowered or "opensearch" in lowered:
            mitigation = "Confirm data service endpoints, storage class, backup policy, and monitoring alerts."
        mitigations.append({"risk": risk, "mitigation": mitigation})

    if complexity_score > 70:
        mitigations.append({
            "risk": "high deployment complexity",
            "mitigation": "Schedule architecture review and split go-live into validated platform increments.",
        })
    return mitigations


def _suggested_questions(profile: dict[str, Any]) -> list[dict[str, str | int]]:
    platform = profile.get("platform_type", "Kubernetes")
    services = ", ".join(profile.get("services_required", [])) or "standard services"
    return [
        {
            "question": f"Can this run on {platform}?",
            "answer": f"Yes. Use the {platform} blueprint with GitOps validation, policy controls, and support runbooks.",
            "confidence": 94,
        },
        {
            "question": "What prerequisites does the customer need?",
            "answer": "Identity, network ranges, image registry access, audit logging target, and data service endpoints must be confirmed.",
            "confidence": 89,
        },
        {
            "question": "What is the expected deployment timeline?",
            "answer": "A validated blueprint targets five business days after prerequisites are complete.",
            "confidence": 86,
        },
        {
            "question": "How are Kafka, OpenSearch, and database dependencies handled?",
            "answer": f"The blueprint includes dependency checks for {services}, storage policy, monitoring, and escalation-ready runbooks.",
            "confidence": 88,
        },
    ]
