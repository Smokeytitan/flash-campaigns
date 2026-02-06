/**
 * API Route: Finalize Campaign Winners
 * POST /api/campaigns/[id]/winners
 */

import { requireAdmin } from '@/lib/clerk-auth';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const userId = await requireAdmin();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { submissionIds } = body;

    // Validate input
    if (!submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json(
        { error: 'Invalid submission IDs' },
        { status: 400 }
      );
    }

    if (submissionIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one winner must be selected' },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Validate winner count
    if (submissionIds.length > campaign.winnersCount) {
      return NextResponse.json(
        {
          error: `Cannot select more than ${campaign.winnersCount} winners`,
        },
        { status: 400 }
      );
    }

    // Get submissions
    const submissions = await prisma.submission.findMany({
      where: {
        id: { in: submissionIds },
        campaignId,
      },
      include: {
        user: true,
      },
    });

    if (submissions.length !== submissionIds.length) {
      return NextResponse.json(
        { error: 'Some submissions are invalid or do not belong to this campaign' },
        { status: 400 }
      );
    }

    // Calculate prize distribution (equal split)
    const prizePerWinner = Number(campaign.prizePoolAmount) / submissionIds.length;

    // Create winners in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing winners
      await tx.winner.deleteMany({
        where: { campaignId },
      });

      // Reset all submissions to SUBMITTED status
      await tx.submission.updateMany({
        where: { campaignId },
        data: { status: 'SUBMITTED' },
      });

      // Create new winners
      const winners = await Promise.all(
        submissions.map((submission, index) =>
          tx.winner.create({
            data: {
              campaignId,
              submissionId: submission.id,
              userId: submission.userId,
              rank: index + 1,
              prizeAmount: prizePerWinner,
              selectedBy: userId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  xHandle: true,
                  xName: true,
                  xAvatarUrl: true,
                },
              },
              submission: {
                select: {
                  xPostUrl: true,
                  xPostId: true,
                },
              },
            },
          })
        )
      );

      // Update submission status to WINNER
      await tx.submission.updateMany({
        where: {
          id: { in: submissionIds },
        },
        data: {
          status: 'WINNER',
        },
      });

      // Update campaign status to WINNERS_SELECTED
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'WINNERS_SELECTED' },
      });

      return winners;
    });

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        winnersCount: result.length,
        winners: result.map((winner) => ({
          id: winner.id,
          rank: winner.rank,
          prizeAmount: winner.prizeAmount,
          user: {
            id: winner.user.id,
            xHandle: winner.user.xHandle,
            xName: winner.user.xName,
            xAvatarUrl: winner.user.xAvatarUrl,
          },
          submission: {
            xPostUrl: winner.submission.xPostUrl,
            xPostId: winner.submission.xPostId,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error finalizing winners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaigns/[id]/winners
 * Fetch current winners for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const userId = await requireAdmin();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Fetch winners
    const winners = await prisma.winner.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            xHandle: true,
            xName: true,
            xAvatarUrl: true,
          },
        },
        submission: {
          select: {
            xPostUrl: true,
            xPostId: true,
          },
        },
      },
      orderBy: {
        rank: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        winnersCount: winners.length,
        winners: winners.map((winner) => ({
          id: winner.id,
          rank: winner.rank,
          prizeAmount: winner.prizeAmount,
          selectedAt: winner.selectedAt,
          user: {
            id: winner.user.id,
            xHandle: winner.user.xHandle,
            xName: winner.user.xName,
            xAvatarUrl: winner.user.xAvatarUrl,
          },
          submission: {
            xPostUrl: winner.submission.xPostUrl,
            xPostId: winner.submission.xPostId,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
