output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Name of the resource group"
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.aks.name
  description = "AKS cluster name"
}

output "kube_config" {
  value       = azurerm_kubernetes_cluster.aks.kube_config[0].raw_kube_config
  description = "Raw kubeconfig for AKS (sensitive)"
  sensitive   = true
}

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.law.id
  description = "ID of the Log Analytics workspace"
}

output "storage_account_name" {
  value       = azurerm_storage_account.policylogs.name
  description = "Storage account for policy logs"
}
