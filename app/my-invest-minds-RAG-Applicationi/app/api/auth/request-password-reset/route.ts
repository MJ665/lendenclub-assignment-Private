// app/api/auth/request-password-reset/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // Make sure this is imported

const prisma = new PrismaClient();

// Configure Nodemailer with your .env variables
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, always return a generic success message
      return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetTokenExpiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    // Send the email
    await transporter.sendMail({
      from: `"InvestMind" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: 'InvestMind - Reset Your Password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link will expire in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Password Reset Request Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}