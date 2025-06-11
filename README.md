# Secure-by-Default Policy Enforcement Operator

This project implements a Kubernetes-native, GitOps-driven policy enforcement framework using OPA/Gatekeeper, ArgoCD, and Azure infrastructure.

## Highlights
- Go-based custom operator to sync OPA policies from Git.
- PreSync ArgoCD hooks to block non-compliant manifests.
- Azure Policy add-on enabled AKS cluster via Terraform.
- GitHub Actions pipeline for policy linting & operator CI/CD.
