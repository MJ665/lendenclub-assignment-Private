// mastra/agents/financial-analyst.ts

import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Pinecone } from '@pinecone-database/pinecone';
import { embed } from 'ai';

const vectorSearchTool = createTool({
  // --- THIS IS THE CRITICAL FIX ---
  // Change the ID from kebab-case to snake_case
  id: 'vector_search',
  inputSchema: z.object({ query: z.string() }),
  async execute(input) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const { embedding } = await embed({
      value: input.query,
      model: google.embedding('text-embedding-004'),
    });

    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    const results = queryResponse.matches || [];
    
    const context = results.map(result => {
        const metadata = result.metadata as { year?: string; text?: string } || {};
        return `
      Source Year: ${metadata.year || 'N/A'}
      Content: ${metadata.text || 'No text available.'}
    `}).join('\n\n---\n\n');

    return context;
  },
});

export const financialAnalystAgent = new Agent({
  name: 'financial_analyst',
instructions: `You are a financial analyst trained on Warren Buffett's philosophy.
Your knowledge comes from Berkshire Hathaway shareholder letters.
When you answer, you MUST cite the source year for the information you use.
The user will provide a query, and you will be given context from the letters formatted as "Source Year: [year] Content: [text]".
Synthesize an answer from the content and include citations like [Source: 2021] in your response.`,
  model: google('gemini-2.5-flash'),
  // tools: [vectorSearchTool],
});