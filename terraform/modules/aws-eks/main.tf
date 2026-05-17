variable "environment_name" {
  type        = string
  description = "Customer environment name."
}

variable "irsa_enabled" {
  type        = bool
  description = "Whether IAM Roles for Service Accounts are required."
  default     = true
}

locals {
  blueprint_contract = {
    platform                = "AWS EKS"
    identity_pattern        = var.irsa_enabled ? "IRSA service accounts" : "node role fallback"
    policy_pattern          = "Gatekeeper baseline with CI validation"
    observability_pattern   = "CloudWatch Container Insights and Prometheus"
    data_dependency_checks  = ["Kafka security group reachability", "OpenSearch endpoint allow-list"]
    generated_resource_note = "PoC module contract only; add aws resources for production."
  }
}

output "blueprint_contract" {
  value       = local.blueprint_contract
  description = "Contract consumed by generated customer cloud blueprints."
}
