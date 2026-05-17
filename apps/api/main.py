from datetime import UTC, datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    AssessmentRequest,
    BlueprintGenerateRequest,
    PolicyEvaluateRequest,
    RunbookRecommendRequest,
    SupportTriageRequest,
)
from .services.assessment_engine import assess_customer_profile, executive_summary
from .services.blueprint_engine import generate_blueprint
from .services.data_store import (
    blueprints,
    customer_by_id,
    customers,
    environment_health,
    policy_controls,
    runbooks,
    support_cases,
)
from .services.policy_engine import evaluate_environment, grouped_controls
from .services.runbook_engine import recommend_runbook
from .services.support_engine import triage_support_case


app = FastAPI(
    title="Customer Cloud Policy Operator PoC API",
    version="1.0.0",
    description="Local API for a customer cloud environment factory proof of concept.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "version": app.version,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@app.get("/api/executive-summary")
def get_executive_summary() -> dict[str, Any]:
    return executive_summary(customers(), environment_health(), support_cases())


@app.get("/api/customers")
def get_customers() -> list[dict[str, Any]]:
    return customers()


@app.get("/api/customers/{customer_id}")
def get_customer(customer_id: str) -> dict[str, Any]:
    customer = customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer environment not found")
    return customer


@app.post("/api/assess")
def assess(request: AssessmentRequest) -> dict[str, Any]:
    profile = request.customer_profile or request.profile or request.customer
    if not profile:
        raise HTTPException(status_code=400, detail="A customer profile payload is required")
    return assess_customer_profile(profile)


@app.get("/api/blueprints")
def get_blueprints() -> list[dict[str, Any]]:
    return blueprints()


@app.post("/api/blueprints/generate")
def generate(request: BlueprintGenerateRequest) -> dict[str, Any]:
    return generate_blueprint(
        request.customer_profile,
        request.target_cloud,
        request.compliance_level,
        request.required_services,
        request.data_heavy_dependencies,
    )


@app.get("/api/policies")
def get_policies() -> dict[str, list[dict[str, Any]]]:
    return grouped_controls(policy_controls())


@app.post("/api/policies/evaluate")
def evaluate_policy(request: PolicyEvaluateRequest) -> dict[str, Any]:
    return evaluate_environment(request.environment_profile, policy_controls())


@app.get("/api/operations/health")
def operations_health() -> list[dict[str, Any]]:
    return environment_health()


@app.get("/api/support/cases")
def get_support_cases() -> list[dict[str, Any]]:
    return support_cases()


@app.post("/api/support/triage")
def triage(request: SupportTriageRequest) -> dict[str, Any]:
    return triage_support_case(request.description, support_cases(), runbooks())


@app.get("/api/runbooks")
def get_runbooks() -> dict[str, list[dict[str, Any]]]:
    return runbooks()


@app.post("/api/runbooks/recommend")
def recommend(request: RunbookRecommendRequest) -> dict[str, Any]:
    return recommend_runbook(request.issue_category, request.platform, runbooks())
