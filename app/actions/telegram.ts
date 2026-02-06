'use server';

/**
 * Server Actions for Telegram Integration
 */

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import crypto from 'crypto';

export async function generateTelegramLinkingCode(): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Generate a 6-character alphanumeric code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Set expiry to 15 minutes from now
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with linking code
    await prisma.user.update({
      where: { id: user.id },
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
