
import os
import json
import re
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TRIVY_REPORT_PATH = "reports/trivy-report.json"
TERRAFORM_FILE_PATH = "terraform/main.tf"
OUTPUT_FIXED_PATH = "terraform/main.tf" # Overwriting for the loop

def analyze_and_fix():
    print("🤖 AI Remediation Agent Starting...")
    
    if not GEMINI_API_KEY:
        raise Exception("❌ CRITICAL: GEMINI_API_KEY is not set.")

    if not os.path.exists(TRIVY_REPORT_PATH):
        raise Exception(f"❌ Report not found: {TRIVY_REPORT_PATH}. Ensure Trivy ran first.")

    # Load Trivy Report
    try:
        with open(TRIVY_REPORT_PATH, 'r') as f:
            trivy_data = json.load(f)
    except json.JSONDecodeError:
        raise Exception("❌ Failed to decode JSON report")

    # Extract High/Critical Issues
    issues = []
    if 'Results' in trivy_data:
        for result in trivy_data['Results']:
            if 'Vulnerabilities' in result and result['Vulnerabilities']:
                for vuln in result['Vulnerabilities']:
                    if vuln['Severity'] in ['HIGH', 'CRITICAL']:
                        issues.append(f"VULNERABILITY: {vuln.get('Title')}\nDESCRIPTION: {vuln.get('Description')}")
            
            if 'Misconfigurations' in result and result['Misconfigurations']:
                for misc in result['Misconfigurations']:
                    if misc['Severity'] in ['HIGH', 'CRITICAL']:
                        issues.append(f"MISCONFIGURATION: {misc.get('Title')}\nMESSAGE: {misc.get('Message')}\nRESOLUTION: {misc.get('Resolution')}")

    if not issues:
        print("✅ No CRITICAL/HIGH issues found to remediate.")
        return

    print(f"🔍 Found {len(issues)} critical issues. Contacting Gemini to generate FIXES...")

    # Read current Terraform code
    with open(TERRAFORM_FILE_PATH, 'r') as f:
        tf_code = f.read()

    # Construct Prompt
    prompt = f"""
    You are a Senior DevSecOps Engineer.
    I have a Terraform file (`main.tf`) that has CRITICAL security vulnerabilities identified by Trivy.
    
    Current Terraform Code:
    ```hcl
    {tf_code}
    ```

    Identified Vulnerabilities:
    {chr(10).join(issues)}

    TASK:
    1. Rewrite the ENTIRE `main.tf` file to correct ALL identified vulnerabilities.
    2. Specifically:
       - Change SSH ingress from 0.0.0.0/0 to a restricted CIDR (e.g., '10.0.0.0/8' or specific IP).
       - Enable encryption for EBS volumes.
       - Disable public access for RDS.
       - Use secure passwords (placeholder) if hardcoded.
    3. Return ONLY the valid HCL code. Do not use Markdown backticks. Do not include explanations.
    """

    # Call Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash") # Using available model
    
    try:
        response = model.generate_content(prompt)
        fixed_code = response.text
        
        # Clean up Markdown if AI adds it despite instructions
        if fixed_code.startswith("```"):
            fixed_code = re.sub(r"^```hcl\n|^```\n|```$", "", fixed_code, flags=re.MULTILINE)
        
        print("💡 AI Fix Generated. Applying fixes to main.tf...")
        
        # Backup original
        os.rename(TERRAFORM_FILE_PATH, TERRAFORM_FILE_PATH + ".bak")
        
        with open(TERRAFORM_FILE_PATH, 'w') as f:
            f.write(fixed_code)
            
        print(f"✅ Successfully patched {TERRAFORM_FILE_PATH}")
        
    except Exception as e:
        print(f"❌ AI Remediation Failed: {e}")
        raise e

if __name__ == "__main__":
    analyze_and_fix()
