from typing import Any

import yaml


PLATFORM_TARGETS = {
    "Azure AKS": ("azure", "aks"),
    "AWS EKS": ("aws", "eks"),
    "Google GKE": ("gcp", "gke"),
    "OpenShift": ("hybrid", "openshift"),
    "VMware Tanzu": ("hybrid", "tanzu"),
}

TERRAFORM_MODULES = {
    "Azure AKS": [
        "terraform/modules/azure-aks",
        "terraform/modules/azure-aks#azure-policy-addon",
        "terraform/modules/azure-aks#private-cluster",
    ],
    "AWS EKS": [
        "terraform/modules/aws-eks",
        "terraform/modules/aws-eks#irsa",
        "terraform/modules/aws-eks#cloudwatch-observability",
    ],
    "Google GKE": [
        "terraform/modules/google-gke",
        "terraform/modules/google-gke#workload-identity",
        "terraform/modules/google-gke#audit-log-sink",
    ],
    "OpenShift": [
        "terraform/modules/openshift",
        "terraform/modules/openshift#scc-mapping",
        "terraform/modules/openshift#network-segmentation",
    ],
    "VMware Tanzu": [
        "terraform/modules/vmware-tanzu",
        "terraform/modules/vmware-tanzu#ingress-package",
        "terraform/modules/vmware-tanzu#certificate-validation",
    ],
}

PLATFORM_SECTIONS = {
    "Azure AKS": {
        "azureAks": {
            "clusterMode": "private",
            "azurePolicy": {"addon": "enabled", "initiative": "customer-cloud-regulated-baseline"},
            "identity": "managed identity with workload identity federation",
            "networking": ["private endpoint", "private DNS zone", "Azure CNI network policy"],
            "logging": "AKS diagnostic settings to retained Log Analytics workspace",
        }
    },
    "AWS EKS": {
        "awsEks": {
            "clusterMode": "private endpoint with controlled public access",
            "identity": "IRSA service accounts for cloud permissions",
            "observability": ["CloudWatch Container Insights", "Prometheus scrape", "OpenSearch dashboard export"],
            "dataDependencies": ["Kafka security group reachability", "OpenSearch endpoint allow-list"],
            "logging": "CloudWatch log groups with retention policy",
        }
    },
    "Google GKE": {
        "googleGke": {
            "clusterMode": "private GKE cluster",
            "identity": "Workload Identity pool and service account binding",
            "audit": "admin activity and data access logs routed to retained sink",
            "networking": ["private service connect", "authorized networks", "network policy"],
            "logging": "Cloud Logging sink with compliance retention",
        }
    },
    "OpenShift": {
        "openShift": {
            "securityContextConstraints": ["restricted-v2", "service account SCC review"],
            "operatorPattern": "namespaced operator subscriptions managed by GitOps",
            "networking": ["namespace deny-by-default", "egress allow-list", "route policy"],
            "audit": "OpenShift audit profile evidence attached before regulated go-live",
            "storage": "approved encrypted storage class for database-heavy workloads",
        }
    },
    "VMware Tanzu": {
        "vmwareTanzu": {
            "packageManagement": ["cert-manager", "contour or ingress package", "external-secrets"],
            "ingress": "domain, route, and TLS certificate chain validation",
            "policy": "Tanzu package and pod security baseline mapping",
            "observability": ["package health", "ingress synthetic check", "OpenSearch storage alert"],
            "storage": "Tanzu storage policy mapped to stateful dependencies",
        }
    },
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
            "terraformModules": TERRAFORM_MODULES.get(target_cloud, [f"terraform/modules/{kubernetes_target}"]),
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
            "platformSpecific": PLATFORM_SECTIONS.get(target_cloud, {}),
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
