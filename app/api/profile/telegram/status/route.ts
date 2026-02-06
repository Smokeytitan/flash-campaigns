/**
 * API Route: Check Telegram Connection Status
 * GET /api/profile/telegram/status
 */

import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user's Telegram connection status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramChatId: true,
        telegramUsername: true,
        telegramLinkingCode: true,
        telegramCodeExpiry: true,
        notifyOptIn: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isConnected = !!user.telegramChatId;
    const hasPendingCode = !!(
      user.telegramLinkingCode &&
      user.telegramCodeExpiry &&
      user.telegramCodeExpiry > new Date()
    );

    return NextResponse.json({
      success: true,
      connected: isConnected,
      username: user.telegramUsername,
      notifyOptIn: user.notifyOptIn,
      hasPendingCode,
      pendingCode: hasPendingCode ? user.telegramLinkingCode : null,
      codeExpiresAt: hasPendingCode ? user.telegramCodeExpiry?.toISOString() : null,
    });
  } catch (error) {
    console.error('Error checking Telegram status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
