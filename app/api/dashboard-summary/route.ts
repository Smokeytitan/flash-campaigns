/**
 * API Route: Dashboard Summary
 * GET /api/dashboard-summary
 *
 * Read-only endpoint that returns aggregate metrics for the Polygon Super Dashboard.
 * Protected by API key via x-api-key header.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.DASHBOARD_API_KEY;

    if (!expectedKey) {
      console.error('DASHBOARD_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      campaignCountsByStatus,
      totalCampaigns,
      totalSubmissions,
      totalParticipants,
      activePrizePool,
      allTimePrizePool,
      totalWinners,
      totalPrizeAwarded,
      submissionsLast7Days,
      campaignsLaunchedLast30Days,
      recentCampaigns,
    ] = await Promise.all([
      // Campaign counts by status
      prisma.campaign.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Total campaigns
      prisma.campaign.count(),

      // Total submissions
      prisma.submission.count(),

      // Distinct participants (users who have at least one submission)
      prisma.submission.findMany({
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Sum of prizePoolAmount for LIVE campaigns
      prisma.campaign.aggregate({
        where: { status: 'LIVE' },
        _sum: { prizePoolAmount: true },
      }),

      // Sum of prizePoolAmount for all campaigns
      prisma.campaign.aggregate({
        _sum: { prizePoolAmount: true },
      }),

      // Total winners
      prisma.winner.count(),

      // Sum of prizeAmount across all winners
      prisma.winner.aggregate({
        _sum: { prizeAmount: true },
      }),

      // Submissions in the last 7 days
      prisma.submission.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),

      // Campaigns that went LIVE in the last 30 days
      // A campaign "launched" means it has a startAt within the last 30 days
      // and its status is not DRAFT (it actually launched)
      prisma.campaign.count({
        where: {
          startAt: { gte: thirtyDaysAgo },
          status: { not: 'DRAFT' },
        },
      }),

      // Top 5 most recent LIVE or recently ENDED campaigns
      prisma.campaign.findMany({
        where: {
          status: { in: ['LIVE', 'ENDED'] },
        },
        orderBy: [
          { status: 'asc' }, // ENDED comes before LIVE alphabetically, but we want LIVE first
          { updatedAt: 'desc' },
        ],
        take: 10, // Fetch extra to sort in code
        include: {
          _count: {
            select: { submissions: true },
          },
        },
      }),
    ]);

    // Parse campaign counts by status into a lookup
    const statusCounts: Record<string, number> = {};
    for (const group of campaignCountsByStatus) {
      statusCounts[group.status] = group._count.id;
    }

    // Sort recentCampaigns: LIVE first, then by most recent updatedAt, take top 5
    const sortedRecentCampaigns = recentCampaigns
      .sort((a, b) => {
        // LIVE campaigns first
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
        // Then by updatedAt descending
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .slice(0, 5);

    // Helper to safely convert Prisma Decimal to number
    const decimalToNumber = (val: unknown): number => {
      if (val == null) return 0;
      return Number(val);
    };

    const response = {
      source: 'flash-campaigns',
      fetchedAt: now.toISOString(),
      metrics: {
        activeCampaigns: statusCounts['LIVE'] ?? 0,
        upcomingCampaigns: statusCounts['DRAFT'] ?? 0,
        endedCampaigns: statusCounts['ENDED'] ?? 0,
        completedCampaigns: statusCounts['WINNERS_SELECTED'] ?? 0,
        totalCampaigns,

        totalSubmissions,
        totalParticipants: totalParticipants.length,

        totalPrizePoolActive: decimalToNumber(activePrizePool._sum.prizePoolAmount),
        totalPrizePoolAllTime: decimalToNumber(allTimePrizePool._sum.prizePoolAmount),
        totalWinners,
        totalPrizeAwarded: decimalToNumber(totalPrizeAwarded._sum.prizeAmount),

        submissionsLast7Days,
        campaignsLaunchedLast30Days,

        avgCPM: null,
      },
      recentCampaigns: sortedRecentCampaigns.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        prizePool: decimalToNumber(c.prizePoolAmount),
        submissions: c._count.submissions,
        startAt: c.startAt?.toISOString() ?? null,
        endAt: c.endAt?.toISOString() ?? null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in dashboard-summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
