// app/api/history/route.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const history = await prisma.query.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}