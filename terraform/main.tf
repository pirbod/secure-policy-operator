terraform {
  required_version = ">=1.4.0, <2.0.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.75"
    }
  }
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "your-org"
    workspaces {
      name = "secure-policy-operator"
    }
  }
}

provider "azurerm" {
  features        = {}
  subscription_id = var.subscription_id
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-${var.environment}-rg"
  location = var.location
  tags     = var.common_tags
}

# Log Analytics Workspace for AKS monitoring & policy logs
resource "azurerm_log_analytics_workspace" "law" {
  name                = "${var.prefix}-${var.environment}-law"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.common_tags
}

# AKS Cluster with Azure Policy Add-on enabled
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.prefix}-${var.environment}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.prefix}-${var.environment}-dns"

  default_node_pool {
    name       = "agentpool"
    node_count = var.node_count
    vm_size    = var.node_vm_size
  }

  identity {
    type = "SystemAssigned"
  }

  # Azure AD integration if needed
  azure_active_directory_role_based_access_control {
    enabled = true
    # supply admin group object IDs via var.aad_admin_group_ids (list)
    admin_group_object_ids = var.aad_admin_group_ids
  }

  addon_profile {
    azure_policy {
      enabled = true
    }
  }

  # Integrate with Log Analytics for monitoring and policy insights
  oms_agent {
    enabled                    = true
    log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id
  }

  tags = var.common_tags
}

# Storage Account for long-term policy/audit logs or Gatekeeper audit export
resource "azurerm_storage_account" "policylogs" {
  name                     = lower("${var.prefix}${var.environment}logs")
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.common_tags
}

# Container in Storage Account for policy logs
resource "azurerm_storage_container" "logs" {
  name                  = "policy-logs"
  storage_account_name  = azurerm_storage_account.policylogs.name
  container_access_type = "private"
}

# (Optional) Role Assignment: allow AKS MSI to write logs to Storage, if needed
resource "azurerm_role_assignment" "aks_to_storage" {
  scope                = azurerm_storage_account.policylogs.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}

# (Optional) Export Gatekeeper audit logs to Log Analytics or Storage:
# In practice, configure Gatekeeper settings post-deployment to send audit results to storage or Log Analytics.
# This Terraform scaffold sets up the destinations.

