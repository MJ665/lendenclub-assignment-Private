import argparse
import sys
import json
import os
from typing import TypedDict
from langgraph.graph import StateGraph, END

from ai.schemas.vulnerability import ScanResult
from ai.schemas.remediation import RemediationPlan
from ai.schemas.validation import ValidationResult

from ai.agents.analyzer import analyze_scan_results
from ai.agents.remediator import generate_fixes
from ai.agents.validator import validate_plan

class AgentState(TypedDict):
    trivy_report_path: str
    terraform_file_path: str
    scan_result: ScanResult
    remediation_plan: RemediationPlan
    validation_result: ValidationResult
    output_fixes_path: str

def node_analyze(state: AgentState):
    result = analyze_scan_results(state["trivy_report_path"])
    return {"scan_result": result}

def node_remediate(state: AgentState):
    plan = generate_fixes(state["scan_result"], state["terraform_file_path"])
    return {"remediation_plan": plan}

def node_validate(state: AgentState):
    result = validate_plan(state["remediation_plan"])
    return {"validation_result": result}

def node_apply(state: AgentState):
    validation = state["validation_result"]
    plan = state["remediation_plan"]
    
    if validation.approved and plan.fixes:
        print("💾 [System] Validation Passed. Writing fixes to file...")
        output_data = plan.model_dump()
        output_data["audit_trail"] = validation.model_dump()
        
        with open(state["output_fixes_path"], "w") as f:
            json.dump(output_data, f, indent=2)
    else:
        print(f"🛑 [System] Validation Failed. Reason: {validation.audit_notes}")
        print("Skipping JSON save.")
        
    return {"output_fixes_path": state["output_fixes_path"]}

workflow = StateGraph(AgentState)
workflow.add_node("security_analysis", node_analyze)
workflow.add_node("remediation_gen", node_remediate)
workflow.add_node("validation_gate", node_validate)
workflow.add_node("apply_patches", node_apply)

workflow.set_entry_point("security_analysis")
workflow.add_edge("security_analysis", "remediation_gen")
workflow.add_edge("remediation_gen", "validation_gate")
workflow.add_edge("validation_gate", "apply_patches")
workflow.add_edge("apply_patches", END)

app = workflow.compile()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--trivy-report", required=True)
    parser.add_argument("--terraform-file", required=True)
    parser.add_argument("--output", required=True)
    
    args = parser.parse_args()
    
    initial_state = AgentState(
        trivy_report_path=args.trivy_report,
        terraform_file_path=args.terraform_file,
        scan_result=None,
        remediation_plan=None,
        validation_result=None,
        output_fixes_path=args.output
    )
    
    print("🚀 [LangGraph] Starting Multi-Agent Security Pipeline...")
    final_state = app.invoke(initial_state)
    
    val = final_state.get("validation_result")
    if val and val.approved:
        print("✅ Pipeline Success: Remediation Plan Approved.")
        
        plan = final_state.get("remediation_plan")
        if plan and plan.fixes:
            print("💾 [System] Applying fixes to main.tf...")
            fix = plan.fixes[0]
            if fix.terraform_code:
                if os.path.exists(args.terraform_file):
                    os.rename(args.terraform_file, args.terraform_file + ".bak")
                with open(args.terraform_file, "w") as f:
                    f.write(fix.terraform_code)
                print(f"✅ Successfully patched {args.terraform_file}")
            else:
                print("⚠️ No terraform code returned in fix.")
    else:
        print("🛑 Pipeline Failed: Remediation Rejected.")
        # Print audit notes again to be sure it's visible in logs
        if val:
            print(f"Audit Notes: {val.audit_notes}")
        sys.exit(1)