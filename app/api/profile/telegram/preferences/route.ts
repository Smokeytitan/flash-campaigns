/**
 * API Route: Update Notification Preferences
 * POST /api/profile/telegram/preferences
 */

import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notifyOptIn } = body;

    if (typeof notifyOptIn !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid notifyOptIn value' },
        { status: 400 }
      );
    }

    // Update user's notification preference
    const user = await prisma.user.update({
      where: { id: userId },
      data: { notifyOptIn },
      select: {
        notifyOptIn: true,
        telegramChatId: true,
        telegramUsername: true,
      },
    });

    return NextResponse.json({
      success: true,
      notifyOptIn: user.notifyOptIn,
      message: notifyOptIn
        ? 'Telegram notifications enabled'
        : 'Telegram notifications disabled',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
