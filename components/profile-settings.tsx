'use client';

/**
 * ProfileSettings Component
 * Container for user profile settings including X account and Telegram integration
 */

import { User } from '@prisma/client';
import { XAccountCard } from '@/components/profile/XAccountCard';
import { TelegramCard } from '@/components/profile/TelegramCard';
import { WalletCard } from '@/components/profile/WalletCard';

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* X Account */}
      <XAccountCard user={user} />

      {/* Telegram */}
      <TelegramCard user={user} />

      {/* Polygon Wallet */}
      <WalletCard user={user} />
    </div>
  );
}
