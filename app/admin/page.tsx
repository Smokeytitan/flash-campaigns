/**
 * Admin Dashboard
 * Shows all campaigns and allows creating new ones
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  AdminManage,
  AdminManageStats,
  AdminManageSection,
  AdminManageEmpty,
} from '@/components/admin-manage';

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
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'ADMIN') {
    redirect('/');
  }

  const campaigns = await getCampaigns();

  return (
    <AdminManage
      title="Admin Dashboard"
      backUrl="/"
      backLabel="Home"
      showCreateButton
      createUrl="/admin/campaigns/new"
      createLabel="New Campaign"
    >
      {/* Stats */}
      <AdminManageStats
        stats={[
          {
            label: 'Total Campaigns',
            value: campaigns.length,
            variant: 'default',
          },
          {
            label: 'Live Campaigns',
            value: campaigns.filter((c) => c.status === 'LIVE').length,
            variant: 'accent',
          },
          {
            label: 'Total Submissions',
            value: campaigns.reduce((acc, c) => acc + c._count.submissions, 0),
            variant: 'default',
          },
        ]}
      />

      {/* Campaigns List */}
      <AdminManageSection title="All Campaigns">
        {campaigns.length === 0 ? (
          <AdminManageEmpty
            message="No campaigns yet. Create your first campaign to get started."
            action={
              <Link href="/admin/campaigns/new">
                <Button variant="primary">Create Campaign</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border-secondary))] -mx-6 -my-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="px-6 py-4 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
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
                      {campaign.status === 'LIVE' && <Badge variant="live">Live</Badge>}
                      {campaign.status === 'DRAFT' && (
                        <Badge variant="draft">Draft</Badge>
                      )}
                      {campaign.status === 'ENDED' && <Badge variant="ended">Ended</Badge>}
                      {campaign.status === 'WINNERS_SELECTED' && (
                        <Badge variant="winners-selected">Winners Selected</Badge>
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
      </AdminManageSection>
    </AdminManage>
  );
}
