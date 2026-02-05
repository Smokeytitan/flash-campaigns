/**
 * X Account Card
 * Shows X connection status and allows connect/disconnect
 */

import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface XAccountCardProps {
  user: User;
}

export function XAccountCard({ user }: XAccountCardProps) {
  const isConnected = !!user.xHandle;

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

          <form action="/api/x-auth/disconnect" method="POST">
            <Button variant="ghost" size="sm" type="submit">
              Disconnect
            </Button>
          </form>
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
