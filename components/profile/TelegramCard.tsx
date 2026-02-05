'use client';

/**
 * Telegram Card
 * Shows Telegram connection status and allows linking
 */

import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateTelegramLinkingCode } from '@/app/actions/telegram';

interface TelegramCardProps {
  user: User;
}

export function TelegramCard({ user }: TelegramCardProps) {
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = !!user.telegramUsername;

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const result = await generateTelegramLinkingCode();
      if (result.success && result.code) {
        setLinkingCode(result.code);
      }
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
              Notifications enabled
            </div>
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
