#!/bin/bash
# Reset Demo Script
# Restores main.tf to its initial vulnerable state for a fresh pipeline run.

if [ -f "terraform/main.tf.bak" ]; then
    echo "Files found. Restoring original vulnerable main.tf..."
    cp terraform/main.tf.bak terraform/main.tf
    echo "✅ Restored vulnerable main.tf"
else
    echo "⚠️ Backup file terraform/main.tf.bak not found."
    echo "Ensure you have run the pipeline at least once or manually backup your vulnerable file."
fi

# Clean previous reports
rm -f reports/trivy-report.json
rm -f reports/ai_fix_suggestions.txt
echo "✅ Cleaned reports/"
echo "Ready for Demo Run!"
