# Operating Model

## Roles And Responsibilities

Sales and Customer Success capture business context, timeline, and initial platform fit. Platform Engineering owns reusable blueprints, policy packs, GitOps patterns, and readiness gates. Technical Support owns runbook-first triage and customer communication after go-live. Engineering owns product defects and reusable improvements.

## Sales And Customer Success Handover

The handover includes customer profile, compliance level, services required, data-heavy dependencies, expected timeline, risks, and open questions. The Pre-Sales Assistant helps produce standard answers before platform engineering review.

## Platform Engineering Ownership

Platform Engineering maintains Terraform modules, GitOps layout, policy controls, observability patterns, and support runbooks. It also reviews high-compliance or high-complexity onboarding plans.

## Technical Support Ownership

Technical Support uses known issue mapping and runbooks to resolve repeat issues. Support updates knowledge capture notes and escalates only with evidence from validation steps.

## Engineering Escalation Rules

Escalate to Engineering when a product defect, missing platform capability, or unresolvable blueprint behavior is confirmed. Do not escalate missing prerequisites, known policy failures, or documented runbook issues before support validation.

## Knowledge Capture Loop

Every repeat incident should improve the factory. The loop is: incident, triage, runbook outcome, known issue update, blueprint improvement, pre-sales answer update, and reduced future escalation.
