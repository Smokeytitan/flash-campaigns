/**
 * API Route: Update Polygon Wallet Address
 * POST /api/profile/wallet
 */

import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

const POLYGON_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

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
    const { walletAddress } = body;

    // Allow clearing the wallet address
    if (walletAddress === null || walletAddress === '') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { polygonWalletAddress: null },
        select: { polygonWalletAddress: true },
      });

      return NextResponse.json({
        success: true,
        walletAddress: user.polygonWalletAddress,
      });
    }

    // Validate Polygon wallet address format
    if (typeof walletAddress !== 'string' || !POLYGON_ADDRESS_REGEX.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Polygon wallet address. Must be a valid 0x address.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { polygonWalletAddress: walletAddress },
      select: { polygonWalletAddress: true },
    });

    return NextResponse.json({
      success: true,
      walletAddress: user.polygonWalletAddress,
    });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet address' },
      { status: 500 }
    );
  }
}
