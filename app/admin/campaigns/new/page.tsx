/**
 * Create New Campaign Page
 * Form for admins to create new campaigns
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CampaignForm } from '@/components/admin/CampaignForm';

export default async function NewCampaignPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
            Create New Campaign
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Fill in the details below to create a new flash campaign.
          </p>
        </div>

        <CampaignForm />
      </main>
    </div>
  );
}
