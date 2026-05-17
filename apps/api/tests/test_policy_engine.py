import unittest

from apps.api.services.data_store import customers, policy_controls
from apps.api.services.policy_engine import evaluate_environment


class PolicyEngineTests(unittest.TestCase):
    def test_policy_evaluation_produces_failures_for_low_readiness_profile(self) -> None:
        customer = next(item for item in customers() if item["id"] == "enterprise-saas")

        result = evaluate_environment(customer, policy_controls())

        self.assertGreaterEqual(result["summary"]["total"], 12)
        self.assertGreater(result["summary"]["failed"], 0)
        self.assertGreater(result["risk_score"], 0)
        self.assertTrue(any("storage" in suggestion.lower() for suggestion in result["remediation_suggestions"]))

    def test_policy_evaluation_is_lower_risk_for_validated_profile(self) -> None:
        logistics = next(item for item in customers() if item["id"] == "logistics-platform")
        enterprise = next(item for item in customers() if item["id"] == "enterprise-saas")

        logistics_result = evaluate_environment(logistics, policy_controls())
        enterprise_result = evaluate_environment(enterprise, policy_controls())

        self.assertLess(logistics_result["risk_score"], enterprise_result["risk_score"])


if __name__ == "__main__":
    unittest.main()
