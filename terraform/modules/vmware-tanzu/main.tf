variable "environment_name" {
  type        = string
  description = "Customer environment name."
}

variable "ingress_validation_enabled" {
  type        = bool
  description = "Whether ingress and certificate validation are required."
  default     = true
}

locals {
  blueprint_contract = {
    platform                = "VMware Tanzu"
    package_pattern         = ["cert-manager", "ingress", "external-secrets"]
    ingress_pattern         = var.ingress_validation_enabled ? "domain and TLS chain validation" : "standard route"
    policy_pattern          = "Tanzu pod security and package policy mapping"
    observability_pattern   = "package health, ingress synthetic check, and OpenSearch storage alert"
    generated_resource_note = "PoC module contract only; add tanzu resources for production."
  }
}

output "blueprint_contract" {
  value       = local.blueprint_contract
  description = "Contract consumed by generated customer cloud blueprints."
}
