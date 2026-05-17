import unittest

from apps.api.services.data_store import runbooks, support_cases
from apps.api.services.support_engine import triage_support_case


class SupportEngineTests(unittest.TestCase):
    def test_support_triage_matches_azure_policy_case(self) -> None:
        result = triage_support_case(
            "AKS deployment fails because Azure Policy add-on is missing",
            support_cases(),
            runbooks(),
        )

        self.assertEqual(result["severity"], "high")
        self.assertIs(result["engineering_involvement_required"], False)
        self.assertEqual(result["recommended_runbook"]["id"], "azure-policy-addon-missing")
        self.assertEqual(result["known_issue_match"], "AKS deployment fails because Azure Policy add-on is missing")
        self.assertIn("AKS add-on status", result["evidence_required"])
        self.assertEqual(result["escalation_decision"], "support-owned: runbook-first resolution")

    def test_support_triage_matches_kafka_dependency_case(self) -> None:
        result = triage_support_case(
            "Kafka dependency is not reachable from application pods",
            support_cases(),
            runbooks(),
        )

        self.assertEqual(result["impacted_platform_layer"], "data dependency")
        self.assertEqual(result["recommended_runbook"]["id"], "kafka-dependency-reachability")
        self.assertIn("Run network reachability test", result["runbook_steps"])


if __name__ == "__main__":
    unittest.main()
