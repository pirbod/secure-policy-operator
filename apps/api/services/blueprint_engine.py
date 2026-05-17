from typing import Any

import yaml


PLATFORM_TARGETS = {
    "Azure AKS": ("azure", "aks"),
    "AWS EKS": ("aws", "eks"),
    "Google GKE": ("gcp", "gke"),
    "OpenShift": ("hybrid", "openshift"),
    "VMware Tanzu": ("hybrid", "tanzu"),
}


def find_blueprint(blueprints: list[dict[str, Any]], target: str) -> dict[str, Any] | None:
    normalized = target.lower()
    return next(
        (
            blueprint
            for blueprint in blueprints
            if blueprint["target_platform"].lower() == normalized
            or blueprint["id"].lower() == normalized.replace(" ", "-")
        ),
        None,
    )


def generate_blueprint(
    customer_profile: dict[str, Any],
    target_cloud: str,
    compliance_level: str,
    required_services: list[str],
    data_heavy_dependencies: list[str],
) -> dict[str, Any]:
    cloud_provider, kubernetes_target = PLATFORM_TARGETS.get(
        target_cloud,
        (customer_profile.get("cloud_provider", "multi-cloud").lower(), target_cloud.lower().replace(" ", "-")),
    )
    slug = customer_profile.get("id") or customer_profile.get("name", "customer").lower().replace(" ", "-")
    policy_pack = "regulated-policy-pack" if compliance_level.lower() == "high" else "standard-policy-pack"
    observability_pack = "full-audit-observability" if compliance_level.lower() == "high" else "standard-observability"
    data_dependencies = data_heavy_dependencies or customer_profile.get("data_heavy_components", [])

    blueprint = {
        "apiVersion": "customer-cloud.platform/v1alpha1",
        "kind": "CustomerEnvironmentBlueprint",
        "metadata": {
            "name": f"{slug}-{kubernetes_target}",
            "customer": customer_profile.get("name", slug),
        },
        "spec": {
            "cloudProvider": cloud_provider,
            "kubernetesTarget": kubernetes_target,
            "complianceLevel": compliance_level,
            "gitOpsRepoLayout": {
                "clusters": f"clusters/{slug}/{kubernetes_target}",
                "apps": f"apps/{slug}",
                "policies": f"policies/{policy_pack}",
                "runbooks": f"runbooks/{slug}",
            },
            "terraformModules": [
                f"terraform/modules/{kubernetes_target}-cluster",
                "terraform/modules/networking",
                "terraform/modules/identity",
                "terraform/modules/observability",
            ],
            "policyPack": {
                "name": policy_pack,
                "controls": [
                    "non-root-containers",
                    "deny-privileged-containers",
                    "required-network-policy",
                    "approved-image-registries",
                    "audit-logging-required",
                ],
            },
            "observabilityPack": {
                "name": observability_pack,
                "signals": ["cluster-health", "deployment-drift", "policy-violations", "support-readiness"],
            },
            "cicdGates": [
                "terraform-plan-review",
                "manifest-schema-validation",
                "policy-conformance-test",
                "argocd-presync-validation",
            ],
            "requiredRunbooks": _runbooks_for(target_cloud, required_services, data_dependencies),
            "supportHandoverChecklist": [
                "customer profile attached",
                "known issues mapped",
                "observability dashboard linked",
                "escalation path agreed",
                "go-live validation recorded",
            ],
            "estimatedGoLivePlan": [
                {"day": 1, "activity": "confirm prerequisites and customer inputs"},
                {"day": 2, "activity": "apply Terraform landing zone modules"},
                {"day": 3, "activity": "sync GitOps baseline and policy pack"},
                {"day": 4, "activity": "validate observability, drift, and data dependencies"},
                {"day": 5, "activity": "support handover and controlled go-live"},
            ],
        },
    }

    return {"blueprint": blueprint, "yaml": yaml.safe_dump(blueprint, sort_keys=False)}


def _runbooks_for(target_cloud: str, services: list[str], data_dependencies: list[str]) -> list[str]:
    runbooks = ["deployment-validation", "policy-violation-remediation", "incident-handover"]
    target = target_cloud.lower()
    if "openshift" in target:
        runbooks.append("openshift-scc-blocked-workload")
    if "tanzu" in target:
        runbooks.append("tanzu-ingress-certificate-check")
    if "azure" in target or "aks" in target:
        runbooks.append("azure-policy-addon-missing")
    lowered = [item.lower() for item in services + data_dependencies]
    if "kafka" in lowered:
        runbooks.append("kafka-dependency-reachability")
    if "opensearch" in lowered:
        runbooks.append("opensearch-disk-pressure")
    if any(item in lowered for item in ["postgresql", "database-heavy"]):
        runbooks.append("database-storage-and-backup")
    return sorted(set(runbooks))
