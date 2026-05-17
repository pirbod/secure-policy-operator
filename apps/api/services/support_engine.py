from typing import Any

from .runbook_engine import flatten_runbooks


KEYWORD_PATTERNS = [
    {
        "keywords": ["azure policy", "aks", "add-on", "addon"],
        "root_cause": "Azure Policy add-on is not enabled before GitOps sync.",
        "severity": "high",
        "layer": "cloud prerequisite",
        "runbook_id": "azure-policy-addon-missing",
        "engineering": False,
        "evidence": ["AKS add-on status", "ArgoCD PreSync job log", "Terraform plan or apply output"],
    },
    {
        "keywords": ["scc", "openshift", "blocked"],
        "root_cause": "OpenShift SCC blocks workload security context.",
        "severity": "medium",
        "layer": "platform policy",
        "runbook_id": "openshift-scc-blocked-workload",
        "engineering": False,
        "evidence": ["pod admission event", "service account SCC binding", "securityContext snippet"],
    },
    {
        "keywords": ["tanzu", "ingress", "certificate"],
        "root_cause": "Tanzu ingress or certificate profile is incomplete.",
        "severity": "medium",
        "layer": "ingress",
        "runbook_id": "tanzu-ingress-certificate-check",
        "engineering": False,
        "evidence": ["ingress package status", "DNS lookup", "certificate issuer and chain output"],
    },
    {
        "keywords": ["kafka", "reachable", "connect"],
        "root_cause": "Kafka dependency is not reachable from the customer environment.",
        "severity": "high",
        "layer": "data dependency",
        "runbook_id": "kafka-dependency-reachability",
        "engineering": False,
        "evidence": ["pod network test", "DNS resolution output", "firewall or security group owner"],
    },
    {
        "keywords": ["opensearch", "disk", "pressure"],
        "root_cause": "OpenSearch storage threshold exceeded or storage class is undersized.",
        "severity": "high",
        "layer": "data platform",
        "runbook_id": "opensearch-disk-pressure",
        "engineering": False,
        "evidence": ["cluster health", "disk watermark metrics", "storage class and volume size"],
    },
    {
        "keywords": ["non-root", "non root", "pods", "policy"],
        "root_cause": "Workload image or manifest violates non-root container policy.",
        "severity": "medium",
        "layer": "workload policy",
        "runbook_id": "non-root-policy-remediation",
        "engineering": False,
        "evidence": ["Gatekeeper violation", "pod securityContext", "image user evidence"],
    },
    {
        "keywords": ["argocd", "presync", "sync"],
        "root_cause": "ArgoCD PreSync validation blocked a non-conformant deployment.",
        "severity": "medium",
        "layer": "gitops validation",
        "runbook_id": "argocd-presync-validation-blocked",
        "engineering": False,
        "evidence": ["ArgoCD sync event", "PreSync job log", "failed manifest path"],
    },
    {
        "keywords": ["audit", "logs", "regulated"],
        "root_cause": "Regulated environment is missing required audit log evidence.",
        "severity": "high",
        "layer": "observability",
        "runbook_id": "regulated-audit-logging-gap",
        "engineering": False,
        "evidence": ["audit sink status", "retention policy", "sample audit event timestamp"],
    },
]


def triage_support_case(
    description: str,
    support_cases: list[dict[str, Any]],
    runbooks: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    normalized = description.lower()
    pattern = next(
        (
            item
            for item in KEYWORD_PATTERNS
            if any(keyword in normalized for keyword in item["keywords"])
        ),
        KEYWORD_PATTERNS[-1],
    )
    runbook = _runbook_by_id(pattern["runbook_id"], runbooks)
    known_issue = _matching_case(description, support_cases)

    return {
        "issue_summary": description,
        "likely_root_cause": pattern["root_cause"],
        "severity": pattern["severity"],
        "impacted_platform_layer": pattern["layer"],
        "matching_known_issue": known_issue,
        "known_issue_match": known_issue["title"] if known_issue else None,
        "evidence_required": pattern["evidence"],
        "recommended_runbook": runbook,
        "runbook_steps": runbook.get("steps", []),
        "escalation_path": "Technical Support -> Platform Engineering only if runbook validation fails",
        "escalation_decision": (
            "support-owned: runbook-first resolution"
            if not pattern["engineering"]
            else "engineering escalation required"
        ),
        "engineering_involvement_required": pattern["engineering"],
        "suggested_customer_response": (
            "We have matched this to a known environment pattern. "
            "Support can run the recommended validation steps and confirm the fix path before escalation."
        ),
    }


def _runbook_by_id(runbook_id: str, runbooks: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    return next(
        (runbook for runbook in flatten_runbooks(runbooks) if runbook["id"] == runbook_id),
        flatten_runbooks(runbooks)[0],
    )


def _matching_case(description: str, cases: list[dict[str, Any]]) -> dict[str, Any] | None:
    words = {word.strip(".,:;").lower() for word in description.split() if len(word) > 3}
    best_case = None
    best_score = 0
    for case in cases:
        text = f"{case.get('title', '')} {case.get('description', '')}".lower()
        score = sum(1 for word in words if word in text)
        if score > best_score:
            best_score = score
            best_case = case
    return best_case if best_score else None
