'use client';

/**
 * Campaign Status Control
 * Allows admins to change campaign status
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { updateCampaignStatus } from '@/app/actions/campaigns';

interface CampaignStatusControlProps {
  campaignId: string;
  currentStatus: 'DRAFT' | 'LIVE' | 'ENDED' | 'WINNERS_SELECTED';
}

export function CampaignStatusControl({
  campaignId,
  currentStatus,
}: CampaignStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (
    newStatus: 'DRAFT' | 'LIVE' | 'ENDED' | 'WINNERS_SELECTED'
  ) => {
    if (confirm(`Change campaign status to ${newStatus}?`)) {
      setIsUpdating(true);
      try {
        const result = await updateCampaignStatus(campaignId, newStatus);
        if (result.success) {
          router.refresh();
        }
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus === 'DRAFT' && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatusChange('LIVE')}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Go Live'
          )}
        </Button>
      )}

      {currentStatus === 'LIVE' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleStatusChange('ENDED')}
          disabled={isUpdating}
        >
          {isUpdating ? 'Ending...' : 'End Campaign'}
        </Button>
      )}

      {currentStatus === 'ENDED' && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatusChange('LIVE')}
          disabled={isUpdating}
        >
          {isUpdating ? 'Reopening...' : 'Reopen'}
        </Button>
      )}
    </div>
  );
}
