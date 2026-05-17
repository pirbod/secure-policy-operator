from typing import Any

from pydantic import BaseModel, Field


class CustomerProfile(BaseModel):
    id: str | None = None
    name: str
    industry: str | None = None
    cloud_provider: str
    platform_type: str
    environment_stage: str | None = None
    compliance_level: str
    services_required: list[str] = Field(default_factory=list)
    data_heavy_components: list[str] = Field(default_factory=list)
    readiness_score: int | None = None
    policy_compliance_score: int | None = None
    observability_coverage: int | None = None
    operational_risks: list[str] = Field(default_factory=list)


class AssessmentRequest(BaseModel):
    profile: dict[str, Any] | None = None
    customer: dict[str, Any] | None = None
    customer_profile: dict[str, Any] | None = None


class BlueprintGenerateRequest(BaseModel):
    customer_profile: dict[str, Any]
    target_cloud: str
    compliance_level: str
    required_services: list[str] = Field(default_factory=list)
    data_heavy_dependencies: list[str] = Field(default_factory=list)


class PolicyEvaluateRequest(BaseModel):
    environment_profile: dict[str, Any]


class SupportTriageRequest(BaseModel):
    description: str


class RunbookRecommendRequest(BaseModel):
    issue_category: str
    platform: str
