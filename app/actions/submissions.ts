'use server';

/**
 * Server Actions for Campaign Submissions
 */

import { auth } from '@/auth';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function submitToCampaign(
  campaignId: string,
  xPostUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: 'You must be signed in to submit' };
    }

    // Validate X post URL format
    const xPostUrlPattern = /^https:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/i;
    const match = xPostUrl.match(xPostUrlPattern);

    if (!match) {
      return {
        success: false,
        error: 'Invalid X post URL. Must be in format: https://x.com/username/status/123...',
      };
    }

    const xPostId = match[2];

    // Check if campaign exists and is live
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    if (campaign.status !== 'LIVE') {
      return { success: false, error: 'Campaign is not accepting submissions' };
    }

    // Check if user already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId: session.user.id,
        },
      },
    });

    if (existingSubmission) {
      return {
        success: false,
        error: 'You have already submitted to this campaign',
      };
    }

    // Create submission
    await prisma.submission.create({
      data: {
        campaignId,
        userId: session.user.id,
        xPostUrl: xPostUrl.trim(),
        xPostId,
        status: 'SUBMITTED',
      },
    });

    // Revalidate the campaign page
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error submitting to campaign:', error);
    return {
      success: false,
      error: 'Failed to submit. Please try again later.',
    };
  }
}
