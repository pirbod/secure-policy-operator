variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID for provider"
}

variable "prefix" {
  type        = string
  description = "Name prefix for all resources (e.g., 'secpolicy')"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, test, prod)"
  validation {
    condition     = contains(["dev","test","prod"], var.environment)
    error_message = "environment must be one of: dev, test, prod."
  }
}

variable "location" {
  type        = string
  description = "Azure region for resources"
  default     = "westeurope"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to apply to all resources"
  default     = {
    project = "secure-policy-operator"
  }
}

variable "node_count" {
  type        = number
  description = "Number of nodes in AKS default node pool"
  default     = 2
}

variable "node_vm_size" {
  type        = string
  description = "VM size for AKS default node pool"
  default     = "Standard_DS2_v2"
}

variable "aad_admin_group_ids" {
  type        = list(string)
  description = "List of Azure AD group object IDs to assign as AKS cluster admins"
  default     = []
}
