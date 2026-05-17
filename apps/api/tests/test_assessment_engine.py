import unittest

from apps.api.services.assessment_engine import assess_customer_profile, executive_summary
from apps.api.services.data_store import customers, environment_health, support_cases


class AssessmentEngineTests(unittest.TestCase):
    def test_assessment_uses_known_readiness_score(self) -> None:
        customer = customers()[0]

        result = assess_customer_profile(customer)

        self.assertEqual(result["pre_sales_readiness_score"], 82)
        self.assertGreaterEqual(result["deployment_complexity_score"], 60)
        self.assertIn("private networking", result["required_platform_capabilities"])
        self.assertTrue(result["recommended_deployment_pattern"].startswith("Azure AKS"))

    def test_executive_summary_is_deterministic(self) -> None:
        result = executive_summary(customers(), environment_health(), support_cases())

        self.assertEqual(result["total_customer_environments"], 6)
        self.assertEqual(result["average_deployment_readiness_score"], 74.8)
        self.assertEqual(result["business_metrics"]["automation_rate"], 65)
        self.assertEqual(result["open_support_cases"], 7)


if __name__ == "__main__":
    unittest.main()
