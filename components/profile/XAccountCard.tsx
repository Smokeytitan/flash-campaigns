'use client';

/**
 * X Account Card
 * Shows X connection status and allows connect/disconnect
 */

import { useState } from 'react';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface XAccountCardProps {
  user: User;
}

export function XAccountCard({ user }: XAccountCardProps) {
  const isConnected = !!user.xHandle;
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/x-auth/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to disconnect X account');
      }
    } catch (error) {
      console.error('Error disconnecting X account:', error);
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            X Account
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            Required to submit to campaigns
          </p>
        </div>
        {isConnected ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
        )}
      </div>

      {isConnected ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            {user.xAvatarUrl && (
              <img
                src={user.xAvatarUrl}
                alt={user.xHandle || 'X avatar'}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-[rgb(var(--color-text-primary))]">
                {user.xName || user.xHandle}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                @{user.xHandle}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Connect your X account to start submitting to campaigns and earning
            rewards.
          </p>
          <Link href="/api/x-auth/authorize">
            <Button variant="primary" size="sm">
              Connect X Account
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
