'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ConnectXBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 pt-6">
      <div className="relative rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              Connect your X account
            </p>
            <p className="text-xs text-gray-600">
              Required to submit posts to campaigns and earn prizes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api/x-auth/authorize">
            <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
              Connect X
            </Button>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
