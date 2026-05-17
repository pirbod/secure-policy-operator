# Pre-Sales Pack: Regulated Bank

## Fit Summary
- Target platform: Azure AKS
- Industry: Financial Services
- Compliance level: high
- Readiness score: 82
- Recommended pattern: Azure AKS private regulated landing zone pattern

## Customer Questions
- **Can this run on Azure AKS?** Yes. Use the Azure AKS blueprint with GitOps validation, policy controls, and support runbooks. Confidence: 94%.
- **What prerequisites does the customer need?** Identity, network ranges, image registry access, audit logging target, and data service endpoints must be confirmed. Confidence: 89%.
- **What is the expected deployment timeline?** A validated blueprint targets five business days after prerequisites are complete. Confidence: 86%.
- **How are Kafka, OpenSearch, and database dependencies handled?** The blueprint includes dependency checks for OpenSearch, PostgreSQL, audit logging, private networking, storage policy, monitoring, and escalation-ready runbooks. Confidence: 88%.

## Risks And Mitigations
- **strict audit logging evidence**: Enable audit log collection and prove retention before regulated go-live.
- **private endpoint approval**: Run private networking and dependency reachability checks during blueprint generation.
- **data backup validation**: Confirm data service endpoints, storage class, backup policy, and monitoring alerts.
- **high deployment complexity**: Schedule architecture review and split go-live into validated platform increments.

## Deployment Blueprint Preview
```yaml
apiVersion: customer-cloud.platform/v1alpha1
kind: CustomerEnvironmentBlueprint
metadata:
  name: regulated-bank-aks
  customer: Regulated Bank
spec:
  cloudProvider: azure
  kubernetesTarget: aks
  complianceLevel: high
  gitOpsRepoLayout:
    clusters: clusters/regulated-bank/aks
    apps: apps/regulated-bank
    policies: policies/regulated-policy-pack
    runbooks: runbooks/regulated-bank
  terraformModules:
  - terraform/modules/aks-cluster
  - terraform/modules/networking
  - terraform/modules/identity
  - terraform/modules/observability
  policyPack:
    name: regulated-policy-pack
    controls:
    - non-root-containers
    - deny-privileged-containers
    - required-network-policy
    - approved-image-registries
    - audit-logging-required
  observabilityPack:
    name: full-audit-observability
    signals:
    - cluster-health
    - deployment-drift
    - policy-violations
    - support-readiness
  cicdGates:
  - terraform-plan-review
  - manifest-schema-validation
  - policy-conformance-test
  - argocd-presync-validation
  requiredRunbooks:
  - azure-policy-addon-missing
  - database-storage-and-backup
  - deployment-validation
  - incident-handover
  - opensearch-disk-pressure
  - policy-violation-remediation
  supportHandoverChecklist:
  - customer profile attached
  - known issues mapped
  - observability dashboard linked
  - escalation path agreed
  - go-live validation recorded
  estimatedGoLivePlan:
  - day: 1
    activity: confirm prerequisites and customer inputs
  - day: 2
    activity: apply Terraform landing zone modules
  - day: 3
    activity: sync GitOps baseline and policy pack
  - day: 4
    activity: validate observability, drift, and data dependencies
  - day: 5
    activity: support handover and controlled go-live

```
