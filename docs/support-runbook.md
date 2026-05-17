# Support Runbook

## Support Triage Model

Support starts with a known issue search, maps the issue to a platform layer, runs the recommended runbook, records the outcome, and escalates only when the runbook cannot resolve or isolate the issue.

## Known Issue Examples

- AKS deployment fails because Azure Policy add-on is missing
- OpenShift workload blocked by SCC
- Tanzu ingress misconfigured
- Kafka dependency not reachable
- OpenSearch disk pressure
- Kubernetes pods failing due to non-root policy
- ArgoCD sync blocked by PreSync validation
- Missing audit logs for regulated environment

## Escalation Matrix

| Condition | Owner |
| --- | --- |
| Missing customer prerequisite | Customer Success and Technical Support |
| Known policy or platform mismatch | Technical Support |
| Blueprint defect | Platform Engineering |
| Product defect | Engineering |
| Regulated go-live exception | Platform Engineering and security owner |

## Runbook-First Workflow

Runbooks include triggers, steps, expected outcome, and support handover notes. Support should attach logs, validation output, customer impact, and escalation decision to every case.

## Capturing Repeat Issues

Repeat issues should be added to known issue mapping with a platform layer, root cause, remediation, and recommended customer response. The goal is to increase self-service and reduce engineering involvement over time.
