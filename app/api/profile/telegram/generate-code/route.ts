/**
 * API Route: Generate Telegram Verification Code
 * POST /api/profile/telegram/generate-code
 */

import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST() {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate a 6-character alphanumeric code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Set expiry to 15 minutes from now
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with linking code
    await prisma.user.update({
      where: { id: userId },
      data: {
        telegramLinkingCode: code,
        telegramCodeExpiry: expiry,
      },
    });

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiry.toISOString()
    });
  } catch (error) {
    console.error('Error generating Telegram linking code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
