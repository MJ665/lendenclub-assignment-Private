// app/api/auth/reset-password/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ message: 'Missing token or password.' }, { status: 400 });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { gt: new Date() }, // Check if token is not expired
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null, // Clear the token
        passwordResetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}