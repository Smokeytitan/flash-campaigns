/**
 * X OAuth Disconnect Endpoint
 * Removes X account connection from user
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';

export async function POST() {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clear X-related fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        xUserId: null,
        xHandle: null,
        xName: null,
        xAvatarUrl: null,
        xAccessToken: null,
        xRefreshToken: null,
        xTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('X disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect X account' },
      { status: 500 }
    );
  }
}
