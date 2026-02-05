'use client';

/**
 * SubmitModule
 * Allows creators to submit their X posts to a campaign
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { submitToCampaign } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';

interface SubmitModuleProps {
  campaignId: string;
}

export function SubmitModule({ campaignId }: SubmitModuleProps) {
  const [xPostUrl, setXPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitToCampaign(campaignId, xPostUrl);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="xPostUrl"
          className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
        >
          X Post URL
        </label>
        <input
          type="url"
          id="xPostUrl"
          value={xPostUrl}
          onChange={(e) => setXPostUrl(e.target.value)}
          placeholder="https://x.com/username/status/..."
          required
          className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
        />
        <p className="mt-2 text-sm text-[rgb(var(--color-text-tertiary))]">
          Paste the URL of your X post that meets the campaign requirements.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !xPostUrl}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Entry'
          )}
        </Button>
        {xPostUrl && (
          <a
            href={xPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </a>
        )}
      </div>

      <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
        <h3 className="font-medium text-[rgb(var(--color-text-primary))] mb-2 text-sm">
          Before submitting:
        </h3>
        <ul className="space-y-1 text-sm text-[rgb(var(--color-text-secondary))]">
          <li>• Make sure your post meets all campaign requirements</li>
          <li>• Your post must be public and visible</li>
          <li>• You can only submit once per campaign</li>
          <li>• Submissions cannot be edited after posting</li>
        </ul>
      </div>
    </form>
  );
}
