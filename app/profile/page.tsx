/**
 * Profile Page
 * User can connect X account and Telegram, view their submissions
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { XAccountCard } from '@/components/profile/XAccountCard';
import { TelegramCard } from '@/components/profile/TelegramCard';

async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

async function getUserSubmissions(userId: string) {
  return await prisma.submission.findMany({
    where: { userId },
    include: {
      campaign: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }

  const user = await getUser(session.user.id);
  const submissions = await getUserSubmissions(session.user.id);

  if (!user) {
    redirect('/api/auth/signin');
  }

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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-8">
          Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* X Account */}
          <XAccountCard user={user} />

          {/* Telegram */}
          <TelegramCard user={user} />
        </div>

        {/* Submissions */}
        <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            Your Submissions
          </h2>

          {submissions.length === 0 ? (
            <p className="text-[rgb(var(--color-text-secondary))] text-center py-8">
              You haven't submitted to any campaigns yet.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-[rgb(var(--color-border-secondary))] rounded-lg hover:border-[rgb(var(--color-border-primary))] transition-colors"
                >
                  <div className="flex-1">
                    <Link
                      href={`/campaigns/${submission.campaign.id}`}
                      className="font-medium text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent-primary))] transition-colors"
                    >
                      {submission.campaign.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      {submission.status === 'WINNER' && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Winner
                        </span>
                      )}
                      {submission.status === 'SUBMITTED' && (
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          Submitted
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={submission.xPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[rgb(var(--color-accent-primary))] hover:underline"
                  >
                    View Post
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
