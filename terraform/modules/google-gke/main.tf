variable "environment_name" {
  type        = string
  description = "Customer environment name."
}

variable "workload_identity_enabled" {
  type        = bool
  description = "Whether Workload Identity is required."
  default     = true
}

locals {
  blueprint_contract = {
    platform                = "Google GKE"
    cluster_mode            = "private"
    identity_pattern        = var.workload_identity_enabled ? "Workload Identity" : "standard service accounts"
    audit_pattern           = "Cloud Logging sink with retained audit evidence"
    policy_pattern          = "Gatekeeper regulated overlay"
    generated_resource_note = "PoC module contract only; add google resources for production."
  }
}

output "blueprint_contract" {
  value       = local.blueprint_contract
  description = "Contract consumed by generated customer cloud blueprints."
}
