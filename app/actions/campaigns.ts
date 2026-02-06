'use server';

/**
 * Server Actions for Campaign Management
 */

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function createCampaign(
  formData: FormData
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const brief = formData.get('brief') as string;
    const requirementsJson = formData.get('requirements') as string;
    const startAtStr = formData.get('startAt') as string;
    const endAtStr = formData.get('endAt') as string;
    const prizePoolAmount = formData.get('prizePoolAmount') as string;
    const prizePoolCurrency = formData.get('prizePoolCurrency') as string;
    const winnersCount = formData.get('winnersCount') as string;

    // Parse requirements
    const requirements = JSON.parse(requirementsJson || '[]');

    // Parse dates
    const startAt = startAtStr ? new Date(startAtStr) : null;
    const endAt = new Date(endAtStr);

    // Validate
    if (!title || !brief || !endAt || !prizePoolAmount || !winnersCount) {
      return { success: false, error: 'Missing required fields' };
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        title: title.trim(),
        brief: brief.trim(),
        requirements,
        status: 'DRAFT',
        startAt,
        endAt,
        prizePoolAmount: parseFloat(prizePoolAmount),
        prizePoolCurrency: (prizePoolCurrency || 'USD').trim().toUpperCase(),
        winnersCount: parseInt(winnersCount, 10),
        createdById: user.id,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, campaignId: campaign.id };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: 'Failed to create campaign' };
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'DRAFT' | 'LIVE' | 'ENDED' | 'WINNERS_SELECTED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    });

    revalidatePath('/admin');
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath('/');
    revalidatePath(`/campaigns/${campaignId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating campaign status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function selectWinners(
  campaignId: string,
  submissionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    if (submissionIds.length > campaign.winnersCount) {
      return {
        success: false,
        error: `Can only select ${campaign.winnersCount} winners`,
      };
    }

    // Get submissions
    const submissions = await prisma.submission.findMany({
      where: {
        id: { in: submissionIds },
        campaignId,
      },
    });

    if (submissions.length !== submissionIds.length) {
      return { success: false, error: 'Invalid submissions' };
    }

    // Calculate prize distribution (simple equal split for now)
    const prizePerWinner = Number(campaign.prizePoolAmount) / submissionIds.length;

    // Create winners in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing winners
      await tx.winner.deleteMany({
        where: { campaignId },
      });

      // Create new winners
      await Promise.all(
        submissions.map((submission, index) =>
          tx.winner.create({
            data: {
              campaignId,
              submissionId: submission.id,
              userId: submission.userId,
              rank: index + 1,
              prizeAmount: prizePerWinner,
              selectedBy: user.id,
            },
          })
        )
      );

      // Update submission status
      await tx.submission.updateMany({
        where: {
          id: { in: submissionIds },
        },
        data: {
          status: 'WINNER',
        },
      });

      // Update campaign status
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'WINNERS_SELECTED' },
      });
    });

    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/campaigns/${campaignId}`);

    return { success: true };
  } catch (error) {
    console.error('Error selecting winners:', error);
    return { success: false, error: 'Failed to select winners' };
  }
}
