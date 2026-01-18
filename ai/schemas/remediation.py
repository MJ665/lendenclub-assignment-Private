from typing import List
from pydantic import BaseModel, Field

class TerraformFix(BaseModel):
    resource: str = Field(description="The Terraform resource identifier being fixed")
    description: str = Field(description="Description of what this fix does")
    terraform_code: str = Field(description="The complete, valid HCL code block for the fixed resource")
    justification: str = Field(description="Why this fix is necessary (e.g., 'Restricts access to known IPs')")

class RemediationPlan(BaseModel):
    fixes: List[TerraformFix] = Field(description="List of proposed Terraform fixes")
