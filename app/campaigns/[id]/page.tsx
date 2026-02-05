/**
 * Campaign Detail Page
 * Shows campaign details and submission module
 */

import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import {
  Clock,
  DollarSign,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { SubmitModule } from '@/components/campaigns/SubmitModule';

async function getCampaign(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          submissions: true,
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

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  // Get user's submission if they're logged in
  const userSubmission = session
    ? await getUserSubmission(campaign.id, session.user.id)
    : null;

  const isLive = campaign.status === 'LIVE';
  const isEnded = campaign.status === 'ENDED';
  const hasWinners = campaign.status === 'WINNERS_SELECTED';
  const endingSoon =
    isLive &&
    campaign.endAt &&
    !isPast(campaign.endAt) &&
    new Date(campaign.endAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const canSubmit = isLive && session && !userSubmission;
  const hasSubmitted = !!userSubmission;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Campaigns</span>
          </Link>

          {session && (
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                Profile
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Campaign Header */}
        <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
              {campaign.title}
            </h1>
            {isLive && (
              <Badge variant={endingSoon ? 'ending-soon' : 'live'} showPulse={!endingSoon} />
            )}
            {isEnded && <Badge variant="ended" />}
            {hasWinners && <Badge variant="winners-selected" />}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Chip
              icon={DollarSign}
              label="Prize Pool"
              value={`${campaign.prizePoolCurrency} ${Number(
                campaign.prizePoolAmount
              ).toLocaleString()}`}
            />
            <Chip
              icon={Trophy}
              label="Winners"
              value={campaign.winnersCount.toString()}
            />
            {campaign.endAt && (
              <Chip
                icon={Clock}
                label={isLive ? 'Ends' : 'Ended'}
                value={
                  isLive
                    ? formatDistanceToNow(campaign.endAt, {
                        addSuffix: true,
                      })
                    : format(campaign.endAt, 'MMM d, yyyy')
                }
              />
            )}
          </div>

          {/* Brief */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              Campaign Brief
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] leading-relaxed">
              {campaign.brief}
            </p>
          </div>

          {/* Requirements */}
          {campaign.requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Requirements
              </h2>
              <ul className="space-y-2">
                {campaign.requirements.map((req, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[rgb(var(--color-text-secondary))]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[rgb(var(--color-accent-primary))] mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submission Status / Module */}
        {hasSubmitted && userSubmission ? (
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-8">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                  Submission Received
                </h2>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  Your submission has been recorded. Winners will be announced once
                  the campaign ends.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))] mb-2">
                Your submission:
              </p>
              <a
                href={userSubmission.xPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[rgb(var(--color-accent-primary))] hover:underline"
              >
                {userSubmission.xPostUrl}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {userSubmission.status === 'WINNER' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                  <Trophy className="w-5 h-5" />
                  Congratulations! You're a winner!
                </div>
                <p className="text-green-700 text-sm">
                  You'll be contacted soon with details about claiming your prize.
                </p>
              </div>
            )}
          </div>
        ) : !session ? (
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Sign in to submit
              </h2>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                Connect your X account to submit your post and enter this campaign.
              </p>
              <Link href="/api/auth/signin">
                <Button variant="primary">Sign In</Button>
              </Link>
            </div>
          </div>
        ) : !isLive ? (
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <XCircle className="w-12 h-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Campaign {isEnded ? 'Ended' : 'Not Live'}
              </h2>
              <p className="text-[rgb(var(--color-text-secondary))]">
                {isEnded
                  ? 'This campaign has ended and is no longer accepting submissions.'
                  : 'This campaign is not currently accepting submissions.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-8">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Submit Your Entry
            </h2>
            <SubmitModule campaignId={campaign.id} />
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 text-center text-sm text-[rgb(var(--color-text-tertiary))]">
          {campaign._count.submissions}{' '}
          {campaign._count.submissions === 1 ? 'submission' : 'submissions'} so
          far
        </div>
      </main>
    </div>
  );
}
