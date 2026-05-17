# Onboarding Runbook

## Step-By-Step Process

1. Capture customer profile, industry, platform, compliance level, and required services.
2. Confirm cloud account, project, subscription, networking, identity, and registry prerequisites.
3. Record data-heavy dependencies such as Kafka, OpenSearch, PostgreSQL, Redis, and backup requirements.
4. Run readiness assessment and identify missing information or blockers.
5. Generate the target platform blueprint.
6. Apply Terraform modules and commit GitOps environment layout.
7. Run CI policy validation and ArgoCD PreSync validation.
8. Validate observability, drift detection, audit evidence, and support readiness.
9. Complete go-live checklist and handover to Technical Support.

## Required Customer Inputs

- Customer owner and support contact
- Cloud target and account details
- Network ranges and private endpoint requirements
- Identity and access model
- Required services and data dependencies
- Compliance and audit requirements
- Go-live timeline and change window

## Cloud Prerequisites

Azure requires subscription, resource group, private DNS, managed identity, and Log Analytics workspace. AWS requires account, VPC, IAM roles, ECR access, and CloudWatch workspace. GCP requires project, VPC, workload identity pool, audit sink, and artifact registry.

## Kubernetes Prerequisites

Each environment needs namespace ownership, image registry access, ingress plan, resource quotas, network policies, workload identity binding, and policy exception process.

## Data Platform Prerequisites

Kafka, OpenSearch, and databases require network reachability, storage class, backup policy, monitoring alerts, and ownership for operational incidents.

## Security Prerequisites

Security prerequisites include non-root workloads, no privileged containers, approved registries, secret management pattern, audit logging, and regulated change evidence where required.

## Go-Live Checklist

- Blueprint generated and approved
- Terraform plan reviewed
- GitOps sync complete
- Policy evaluation passed or approved exceptions recorded
- Observability dashboard linked
- Support runbooks mapped
- Handover summary captured
