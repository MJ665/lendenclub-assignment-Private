import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser
from langchain.output_parsers import OutputFixingParser
from ai.schemas.remediation import RemediationPlan
from ai.schemas.vulnerability import ScanResult

def generate_fixes(scan_result: ScanResult, terraform_file_path: str) -> RemediationPlan:
    print("🛠 [Remediator Agent] Generating Terraform fixes...")
    
    with open(terraform_file_path, 'r') as f:
        tf_code = f.read()
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    
    parser = PydanticOutputParser(pydantic_object=RemediationPlan)
    fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)
    
    if scan_result.vulnerabilities:
        vuln_summary = "\n".join([f"- {v.id}: {v.risk_summary}" for v in scan_result.vulnerabilities])
    else:
        vuln_summary = "General security hardening required."

    
    # Extract resource names to enforce preservation
    import re
    resources = re.findall(r'resource\s+"([\w-]+)"\s+"([\w-]+)"', tf_code)
    # Format as "type.name" (e.g., aws_vpc.main)
    required_resources = [f'{r[0]} "{r[1]}"' for r in resources]
    resource_list_str = "\n".join([f"- {r}" for r in required_resources])
    
    prompt = f"""
    You are a Senior DevSecOps Engineer. Rewrite the Terraform code to fix these vulnerabilities:
    {vuln_summary}
    
    Current Code:
    ```hcl
    {tf_code}
    ```
    
    CRITICAL RULES (Follow strictly):
    1. **Return VALID JSON** matching the schema.
    2. **PRESERVE RESOURCES**: The following resources MUST exist in your output with the EXACT same names and types:
    {resource_list_str}
    
    3. **Variables**: REMOVE ALL `variable` blocks. They are already in `variables.tf`.
    4. **Providers**: REMOVE `provider` and `terraform` blocks. They are in `providers.tf`.
    5. **Syntax**: Do NOT escape quotes in `user_data` (use standard `<<-EOF`).
    6. **Fix Egress**: Allow egress to 0.0.0.0/0 for HTTP/HTTPS/DNS. Add `# trivy:ignore:AVD-AWS-0104` inside the security group.
    7. **Hardening**: Encrypt EBS/RDS (`encrypted=true`, `storage_encrypted=true`). Disable RDS public access.
    
    {parser.get_format_instructions()}
    """
    
    try:
        response = llm.invoke(prompt)
        return parser.parse(response.content)
    except Exception as e:
        print(f"⚠️ JSON parsing failed: {e}. Attempting auto-fix with Gemini...")
        return fixing_parser.parse(response.content)