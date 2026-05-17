#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.api.services.assessment_engine import assess_customer_profile  # noqa: E402
from apps.api.services.blueprint_engine import generate_blueprint  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Export a markdown pre-sales pack.")
    parser.add_argument("--profile", required=True, help="Path to customer profile YAML.")
    parser.add_argument("--target", default=None, help="Optional target platform override.")
    parser.add_argument("--output", default="docs/generated-presales-pack.md", help="Output markdown path.")
    args = parser.parse_args()

    profile = yaml.safe_load(Path(args.profile).read_text(encoding="utf-8"))
    target = args.target or profile.get("platform_type", "Azure AKS")
    assessment = assess_customer_profile(profile)
    blueprint = generate_blueprint(
        profile,
        target,
        profile.get("compliance_level", "medium"),
        profile.get("services_required", []),
        profile.get("data_heavy_components", []),
    )

    questions = "\n".join(
        f"- **{item['question']}** {item['answer']} Confidence: {item['confidence']}%."
        for item in assessment["suggested_questions"]
    )
    risks = "\n".join(
        f"- **{item['risk']}**: {item['mitigation']}"
        for item in assessment["risks_and_mitigations"]
    )

    content = f"""# Pre-Sales Pack: {profile.get("name")}

## Fit Summary
- Target platform: {target}
- Industry: {profile.get("industry")}
- Compliance level: {profile.get("compliance_level")}
- Readiness score: {assessment["pre_sales_readiness_score"]}
- Recommended pattern: {assessment["recommended_deployment_pattern"]}

## Customer Questions
{questions}

## Risks And Mitigations
{risks}

## Deployment Blueprint Preview
```yaml
{blueprint["yaml"]}
```
"""

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")
    print(f"Wrote pre-sales pack to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
