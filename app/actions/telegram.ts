'use server';

/**
 * Server Actions for Telegram Integration
 */

import { auth } from '@/auth';
import prisma from '@/lib/db/prisma';
import crypto from 'crypto';

export async function generateTelegramLinkingCode(): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Generate a 6-character alphanumeric code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Set expiry to 15 minutes from now
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with linking code
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramLinkingCode: code,
        telegramCodeExpiry: expiry,
      },
    });

    return { success: true, code };
  } catch (error) {
    console.error('Error generating Telegram linking code:', error);
    return { success: false, error: 'Failed to generate code' };
  }
}
