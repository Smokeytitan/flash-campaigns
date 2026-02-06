/**
 * API Route: Submit to Campaign
 * POST /api/campaigns/[id]/submit
 *
 * Handles submission of X posts to campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to submit' },
        { status: 401 }
      );
    }

    // Get campaign ID from params
    const { id: campaignId } = params;

    // Parse request body
    const body = await request.json();
    const { xPostUrl } = body;

    if (!xPostUrl || typeof xPostUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'X post URL is required' },
        { status: 400 }
      );
    }

    // Validate X post URL format
    const xPostUrlPattern = /^https:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/i;
    const match = xPostUrl.match(xPostUrlPattern);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid X post URL. Must be in format: https://x.com/username/status/123...',
        },
        { status: 400 }
      );
    }

    const xPostId = match[2];

    // Check if campaign exists and is live
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Campaign is not accepting submissions' },
        { status: 400 }
      );
    }

    // Check if campaign has ended
    if (campaign.endAt && new Date() > campaign.endAt) {
      return NextResponse.json(
        { success: false, error: 'Campaign has ended' },
        { status: 400 }
      );
    }

    // Check if user already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already submitted to this campaign',
        },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        campaignId,
        userId,
        xPostUrl: xPostUrl.trim(),
        xPostId,
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        xPostUrl: submission.xPostUrl,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting to campaign:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit. Please try again later.',
      },
      { status: 500 }
    );
  }
}
