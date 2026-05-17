import unittest

from apps.api.services.blueprint_engine import generate_blueprint
from apps.api.services.data_store import customers


class BlueprintEngineTests(unittest.TestCase):
    def test_generate_blueprint_returns_platform_specific_yaml(self) -> None:
        customer = next(item for item in customers() if item["id"] == "regulated-bank")

        result = generate_blueprint(
            customer_profile=customer,
            target_cloud="Azure AKS",
            compliance_level="high",
            required_services=customer["services_required"],
            data_heavy_dependencies=customer["data_heavy_components"],
        )

        self.assertEqual(result["blueprint"]["spec"]["cloudProvider"], "azure")
        self.assertEqual(result["blueprint"]["spec"]["kubernetesTarget"], "aks")
        self.assertEqual(result["blueprint"]["spec"]["platformSpecific"]["azureAks"]["clusterMode"], "private")
        self.assertIn("regulated-policy-pack", result["yaml"])
        self.assertIn("azure-policy-addon-missing", result["yaml"])

    def test_generate_blueprint_includes_data_runbooks(self) -> None:
        customer = next(item for item in customers() if item["id"] == "retail-commerce")

        result = generate_blueprint(customer, "AWS EKS", "medium", ["Kafka"], ["Kafka"])

        runbooks = result["blueprint"]["spec"]["requiredRunbooks"]
        self.assertIn("kafka-dependency-reachability", runbooks)
        self.assertIn("policy-violation-remediation", runbooks)

    def test_generate_blueprint_includes_platform_sections(self) -> None:
        customer = next(item for item in customers() if item["id"] == "manufacturing-cloud")

        result = generate_blueprint(customer, "OpenShift", "high", ["database-heavy"], ["PostgreSQL"])

        platform = result["blueprint"]["spec"]["platformSpecific"]
        self.assertIn("openShift", platform)
        self.assertIn("securityContextConstraints", platform["openShift"])


if __name__ == "__main__":
    unittest.main()
