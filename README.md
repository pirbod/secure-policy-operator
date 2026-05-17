# Customer Cloud Policy Operator PoC

A clickable local proof of concept for turning customer cloud delivery into repeatable, validated, observable, and supportable platform patterns.

## Problem Statement

Customer cloud environments often start as bespoke delivery projects. Pre-sales teams need reusable technical answers, platform engineers need validated deployment patterns, and Technical Support needs runbooks for repeat issues. Without a factory model, onboarding takes longer, environments drift, incidents repeat, and engineering becomes the default escalation path.

## What The PoC Demonstrates

The PoC presents the original secure policy operator idea as a Customer Cloud Environment Factory. It shows how a platform team can assess a new customer, generate a deployment blueprint, validate policy and readiness gates, monitor operational health, and recommend support runbooks across multiple cloud and Kubernetes targets.

## Architecture Overview

- React, TypeScript, Vite, Tailwind CSS, Recharts, and lucide-react power the clickable UI.
- FastAPI provides deterministic local API endpoints.
- JSON and YAML files hold mock customer, policy, blueprint, support, and health data.
- Existing `terraform/`, `policies/`, `argo-cd/`, and `operator/` assets are preserved.
- The Go operator remains secondary to the clickable PoC, but now includes a PolicySource CRD, RBAC manifests, sample resource, and registered reconciler scaffold for future production hardening.
- Scripts demonstrate blueprint generation, environment validation, incident simulation, and pre-sales pack export.

## Features

- Executive dashboard with readiness, compliance, onboarding, support, incident, and multi-cloud metrics.
- Pre-Sales Assistant with generated customer answers and a visible pre-sales pack panel.
- Onboarding Factory with readiness gates, blockers, automatable steps, and generated onboarding plan.
- Deployment Blueprints for Azure AKS, AWS EKS, Google GKE, OpenShift, and VMware Tanzu.
- Policy Operator page linking Git, CI policy validation, ArgoCD PreSync, Gatekeeper, cloud policy, runtime audit, and support runbooks.
- Environment Operations table for drift, observability, policy compliance, support readiness, and incidents.
- Support Runbooks with known cases, triage, engineering involvement flag, and knowledge capture.
- Architecture page showing the scalable pattern layers.

## Business Objectives Mapping

| Objective | PoC capability |
| --- | --- |
| Enable technical pre-sales | Pre-Sales Assistant and generated customer answer pack |
| Standardise onboarding | Repeatable checklist, readiness gates, and blueprint generation |
| Build operable environments | Health, drift, observability, policy, and support readiness views |
| Scale support | Known issue triage and runbook recommendations |
| Reduce inconsistency incidents | Policy-as-code and drift validation |
| Reduce engineering escalations | Runbook-first support workflow |
| Demonstrate platform patterns | Kubernetes, Terraform, GitOps, CI/CD, observability, policy, runbooks, and multi-cloud targets |

## Platform Engineer Responsibilities Mapping

- Capture customer cloud requirements and compliance needs.
- Convert profiles into validated Terraform and GitOps blueprint patterns.
- Enforce Kubernetes, container, identity, network, audit, and data platform controls.
- Monitor drift and observability coverage after go-live.
- Package operational knowledge into runbooks Technical Support can use.
- Maintain reusable patterns for AWS, Azure, GCP, OpenShift, VMware Tanzu, Kafka, OpenSearch, and databases.

## Local Setup

```bash
make install
make dev
```

Open the web app at `http://localhost:5173`. The API runs at `http://localhost:8000`.

`make dev` runs the FastAPI app when `uvicorn` is available. On minimal Python installations that cannot create a virtual environment, it uses a local stdlib-compatible API runner with the same demo endpoints so the clickable PoC still runs.

Two-command fallback:

```bash
make api
make web
```

Run those in separate terminals after `make install`.

## Docker Setup

```bash
docker compose up
```

The API is exposed on port `8000` and the web app on port `5173`.

## Demo Walkthrough

1. Open Executive Overview and show the message: "From months to days, with repeatable customer cloud patterns."
2. Go to Pre-Sales Assistant, select a customer, and generate a visible pre-sales pack.
3. Open Onboarding Factory, run readiness assessment, and generate an onboarding plan.
4. Generate a platform-specific deployment blueprint.
5. Evaluate policy controls and review remediations.
6. Validate or simulate drift in Environment Operations.
7. Triage a support case and recommend a runbook.
8. Close on measurable outcomes: five-day onboarding, 65 percent automation, 40 percent fewer consistency incidents, and 55 percent support self-service potential.

## Screenshots

Captured screenshots are stored under `screenshots/` after visual verification:

- `screenshots/executive-overview.png`
- `screenshots/pre-sales-assistant.png`
- `screenshots/deployment-blueprints.png`
- `screenshots/policy-operator.png`
- `screenshots/environment-operations.png`
- `screenshots/support-runbooks.png`

Regenerate them with:

```bash
node apps/web/scripts/capture_screenshots.mjs
```

If the host lacks browser libraries, run the same script from a Playwright browser container.

## CI Coverage

The GitHub Actions workflow in `.github/workflows/poc-ci.yml` validates the whole PoC:

- Python dependency install, compile check, unit tests, and demo script validation
- Frontend dependency install, TypeScript typecheck, and production build
- Kubernetes manifest validation with kubeconform
- Policy manifest checks with conftest
- Docker Compose smoke test for API and web startup

## Repository Structure

```text
.
├── apps/api              # FastAPI service, mock data, deterministic service logic, tests
├── apps/web              # React + TypeScript clickable dashboard
├── docs                  # Architecture, pre-sales, onboarding, support, operating model, demo script
├── examples              # Customer profiles and generated blueprint examples
├── scripts               # Local automation scripts for demos
├── argo-cd               # Preserved ArgoCD PreSync example
├── operator              # Preserved Go operator scaffold plus CRD/RBAC manifests
├── policies              # Preserved Gatekeeper policy examples
└── terraform             # Preserved Terraform scaffold
```

## API Endpoints

- `GET /api/health`
- `GET /api/executive-summary`
- `GET /api/customers`
- `GET /api/customers/{customer_id}`
- `POST /api/assess`
- `GET /api/blueprints`
- `POST /api/blueprints/generate`
- `GET /api/policies`
- `POST /api/policies/evaluate`
- `GET /api/operations/health`
- `GET /api/support/cases`
- `POST /api/support/triage`
- `GET /api/runbooks`
- `POST /api/runbooks/recommend`

## Example Customer Profiles

- `examples/customer-profile-regulated-bank.yaml`
- `examples/customer-profile-retail-cloud.yaml`
- `examples/customer-profile-manufacturing.yaml`

## Useful Commands

```bash
make test
make lint
make validate-demo
make generate-blueprint
make presales-pack
```

## Future Production Roadmap

- Replace mock data with customer profile storage and approval workflow.
- Integrate live GitOps repositories and policy test results.
- Add real Terraform module registry references.
- Connect to observability systems for environment health.
- Add role-based access and audit trails.
- Publish support knowledge into the enterprise support platform.

## Limitations

- All data is deterministic mock data.
- No live cloud credentials or paid services are required.
- The Go operator path is still not the runtime for the clickable demo; it is a preserved and improved scaffold for a future Kubernetes controller implementation.
- Policy and deployment results are simulated to demonstrate workflow and value.
