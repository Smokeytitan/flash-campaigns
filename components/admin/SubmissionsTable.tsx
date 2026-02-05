'use client';

/**
 * Submissions Table
 * Shows all submissions and allows selecting winners
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { selectWinners } from '@/app/actions/campaigns';

interface Submission {
  id: string;
  xPostUrl: string;
  xPostId: string;
  status: string;
  createdAt: Date;
  user: {
    xHandle: string | null;
    xName: string | null;
    xAvatarUrl: string | null;
  };
}

interface SubmissionsTableProps {
  campaignId: string;
  submissions: Submission[];
  winnersCount: number;
  hasWinners: boolean;
}

export function SubmissionsTable({
  campaignId,
  submissions,
  winnersCount,
  hasWinners,
}: SubmissionsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const router = useRouter();

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      if (selectedIds.length < winnersCount) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleSelectWinners = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one winner');
      return;
    }

    if (
      confirm(
        `Select ${selectedIds.length} winner(s)? ${
          hasWinners ? 'This will replace existing winners.' : ''
        }`
      )
    ) {
      setIsSelecting(true);
      try {
        const result = await selectWinners(campaignId, selectedIds);
        if (result.success) {
          setSelectedIds([]);
          router.refresh();
        } else {
          alert(result.error || 'Failed to select winners');
        }
      } finally {
        setIsSelecting(false);
      }
    }
  };

  return (
    <div>
      {/* Selection Controls */}
      <div className="mb-4 p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-between">
        <div>
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            Selected: <strong>{selectedIds.length}</strong> / {winnersCount}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSelectWinners}
          disabled={selectedIds.length === 0 || isSelecting}
        >
          {isSelecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Selecting...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Select Winners
            </>
          )}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--color-border-secondary))]">
              <th className="text-left p-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Select
              </th>
              <th className="text-left p-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Creator
              </th>
              <th className="text-left p-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Submitted
              </th>
              <th className="text-left p-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Post
              </th>
              <th className="text-left p-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className="border-b border-[rgb(var(--color-border-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(submission.id)}
                    onChange={() => handleToggle(submission.id)}
                    disabled={
                      !selectedIds.includes(submission.id) &&
                      selectedIds.length >= winnersCount
                    }
                    className="w-4 h-4 text-[rgb(var(--color-accent-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-accent-primary))]"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {submission.user.xAvatarUrl && (
                      <img
                        src={submission.user.xAvatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium text-[rgb(var(--color-text-primary))] text-sm">
                        {submission.user.xName || submission.user.xHandle}
                      </div>
                      <div className="text-xs text-[rgb(var(--color-text-tertiary))]">
                        @{submission.user.xHandle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-[rgb(var(--color-text-secondary))]">
                  {format(submission.createdAt, 'MMM d, yyyy')}
                </td>
                <td className="p-3">
                  <a
                    href={submission.xPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[rgb(var(--color-accent-primary))] hover:underline"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="p-3">
                  {submission.status === 'WINNER' && (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Winner
                    </span>
                  )}
                  {submission.status === 'SUBMITTED' && (
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      Submitted
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
