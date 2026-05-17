#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.api.services.data_store import runbooks, support_cases  # noqa: E402
from apps.api.services.support_engine import triage_support_case  # noqa: E402


ISSUES = {
    "azure-policy": "AKS deployment fails because Azure Policy add-on is missing",
    "openshift-scc": "OpenShift workload is blocked by SCC admission",
    "tanzu-ingress": "Tanzu ingress is misconfigured and certificate validation fails",
    "kafka": "Kafka dependency is not reachable from application pods",
    "opensearch": "OpenSearch disk pressure is causing cluster health alerts",
    "non-root": "Kubernetes pods fail because the non-root policy blocks the image",
    "presync": "ArgoCD sync is blocked by PreSync validation",
    "audit": "Missing audit logs for regulated environment go-live",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Simulate a known customer cloud support incident.")
    parser.add_argument("--issue", required=True, choices=sorted(ISSUES), help="Known issue type.")
    args = parser.parse_args()

    description = ISSUES[args.issue]
    triage = triage_support_case(description, support_cases(), runbooks())
    print(json.dumps({"generated_support_case": description, "triage": triage}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
