// mastra/workflows/document-ingestion.ts

import { createStep } from '@mastra/core/workflows';
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
// Import the OFFICIAL Pinecone client
import { Pinecone } from '@pinecone-database/pinecone';

// --- STEPS ---
export const getFilesStep = createStep({
    id: 'get-files',
    inputSchema: z.object({ directoryPath: z.string() }),
    outputSchema: z.array(z.object({ filePath: z.string(), year: z.string() })),
    async execute(input) {
        console.log(`Reading files from: ${input.directoryPath}`);
        const files = fs.readdirSync(input.directoryPath);
        return files
            .filter(file => path.extname(file) === '.txt')
            .map(file => ({
                filePath: path.join(input.directoryPath, file),
                year: path.basename(file, '.txt'),
            }));
    },
});

export const processDocumentStep = createStep({
  id: 'process-document',
  inputSchema: z.object({ filePath: z.string(), year: z.string() }),
  outputSchema: z.void(),
  async execute(input) {
    console.log(`  - Processing: ${input.filePath}`);
    const text = fs.readFileSync(input.filePath, 'utf-8');
    const doc = MDocument.fromText(text);
    const allChunks = await doc.chunk({ strategy: 'recursive', maxSize: 512, overlap: 50 });

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // --- BATCHING LOGIC ---
    const batchSize = 100; // The rate limit from the error message
    let totalIngested = 0;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const chunkBatch = allChunks.slice(i, i + batchSize);
      console.log(`    - Processing batch ${i / batchSize + 1}...`);

      const { embeddings } = await embedMany({
        values: chunkBatch.map(c => c.text),
        model: google.embedding('text-embedding-004'),
      });

      const vectorsToUpsert = chunkBatch.map((chunk, j) => ({
        // Use the global index 'i + j' to ensure unique IDs across batches
        id: `${input.year}-${i + j}`,
        values: embeddings[j],
        metadata: {
            year: input.year,
            text: chunk.text
        },
      }));
      
      await index.upsert(vectorsToUpsert);
      totalIngested += chunkBatch.length;
    }
    
    console.log(`  - Ingested ${totalIngested} total chunks for year ${input.year}`);
  },
});