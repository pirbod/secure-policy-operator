#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.api.services.assessment_engine import assess_customer_profile  # noqa: E402
from apps.api.services.data_store import policy_controls  # noqa: E402
from apps.api.services.policy_engine import evaluate_environment  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate customer environment readiness.")
    parser.add_argument("--profile", required=True, help="Path to customer profile YAML.")
    args = parser.parse_args()

    profile = yaml.safe_load(Path(args.profile).read_text(encoding="utf-8"))
    assessment = assess_customer_profile(profile)
    policy = evaluate_environment(profile, policy_controls())
    output = {
        "customer": profile.get("name"),
        "readiness_score": assessment["pre_sales_readiness_score"],
        "policy_score": assessment["security_and_policy_score"],
        "policy_risk_score": policy["risk_score"],
        "missing_prerequisites": profile.get("missing_information", []),
        "recommended_actions": [
            item["mitigation"] for item in assessment["risks_and_mitigations"]
        ][:5],
    }
    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
