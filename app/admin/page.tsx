/**
 * Admin Dashboard
 * Shows all campaigns and allows creating new ones
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Settings, Users } from 'lucide-react';
import { format } from 'date-fns';

async function getCampaigns() {
  return await prisma.campaign.findMany({
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const campaigns = await getCampaigns();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
            <span className="text-[rgb(var(--color-border-primary))]">|</span>
            <h1 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
              Admin Dashboard
            </h1>
          </div>

          <Link href="/admin/campaigns/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
              Total Campaigns
            </div>
            <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
              {campaigns.length}
            </div>
          </div>

          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
              Live Campaigns
            </div>
            <div className="text-3xl font-bold text-[rgb(var(--color-accent-primary))]">
              {campaigns.filter((c) => c.status === 'LIVE').length}
            </div>
          </div>

          <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
              Total Submissions
            </div>
            <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
              {campaigns.reduce((acc, c) => acc + c._count.submissions, 0)}
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[rgb(var(--color-border-secondary))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
              All Campaigns
            </h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                No campaigns yet. Create your first campaign to get started.
              </p>
              <Link href="/admin/campaigns/new">
                <Button variant="primary">Create Campaign</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--color-border-secondary))]">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-6 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/admin/campaigns/${campaign.id}`}
                          className="text-lg font-semibold text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent-primary))] transition-colors"
                        >
                          {campaign.title}
                        </Link>
                        {campaign.status === 'LIVE' && <Badge variant="live" />}
                        {campaign.status === 'DRAFT' && (
                          <Badge variant="ended">Draft</Badge>
                        )}
                        {campaign.status === 'ENDED' && (
                          <Badge variant="ended" />
                        )}
                        {campaign.status === 'WINNERS_SELECTED' && (
                          <Badge variant="winners-selected" />
                        )}
                      </div>
                      <p className="text-[rgb(var(--color-text-secondary))] text-sm line-clamp-1">
                        {campaign.brief}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-[rgb(var(--color-text-tertiary))]">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign._count.submissions} submissions
                      </span>
                      <span>
                        Created {format(campaign.createdAt, 'MMM d, yyyy')}
                      </span>
                      {campaign.endAt && (
                        <span>Ends {format(campaign.endAt, 'MMM d, yyyy')}</span>
                      )}
                    </div>

                    <Link href={`/admin/campaigns/${campaign.id}`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
