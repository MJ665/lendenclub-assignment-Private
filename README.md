#  InfraGuard – AI-Driven DevSecOps Security Pipeline

---

##  Project Overview

**InfraGuard** is an AI-powered DevSecOps automation project designed to ensure that **cloud infrastructure is secure by default before deployment**.

The project integrates **Jenkins CI/CD**, **Terraform Infrastructure-as-Code**, **containerized web applications**, **security scanning**, and **Generative AI-based remediation** to detect and fix infrastructure vulnerabilities automatically.

This assignment demonstrates how **AI can be used as a security assistant** in modern DevOps pipelines.
Video 

[https://drive.google.com/drive/folders/1a2kogicjEwStuEygZH3NAwee7hterOY2?usp=sharing](https://drive.google.com/drive/folders/1a2kogicjEwStuEygZH3NAwee7hterOY2?usp=sharing)
---

##  Objective

The primary objective of this project is to:

* Provision cloud infrastructure securely using **Terraform**
* Detect infrastructure security vulnerabilities **before deployment**
* Use **AI to understand, explain, and remediate security issues**
* Enforce **security-first CI/CD practices**
* Deploy infrastructure **only after verification and approval**

---

##  Architecture Explanation

```
GitHub Repository
        ↓
Jenkins Pipeline (Docker)
        ↓
Terraform Security Scan (Trivy)
        ↓
AI Analysis & Remediation (LangGraph + Gemini)
        ↓
Re-Scan & Verification
        ↓
Terraform Plan
        ↓
Manual Approval
        ↓
AWS Cloud (Mumbai Region)
```

---

##  Cloud Provider Used

* **Provider:** AWS
* **Region:** ap-south-1 (Mumbai only)
* **Reason:**

  * Lower latency for Indian region
  * Region restriction improves security compliance
  * Prevents accidental deployment to global regions

---

##  Tools & Technologies

| Category          | Tools                           |
| ----------------- | ------------------------------- |
| Web App           | Node.js / Python                |
| Containerization  | Docker, Docker Compose          |
| CI/CD             | Jenkins (Dockerized)            |
| Infrastructure    | Terraform                       |
| Security Scanning | Trivy                           |
| AI Framework      | LangGraph                       |
| LLM               | Google Gemini                   |
| Cloud             | AWS (EC2, Security Groups, IAM) |

---

##  Intentional Security Vulnerability (Before)

To demonstrate real-world security risks, the Terraform code initially contained:

*  **SSH port (22) open to 0.0.0.0/0**
*  **Overly permissive security group rules**
*  **Unrestricted inbound traffic**

These vulnerabilities caused the **Jenkins security scan to fail**, as expected.

---

## 🤖 AI-Driven Security Remediation (Core Task)

When the pipeline detected vulnerabilities:

1. **Trivy generated a detailed security report**
2. The report was passed to an **AI remediation engine**
3. AI analyzed:

   * Risk severity
   * AWS security best practices
   * Terraform configuration logic
4. AI rewrote the Terraform code to:

   * Restrict SSH access
   * Apply least-privilege networking
   * Improve security posture

---

## 🔁 Before & After Security Report

###  Before Fix

* HIGH / CRITICAL vulnerabilities present
* Jenkins pipeline failed with security warnings

###  After Fix

* Zero HIGH or CRITICAL vulnerabilities
* Jenkins pipeline passed successfully
* Secure infrastructure ready for deployment

---

## 📸 Screenshots Included

* Initial failing Jenkins Trivy scan
* AI remediation execution
* Final passing Jenkins pipeline
* Application running on cloud public IP

---

#  **AI Usage Log (Mandatory Section)**

This section documents **how AI was used**, **what was learned**, and **how decisions were made**.

---

##  AI Interaction Summary

During this project, AI was used as:

* A **security analyst**
* A **Terraform reviewer**
* A **DevSecOps mentor**
* A **code remediation assistant**

---

## 🔍 Sample AI Learning Prompts (Paraphrased & Reflective)

**Q1:**
How can infrastructure-as-code introduce security risks even before deployment?

**Learning Outcome:**
Understood that misconfigured Terraform files can expose cloud resources publicly without any runtime monitoring.

---

**Q2:**
What does opening SSH access to the entire internet actually mean in real-world cloud security?

**Learning Outcome:**
Learned that unrestricted SSH access enables brute-force attacks and violates zero-trust networking principles.

---

**Q3:**
How should a CI/CD pipeline behave when security vulnerabilities are detected?

**Learning Outcome:**
Realized that pipelines should not just fail silently, but guide remediation and enforce security gates.

---

**Q4:**
How can AI understand a Trivy security report and map it back to Terraform code?

**Learning Outcome:**
Learned how AI can correlate scanner output with IaC structure and suggest best-practice fixes automatically.

---

**Q5:**
What are secure alternatives to public SSH access in AWS?

**Learning Outcome:**
Discovered approaches such as:

* Restricting SSH to specific IP ranges
* Using bastion hosts
* Leveraging AWS Session Manager

---

**Q6:**
Why is re-scanning after remediation critical?

**Learning Outcome:**
Confirmed that AI-generated fixes must always be verified to avoid false confidence in security.

---

##  How AI-Recommended Changes Improved Security

| Area              | Improvement                   |
| ----------------- | ----------------------------- |
| Network Security  | Restricted inbound rules      |
| Access Control    | Least privilege enforced      |
| CI/CD Reliability | Security gates added          |
| Risk Reduction    | Zero critical vulnerabilities |
| Compliance        | Region & policy enforcement   |

---

##  Learning Outcomes

Through this project, I learned:

* How **security shifts left** in DevOps
* Why **AI is valuable for cloud security analysis**
* How CI/CD pipelines can **enforce governance**
* The importance of **verification after automation**
* Real-world **DevSecOps pipeline design**

---

##  Video Demonstration

A 5–10 minute demo video is included showing:

* Jenkins pipeline execution
* Security scan failure & remediation
* Terraform plan
* Cloud deployment
* Application running on public IP

---

##  Conclusion

InfraGuard demonstrates a **practical DevSecOps workflow** where:

Security is **detected early**,
Remediated **intelligently using AI**,
Verified **automatically**,
And deployed **safely**.

---

## 🚀 Final Note

This project reflects **real industry DevSecOps practices**, combining automation, AI, and security-first thinking.

---

###  If you want:

* A **PDF submission version**
* A **short AI usage log version**
* A **Viva / interview explanation**
* A **5-minute video narration script**

Just tell me — I’ll generate it.
