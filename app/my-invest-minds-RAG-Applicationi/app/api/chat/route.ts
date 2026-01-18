// app/api/chat/route.ts
import { streamText, type Message } from 'ai';
import { financialAnalystAgent } from '@/mastra/agents/financial-analyst';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming this is the correct path to your auth options
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { messages }: { messages: Message[] } = await req.json();

  // Fetch the user's custom instructions from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { systemInstruction: true },
  });

  let messagesForAgent = messages;

  // If a custom instruction exists, prepend it to the message history as a 'system' message
  if (user?.systemInstruction) {
    messagesForAgent = [
      {
        id: 'system-prompt',
        role: 'system',
        content: user.systemInstruction,
      },
      ...messages,
    ];
  }

  const userQuery = messages[messages.length - 1].content;

  // Use the agent's model and tools with streamText
  const result = await streamText({
    model: financialAnalystAgent.model, // Use the model from your agent
    messages: messagesForAgent,
    tools: financialAnalystAgent.tools, // Pass the tools from your agent
    system: financialAnalystAgent.instructions, // Pass the agent's instructions as the system prompt

    onFinish: async ({ text }) => {
      // Save the final response to the database
      await prisma.query.create({
        data: {
          userId: session.user.id as string,
          query: userQuery,
          response: text,
        },
      });
    },
  });

  // FIX: Changed to toTextStreamResponse as suggested by the TypeScript error
  return result.toTextStreamResponse();
}