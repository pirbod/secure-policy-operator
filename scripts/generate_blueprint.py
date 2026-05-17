#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.api.services.blueprint_engine import generate_blueprint  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a customer cloud deployment blueprint.")
    parser.add_argument("--profile", required=True, help="Path to customer profile YAML.")
    parser.add_argument("--target", required=True, help="Target platform, for example Azure AKS.")
    parser.add_argument("--output", help="Optional output YAML path. Defaults to stdout.")
    args = parser.parse_args()

    profile = yaml.safe_load(Path(args.profile).read_text(encoding="utf-8"))
    result = generate_blueprint(
        customer_profile=profile,
        target_cloud=args.target,
        compliance_level=profile.get("compliance_level", "medium"),
        required_services=profile.get("services_required", []),
        data_heavy_dependencies=profile.get("data_heavy_components", []),
    )

    if args.output:
        Path(args.output).write_text(result["yaml"], encoding="utf-8")
        print(f"Wrote blueprint to {args.output}")
    else:
        print(result["yaml"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
