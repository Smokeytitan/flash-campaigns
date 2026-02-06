'use client';

/**
 * Telegram Card
 * Shows Telegram connection status and allows linking
 */

import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, Check, Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TelegramCardProps {
  user: User;
}

export function TelegramCard({ user }: TelegramCardProps) {
  const router = useRouter();
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifyOptIn, setNotifyOptIn] = useState(user.notifyOptIn);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  const isConnected = !!user.telegramUsername;

  // Check for existing pending code on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!isConnected && !linkingCode) {
        try {
          const response = await fetch('/api/profile/telegram/status');
          const data = await response.json();
          if (data.success && data.hasPendingCode && data.pendingCode) {
            setLinkingCode(data.pendingCode);
          }
        } catch (error) {
          console.error('Error checking Telegram status:', error);
        }
      }
    };
    checkStatus();
  }, [isConnected, linkingCode]);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/telegram/generate-code', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.code) {
        setLinkingCode(data.code);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (linkingCode) {
      navigator.clipboard.writeText(linkingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleNotifications = async () => {
    setIsUpdatingPreferences(true);
    try {
      const response = await fetch('/api/profile/telegram/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

          {/* Notification Preferences Toggle */}
          <div className="mb-4">
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
          </div>
        </>
      ) : linkingCode ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3">
              Send this code to our Telegram bot to link your account:
            </p>
            <div className="flex items-center gap-2 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg font-mono text-lg font-bold text-[rgb(var(--color-text-primary))]">
              <span className="flex-1">{linkingCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-[rgb(var(--color-bg-primary))] rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${linkingCode}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="sm">
              Open Telegram Bot
            </Button>
          </a>
        </>
      ) : (
        <>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Link your Telegram account to receive notifications when new campaigns
            launch.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateCode}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Link Telegram'}
          </Button>
        </>
      )}
    </div>
  );
}
