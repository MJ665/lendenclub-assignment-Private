from typing import List, Literal
from pydantic import BaseModel, Field

class ValidationResult(BaseModel):
    approved: bool = Field(description="Whether the remediation plan is safe to apply")
    compliance_checks: List[str] = Field(description="List of compliance standards checked (e.g., CIS 4.1)")
    risk_assessment: Literal["SAFE", "RISKY", "UNKNOWN"] = Field(description="Risk level of applying these changes")
    audit_notes: str = Field(description="Governance notes explaining the approval decision")
