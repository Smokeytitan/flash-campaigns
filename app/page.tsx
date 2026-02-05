/**
 * Homepage - Campaign Feed
 * Shows live and ended campaigns for creators
 */

import { auth } from '@/auth';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Trophy, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

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

export default async function HomePage() {
  const session = await auth();

  const campaigns = await getCampaigns();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-accent-primary))] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <h1 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
              Flash Campaigns
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="secondary" size="sm">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
            Flash Campaigns
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))] text-lg">
            Submit your X posts to win prizes. New campaigns launch every week.
          </p>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))] text-lg">
              No campaigns available at the moment.
            </p>
            <p className="text-[rgb(var(--color-text-tertiary))] mt-2">
              Check back soon for new opportunities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const isLive = campaign.status === 'LIVE';
              const isEnded = campaign.status === 'ENDED';
              const hasWinners = campaign.status === 'WINNERS_SELECTED';
              const endingSoon =
                isLive &&
                campaign.endAt &&
                !isPast(campaign.endAt) &&
                new Date(campaign.endAt).getTime() - Date.now() <
                  24 * 60 * 60 * 1000;

              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block group"
                >
                  <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6 transition-all duration-150 hover:border-[rgb(var(--color-accent-primary))] hover:shadow-md">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent-primary))] transition-colors">
                        {campaign.title}
                      </h3>
                      {isLive && (
                        <Badge variant={endingSoon ? 'ending-soon' : 'live'} showPulse={!endingSoon} />
                      )}
                      {isEnded && <Badge variant="ended" />}
                      {hasWinners && <Badge variant="winners-selected" />}
                    </div>

                    {/* Brief */}
                    <p className="text-[rgb(var(--color-text-secondary))] mb-4 line-clamp-2">
                      {campaign.brief}
                    </p>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
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

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border-secondary))]">
                      <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
                        {campaign._count.submissions}{' '}
                        {campaign._count.submissions === 1
                          ? 'submission'
                          : 'submissions'}
                      </span>
                      <div className="flex items-center gap-1 text-[rgb(var(--color-accent-primary))] font-medium text-sm group-hover:gap-2 transition-all">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
