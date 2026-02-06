/**
 * Campaign Detail Page
 * Shows campaign details and submission module using CampaignDetail component
 */

import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { CampaignDetail } from '@/components/campaign-detail';
import type { Campaign } from '@/components/campaign-card';
import { formatDistanceToNow, format, isPast } from 'date-fns';

async function getCampaign(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
      winners: {
        include: {
          user: true,
        },
      },
    },
  });

  return campaign;
}

async function getUserSubmission(campaignId: string, userId: string) {
  return await prisma.submission.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
  });
}

/**
 * Maps Prisma campaign data to Campaign interface expected by CampaignDetail component
 */
function mapCampaignToInterface(
  campaign: NonNullable<Awaited<ReturnType<typeof getCampaign>>>
): Campaign {
  const isLive = campaign.status === 'LIVE';
  const isEnded = campaign.status === 'ENDED';
  const hasWinners = campaign.status === 'WINNERS_SELECTED';

  // Determine status for the component
  let status: Campaign['status'] = 'ended';

  if (hasWinners) {
    status = 'winners-selected';
  } else if (isLive && campaign.endAt) {
    const timeUntilEnd = new Date(campaign.endAt).getTime() - Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (timeUntilEnd > 0 && timeUntilEnd < oneDayInMs) {
      status = 'ending-soon';
    } else if (timeUntilEnd > 0) {
      status = 'live';
    }
  } else if (isLive) {
    status = 'live';
  }

  // Format time remaining for live campaigns
  let timeRemaining = '';
  if ((status === 'live' || status === 'ending-soon') && campaign.endAt && !isPast(campaign.endAt)) {
    timeRemaining = formatDistanceToNow(campaign.endAt, { addSuffix: true });
  }

  // Format deadline
  const deadline = campaign.endAt
    ? format(campaign.endAt, 'MMM d, yyyy h:mm a')
    : 'No deadline set';

  // Format prize pool
  const prizePool = `${campaign.prizePoolCurrency} ${Number(campaign.prizePoolAmount).toLocaleString()}`;

  return {
    id: campaign.id,
    title: campaign.title,
    summary: campaign.brief.length > 150
      ? campaign.brief.substring(0, 150) + '...'
      : campaign.brief,
    status,
    prizePool,
    winnersCount: campaign.winnersCount,
    timeRemaining,
    deadline,
    brief: campaign.brief,
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const campaignData = await getCampaign(id);

  if (!campaignData) {
    notFound();
  }

  // Get user's submission if they're logged in
  const userSubmission = user
    ? await getUserSubmission(campaignData.id, user.id)
    : null;

  // Map campaign data to the interface expected by CampaignDetail
  const campaign = mapCampaignToInterface(campaignData);

  return (
    <CampaignDetail
      campaign={campaign}
      isAuthenticated={!!user}
      hasSubmitted={!!userSubmission}
      submissionUrl={userSubmission?.xPostUrl}
      isWinner={userSubmission?.status === 'WINNER'}
    />
  );
}
