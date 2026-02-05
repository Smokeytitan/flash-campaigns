import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect();

    // Try to count campaigns
    const campaignCount = await prisma.campaign.count();

    // Try to count users
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        campaigns: campaignCount,
        users: userCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        name: error.name,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
