'use client';

/**
 * Wallet Card
 * Shows Polygon wallet address and allows editing
 */

import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WalletCardProps {
  user: User;
}

const POLYGON_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function WalletCard({ user }: WalletCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState(user.polygonWalletAddress || '');
  const [error, setError] = useState('');

  const isConnected = !!user.polygonWalletAddress;

  const handleSave = async () => {
    const trimmed = address.trim();

    if (trimmed && !POLYGON_ADDRESS_REGEX.test(trimmed)) {
      setError('Invalid address. Must start with 0x followed by 40 hex characters.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/profile/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: trimmed || null }),
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Error saving wallet:', err);
      setError('Failed to save wallet address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAddress(user.polygonWalletAddress || '');
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Polygon Wallet
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            Required to receive prizes
          </p>
        </div>
        {isConnected ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
        )}
      </div>

      {isEditing ? (
        <div>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError('');
            }}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : isConnected ? (
        <>
          <div className="mb-4">
            <div className="font-mono text-sm text-[rgb(var(--color-text-primary))] break-all">
              {user.polygonWalletAddress}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
          >
            <Pencil className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              Edit Address
            </span>
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Add your Polygon wallet address to receive prize payouts.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Add Wallet Address
          </Button>
        </>
      )}
    </div>
  );
}
