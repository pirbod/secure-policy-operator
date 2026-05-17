# Pre-Sales Guide

## Common Customer Questions

- Can this run on Azure, AWS, GCP, OpenShift, or Tanzu?
- What cloud prerequisites are required?
- What is the expected deployment timeline?
- What observability is included?
- How is policy compliance enforced?
- What support model is required after go-live?
- How are Kafka, OpenSearch, and database dependencies handled?

## Standard Answers

The platform uses validated blueprints for Azure AKS, AWS EKS, Google GKE, OpenShift, and VMware Tanzu. Each blueprint includes prerequisites, Terraform modules, GitOps layout, policy controls, observability, and support runbooks. A typical deployment targets five business days once prerequisites are complete.

## Platform Comparison

| Platform | Best fit | Notes |
| --- | --- | --- |
| Azure AKS | Regulated Azure customers | Strong Azure Policy and private networking story |
| AWS EKS | Fast commercial onboarding | Good fit for Kafka and managed data dependencies |
| Google GKE | Identity-focused workloads | Strong workload identity and audit logging pattern |
| OpenShift | Hybrid regulated platforms | Requires SCC mapping and platform-specific controls |
| VMware Tanzu | Enterprise private cloud | Requires ingress, certificate, and package validation |

## Compliance And Regulated Environment Notes

High-compliance customers need audit logging, private networking, workload identity, approved registries, backup evidence, and go-live validation records. The regulated blueprint uses policy-as-code and observability evidence before support handover.

## Deployment Expectation Guidance

The expected path is: assess profile, confirm prerequisites, generate blueprint, apply Terraform modules, sync GitOps baseline, run policy gates, validate observability, and complete support handover.
