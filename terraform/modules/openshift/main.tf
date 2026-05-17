variable "environment_name" {
  type        = string
  description = "Customer environment name."
}

variable "regulated_ready" {
  type        = bool
  description = "Whether regulated controls are required."
  default     = true
}

locals {
  blueprint_contract = {
    platform                = "OpenShift"
    security_context        = "restricted-v2 SCC mapping"
    network_pattern         = "namespace deny-by-default and egress allow-list"
    data_pattern            = "encrypted storage class and backup policy"
    regulated_ready         = var.regulated_ready
    generated_resource_note = "PoC module contract only; add openshift resources for production."
  }
}

output "blueprint_contract" {
  value       = local.blueprint_contract
  description = "Contract consumed by generated customer cloud blueprints."
}
