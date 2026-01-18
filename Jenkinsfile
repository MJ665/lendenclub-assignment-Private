pipeline {
    agent any


environment {
        // This binds both Access Key and Secret Key automatically
        AWS_CREDS = credentials('aws-access-key-id')
        AWS_ACCESS_KEY_ID = "${env.AWS_CREDS_USR}"
        AWS_SECRET_ACCESS_KEY = "${env.AWS_CREDS_PSW}"
        AWS_DEFAULT_REGION = 'ap-south-1'
        TF_VAR_project_name = 'InfraGuard'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                script {
                    // Create reports directory if it doesn't exist
                    sh 'mkdir -p reports'
                    
                    // Run Trivy scan on Terraform files
                    // STRATEGY: We intentionally use 'catchError' here to capture the failing report.
                    // This allows the pipeline to proceed to the "AI Remediation" stage to fix it.
                    // The FINAL verification stage later will force a failure if issues remain.
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sh 'trivy config terraform/ --format json --output reports/trivy-report.json --severity HIGH,CRITICAL'
                        sh 'trivy config terraform/ --severity HIGH,CRITICAL'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/trivy-report.json', fingerprint: true
                }
            }
        }
stage('AI Remediation Analysis') {
    steps {
        script {
            echo "🤖 Phase 1 Failed. Starting Multi-Agent AI Remediation..."
            
            // Use a virtual environment to avoid PEP 668 error
            sh '''
                python3 -m venv venv
                ./venv/bin/pip install --upgrade pip
                ./venv/bin/pip install -r ai/requirements.txt
            '''
            
            withCredentials([string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY')]) {
                // Run using the python executable inside the venv
                sh '''
                    export PYTHONPATH=$PYTHONPATH:.
                    ./venv/bin/python3 ai/run.py \
                        --trivy-report reports/trivy-report.json \
                        --terraform-file terraform/main.tf \
                        --output reports/remediation_plan.json
                '''
            }
            
            archiveArtifacts artifacts: 'reports/remediation_plan.json', fingerprint: true
            echo "✅ Fixes applied to terraform/main.tf"
        }
    }
}
        stage('Verify Security Fixes (Rescan)') {
            steps {
                script {
                    echo "🔍 Verifying fixes with Trivy..."
                    // Run Trivy again. This time it MUST PASS (exit 0) for HIGH/CRITICAL
                    sh 'trivy config terraform/ --severity HIGH,CRITICAL --exit-code 1'
                    echo "✅ Security Verification Passed! Zero Critical Issues."
                }
            }
        }

        stage('Terraform Init & Plan') {
            steps {
                dir('terraform') {
                    // Remove any old init files that might cause conflicts
                    sh 'rm -rf .terraform .terraform.lock.hcl'
                    
                    // Re-initialize completely
                    sh 'terraform init -upgrade -reconfigure'
                    
                    // Run plan
                    sh 'terraform plan -out=tfplan'
                }
            }
        }
        
        stage('Deploy (Manual Approval)') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                dir('terraform') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }
    }




post {
        always {
            cleanWs()
        }
        failure {
            echo "Pipeline failed. Sending alert email..."
            withCredentials([string(credentialsId: 'resend-api-key', variable: 'RESEND_API_KEY')]) {
                sh '''
                    curl -X POST https://api.resend.com/emails \
                    -H "Authorization: Bearer $RESEND_API_KEY" \
                    -H "Content-Type: application/json" \
                    -d '{
                        "from": "email@email.mj665.in",
                        "to": ["meet.jain563@gmail.com", "contact.hackathonmj@gmail.com"],
                        "subject": "🚨 InfraGuard Pipeline FAILED",
                        "html": "<p><strong>Build #'$BUILD_NUMBER' Failed.</strong><br>Check console output for Trivy report and AI logs.</p>"
                    }'
                '''
            }
        }
        success {
            echo "Pipeline succeeded. Notifying team..."
            withCredentials([string(credentialsId: 'resend-api-key', variable: 'RESEND_API_KEY')]) {
                sh '''
                    curl -X POST https://api.resend.com/emails \
                    -H "Authorization: Bearer $RESEND_API_KEY" \
                    -H "Content-Type: application/json" \
                    -d '{
                        "from": "email@email.mj665.in",
                        "to": ["meet.jain563@gmail.com", "contact.hackathonmj@gmail.com"],
                        "subject": "✅ InfraGuard Pipeline SUCCESS",
                        "html": "<p><strong>Build #'$BUILD_NUMBER' Deployed Successfully.</strong><br>Infrastructure is secure and live.</p>"
                    }'
                '''
            }
        }
    }


}
