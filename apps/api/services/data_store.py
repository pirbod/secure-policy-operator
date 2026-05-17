import json
from functools import lru_cache
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@lru_cache(maxsize=32)
def load_json(name: str) -> Any:
    with (DATA_DIR / name).open(encoding="utf-8") as handle:
        return json.load(handle)


def customers() -> list[dict[str, Any]]:
    return load_json("customers.json")


def customer_by_id(customer_id: str) -> dict[str, Any] | None:
    return next((customer for customer in customers() if customer["id"] == customer_id), None)


def blueprints() -> list[dict[str, Any]]:
    return load_json("cloud_blueprints.json")


def policy_controls() -> dict[str, list[dict[str, Any]]]:
    return load_json("policy_controls.json")


def support_cases() -> list[dict[str, Any]]:
    return load_json("support_cases.json")


def runbooks() -> dict[str, list[dict[str, Any]]]:
    return load_json("runbooks.json")


def environment_health() -> list[dict[str, Any]]:
    return load_json("environment_health.json")
