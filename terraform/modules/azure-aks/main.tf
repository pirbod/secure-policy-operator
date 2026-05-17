variable "environment_name" {
  type        = string
  description = "Customer environment name."
}

variable "private_cluster_enabled" {
  type        = bool
  description = "Whether the AKS cluster should use a private API endpoint."
  default     = true
}

variable "azure_policy_enabled" {
  type        = bool
  description = "Whether the Azure Policy add-on is required."
  default     = true
}

locals {
  blueprint_contract = {
    platform                = "Azure AKS"
    cluster_mode            = var.private_cluster_enabled ? "private" : "public"
    policy_addon            = var.azure_policy_enabled ? "enabled" : "disabled"
    identity_pattern        = "managed identity and workload identity federation"
    observability_pattern   = "Azure Monitor and Log Analytics"
    regulated_ready         = true
    generated_resource_note = "PoC module contract only; add azurerm resources for production."
  }
}

output "blueprint_contract" {
  value       = local.blueprint_contract
  description = "Contract consumed by generated customer cloud blueprints."
}
