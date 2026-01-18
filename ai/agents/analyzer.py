import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser
from ai.schemas.vulnerability import ScanResult

def analyze_scan_results(trivy_report_path: str) -> ScanResult:
    print("🕵️ [Analyzer Agent] Reading Trivy report...")
    
    if not os.path.exists(trivy_report_path):
        raise FileNotFoundError(f"Trivy report not found at {trivy_report_path}")

    with open(trivy_report_path, 'r') as f:
        trivy_data = json.load(f)

    context = []
    if 'Results' in trivy_data:
        for result in trivy_data['Results']:
            if 'Vulnerabilities' in result and result['Vulnerabilities']:
                for vuln in result['Vulnerabilities']:
                    if vuln['Severity'] in ['HIGH', 'CRITICAL']:
                        context.append(f"VULNERABILITY: {vuln.get('Title')} ({vuln.get('VulnerabilityID')})\nDESC: {vuln.get('Description')}")
            
            if 'Misconfigurations' in result and result['Misconfigurations']:
                for misc in result['Misconfigurations']:
                    if misc['Severity'] in ['HIGH', 'CRITICAL']:
                        context.append(f"MISCONFIG: {misc.get('Title')} ({misc.get('ID')})\nMSG: {misc.get('Message')}")

    # Use the stable model version
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    
    parser = PydanticOutputParser(pydantic_object=ScanResult)

    prompt = f"""
    You are a Security Analyst. Analyze the following Trivy scan findings and extract the critical security risks.
    
    Findings:
    {chr(10).join(context)}
    
    Return a JSON object matching this schema:
    {parser.get_format_instructions()}
    """
    
    response = llm.invoke(prompt)
    return parser.parse(response.content)