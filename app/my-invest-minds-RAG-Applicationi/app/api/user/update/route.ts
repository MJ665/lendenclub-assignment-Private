// app/api/user/update/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { bio, systemInstruction } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: bio,
      systemInstruction: systemInstruction,
    },
  });

  return NextResponse.json({ message: 'Profile updated successfully' });
}