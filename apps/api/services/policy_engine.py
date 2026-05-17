from typing import Any


def grouped_controls(controls: dict[str, list[dict[str, Any]]]) -> dict[str, list[dict[str, Any]]]:
    return controls


def evaluate_environment(profile: dict[str, Any], controls: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    results = []
    failures = 0
    total = 0
    compliance = str(profile.get("compliance_level", "medium")).lower()
    services = [str(item).lower() for item in profile.get("services_required", [])]
    risks = [str(item).lower() for item in profile.get("operational_risks", [])]

    for category, category_controls in controls.items():
        for control in category_controls:
            total += 1
            passed = _control_passes(control["id"], compliance, services, risks, profile)
            if not passed:
                failures += 1
            results.append({
                "category": category,
                "control_id": control["id"],
                "control": control["title"],
                "status": "pass" if passed else "fail",
                "severity": control["severity"],
                "remediation": control["remediation"],
                "gatekeeper_policy_mapping": control["mappings"]["gatekeeper"],
                "azure_policy_mapping": control["mappings"].get("azure_policy", "not-applicable"),
                "openshift_scc_mapping": control["mappings"].get("openshift_scc", "not-applicable"),
                "tanzu_policy_mapping": control["mappings"].get("tanzu", "not-applicable"),
            })

    risk_score = round((failures / total) * 100) if total else 0
    return {
        "policy_results": results,
        "risk_score": risk_score,
        "summary": {
            "passed": total - failures,
            "failed": failures,
            "total": total,
        },
        "remediation_suggestions": [
            result["remediation"] for result in results if result["status"] == "fail"
        ][:6],
    }


def _control_passes(
    control_id: str,
    compliance: str,
    services: list[str],
    risks: list[str],
    profile: dict[str, Any],
) -> bool:
    readiness = int(profile.get("readiness_score") or 70)
    policy_score = int(profile.get("policy_compliance_score") or 76)

    if control_id == "audit-logging-required":
        return compliance != "high" or "audit logging" in services or policy_score >= 84
    if control_id == "required-network-policy":
        return not any("network" in risk for risk in risks) and readiness >= 70
    if control_id == "required-workload-identity":
        return compliance != "high" or policy_score >= 80
    if control_id == "backup-policy-data-heavy":
        data_components = profile.get("data_heavy_components", [])
        return not data_components or readiness >= 74
    if control_id == "required-storage-class":
        return not any(item in services for item in ["opensearch", "postgresql", "kafka"]) or readiness >= 68
    if control_id == "liveness-readiness-probes":
        return readiness >= 70
    if control_id == "approved-image-registries":
        return policy_score >= 70
    if control_id == "secret-management-pattern":
        return compliance != "high" or policy_score >= 82
    if control_id == "deny-privileged-containers":
        return policy_score >= 65
    if control_id == "non-root-containers":
        return policy_score >= 68
    if control_id == "restrict-hostpath":
        return policy_score >= 72
    if control_id == "resource-requests-limits":
        return readiness >= 66
    return True
