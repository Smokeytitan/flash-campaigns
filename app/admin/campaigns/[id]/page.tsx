/**
 * Admin Campaign Management Page
 * View submissions and select winners
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, DollarSign, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { CampaignStatusControl } from '@/components/admin/CampaignStatusControl';
import { SubmissionsTable } from '@/components/admin/SubmissionsTable';

async function getCampaign(id: string) {
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      submissions: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      winners: {
        include: {
          user: true,
          submission: true,
        },
        orderBy: {
          rank: 'asc',
        },
      },
    },
  });
}

export default async function AdminCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'ADMIN') {
    redirect('/');
  }

  const { id } = params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                {campaign.title}
              </h1>
              <div className="flex items-center gap-2">
                {campaign.status === 'LIVE' && <Badge variant="live">Live</Badge>}
                {campaign.status === 'DRAFT' && <Badge variant="draft">Draft</Badge>}
                {campaign.status === 'ENDED' && <Badge variant="ended">Ended</Badge>}
                {campaign.status === 'WINNERS_SELECTED' && (
                  <Badge variant="winners-selected">Winners Selected</Badge>
                )}
              </div>
            </div>

            <CampaignStatusControl
              campaignId={campaign.id}
              currentStatus={campaign.status}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Campaign Info */}
        <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            Campaign Details
          </h2>

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
                label="Ends"
                value={format(campaign.endAt, 'MMM d, yyyy h:mm a')}
              />
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              Brief
            </h3>
            <p className="text-[rgb(var(--color-text-primary))]">{campaign.brief}</p>
          </div>

          {campaign.requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                Requirements
              </h3>
              <ul className="list-disc list-inside space-y-1 text-[rgb(var(--color-text-primary))]">
                {campaign.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Winners Section (if any) */}
        {campaign.winners.length > 0 && (
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Winners
            </h2>

            <div className="space-y-3">
              {campaign.winners.map((winner) => (
                <div
                  key={winner.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{winner.rank}
                    </div>
                    <div>
                      <div className="font-medium text-[rgb(var(--color-text-primary))]">
                        {winner.user.xName || winner.user.xHandle}
                      </div>
                      <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        @{winner.user.xHandle}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {winner.prizeAmount && (
                      <div className="font-semibold text-green-700">
                        {campaign.prizePoolCurrency}{' '}
                        {Number(winner.prizeAmount).toLocaleString()}
                      </div>
                    )}
                    <a
                      href={winner.submission.xPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[rgb(var(--color-accent-primary))] hover:underline"
                    >
                      View Post
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            Submissions ({campaign.submissions.length})
          </h2>

          {campaign.submissions.length === 0 ? (
            <p className="text-center text-[rgb(var(--color-text-secondary))] py-8">
              No submissions yet
            </p>
          ) : (
            <SubmissionsTable
              campaignId={campaign.id}
              submissions={campaign.submissions}
              winnersCount={campaign.winnersCount}
              hasWinners={campaign.winners.length > 0}
            />
          )}
        </div>
      </main>
    </div>
  );
}
