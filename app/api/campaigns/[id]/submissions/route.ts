/**
 * API Route: Get Campaign Submissions
 * GET /api/campaigns/[id]/submissions
 */

import { requireAdmin } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const userId = await requireAdmin();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch campaign with submissions
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                xHandle: true,
                xName: true,
                xAvatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        status: campaign.status,
        winnersCount: campaign.winnersCount,
        submissions: campaign.submissions.map((sub) => ({
          id: sub.id,
          xPostUrl: sub.xPostUrl,
          xPostId: sub.xPostId,
          status: sub.status,
          createdAt: sub.createdAt,
          user: {
            id: sub.user.id,
            xHandle: sub.user.xHandle,
            xName: sub.user.xName,
            xAvatarUrl: sub.user.xAvatarUrl,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
