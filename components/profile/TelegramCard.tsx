'use client';

/**
 * Telegram Card
 * Shows Telegram connection status and allows linking
 */

import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Bell, BellOff, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TelegramCardProps {
  user: User;
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'PolygonCampaignsBot';

export function TelegramCard({ user }: TelegramCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [notifyOptIn, setNotifyOptIn] = useState(user.notifyOptIn);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  const isConnected = !!user.telegramUsername;

  // Poll for connection while waiting
  const pollForConnection = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/profile/telegram/status');
        const data = await response.json();
        if (data.success && data.connected) {
          clearInterval(interval);
          setIsWaiting(false);
          router.refresh();
        }
      } catch (error) {
        console.error('Error polling Telegram status:', error);
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsWaiting(false);
    }, 5 * 60 * 1000);

    return interval;
  }, [router]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isWaiting) {
      interval = pollForConnection();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaiting, pollForConnection]);

  const handleLinkTelegram = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/telegram/generate-code', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.code) {
        // Open Telegram deep link - this auto-sends /start CODE to the bot
        window.open(`https://t.me/${BOT_USERNAME}?start=${data.code}`, '_blank');
        setIsWaiting(true);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    setIsUpdatingPreferences(true);
    try {
      const response = await fetch('/api/profile/telegram/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyOptIn: !notifyOptIn }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifyOptIn(data.notifyOptIn);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  return (
    <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Telegram
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            Get notified when campaigns launch
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
          <div className="mb-4">
            <div className="font-medium text-[rgb(var(--color-text-primary))]">
              @{user.telegramUsername}
            </div>
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
              {notifyOptIn ? 'Notifications enabled' : 'Notifications disabled'}
            </div>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={isUpdatingPreferences}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {notifyOptIn ? (
              <Bell className="w-4 h-4 text-green-600" />
            ) : (
              <BellOff className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            )}
            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {isUpdatingPreferences
                ? 'Updating...'
                : notifyOptIn
                ? 'Disable Notifications'
                : 'Enable Notifications'}
            </span>
          </button>
        </>
      ) : isWaiting ? (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
            Waiting for you to confirm in Telegram...
          </p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
            Tap &quot;Start&quot; in the Telegram bot to complete linking.
          </p>
          <button
            onClick={handleLinkTelegram}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Re-open Telegram
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Link your Telegram account to receive notifications when new campaigns
            launch.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleLinkTelegram}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Telegram...
              </>
            ) : (
              'Link Telegram'
            )}
          </Button>
        </>
      )}
    </div>
  );
}
