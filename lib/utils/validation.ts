/**
 * Validation utilities using Zod
 */

import { z } from 'zod';

// X Post URL validation
export const xPostUrlSchema = z.string().refine(
  (url) => {
    // Match X/Twitter post URLs
    const xPostRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return xPostRegex.test(url);
  },
  {
    message: 'Must be a valid X (Twitter) post URL',
  }
);

// Extract post ID from X URL
export function extractXPostId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

// Campaign creation schema
export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  brief: z.string().min(10, 'Brief must be at least 10 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  prizePoolAmount: z.number().positive('Prize pool must be positive'),
  prizePoolCurrency: z.string().default('USD'),
  winnersCount: z.number().int().positive('Must have at least one winner'),
}).refine(
  (data) => {
    if (data.startAt && data.endAt) {
      return data.endAt > data.startAt;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endAt'],
  }
);

// Submission schema
export const submitPostSchema = z.object({
  campaignId: z.string().cuid(),
  xPostUrl: xPostUrlSchema,
});

// Winner selection schema
export const selectWinnersSchema = z.object({
  campaignId: z.string().cuid(),
  submissionIds: z.array(z.string().cuid()).min(1, 'Must select at least one winner'),
});

// Telegram linking code schema
export const telegramLinkingCodeSchema = z.string().length(6, 'Code must be 6 characters');
