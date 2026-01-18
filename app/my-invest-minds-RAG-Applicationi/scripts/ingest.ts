// scripts/ingest.ts

import path from 'path';
import dotenv from 'dotenv';
import { getFilesStep, processDocumentStep } from '../mastra/workflows/document-ingestion';

dotenv.config();

async function main() {
  console.log('Starting manual ingestion process...');
  const directoryPath = path.resolve(process.cwd(), 'Dataset');
  console.log(`Processing documents from: ${directoryPath}`);

  try {
    const filesToProcess = await getFilesStep.execute({
      directoryPath: directoryPath,
    });

    console.log(`Found ${filesToProcess.length} documents to process.`);
    for (const file of filesToProcess) {
      await processDocumentStep.execute(file);
    }
    
    console.log('✅ Document ingestion completed successfully!');

  } catch (error) {
    console.error('❌ An error occurred during the ingestion script:', error);
    process.exit(1);
  }
}

main();