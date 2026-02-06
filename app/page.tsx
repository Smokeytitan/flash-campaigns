/**
 * Homepage - Campaign Feed
 * Shows live and ended campaigns for creators
 * Updated to use v0 design components with real Prisma data
 * PROTECTED: Requires authentication
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { formatDistanceToNow, isPast } from 'date-fns';
import { AppHeaderWrapper } from '@/components/app-header-wrapper';
import { CampaignFeedClient } from '@/components/campaign-feed-client';
import type { Campaign } from '@/components/campaign-card';

async function getCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: {
        in: ['LIVE', 'ENDED', 'WINNERS_SELECTED'],
      },
    },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // LIVE first
      { endAt: 'desc' },
    ],
  });

  return campaigns;
}

// Map Prisma campaign data to v0 Campaign interface
function mapCampaignToV0Format(
  campaign: Awaited<ReturnType<typeof getCampaigns>>[number]
): Campaign {
  // Map database status to v0 status format
  let status: Campaign['status'] = 'ended';

  if (campaign.status === 'LIVE') {
    // Check if ending soon (within 24 hours)
    if (campaign.endAt && !isPast(campaign.endAt)) {
      const timeUntilEnd = new Date(campaign.endAt).getTime() - Date.now();
      const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);
      status = hoursUntilEnd <= 24 ? 'ending-soon' : 'live';
    } else {
      status = 'live';
    }
  } else if (campaign.status === 'ENDED') {
    status = 'ended';
  } else if (campaign.status === 'WINNERS_SELECTED') {
    status = 'winners-selected';
  }

  // Format prize pool
  const prizeAmount = Number(campaign.prizePoolAmount);
  const prizePool = `${campaign.prizePoolCurrency} ${prizeAmount.toLocaleString()}`;

  // Calculate time remaining or deadline
  let timeRemaining = '';
  let deadline = '';

  if (campaign.endAt) {
    if (status === 'live' || status === 'ending-soon') {
      timeRemaining = formatDistanceToNow(campaign.endAt, { addSuffix: true });
    }
    deadline = campaign.endAt.toISOString();
  }

  return {
    id: campaign.id,
    title: campaign.title,
    summary: campaign.brief,
    status,
    prizePool,
    winnersCount: campaign.winnersCount,
    timeRemaining,
    deadline,
    brief: campaign.brief,
  };
}

export default async function HomePage() {
  const user = await currentUser();

  // Require authentication to view homepage
  if (!user) {
    redirect('/sign-in');
  }

  const campaigns = await getCampaigns();
  const v0Campaigns = campaigns.map(mapCampaignToV0Format);

  return (
    <div className="min-h-screen">
      <AppHeaderWrapper />
      <CampaignFeedClient campaigns={v0Campaigns} />
    </div>
  );
}
