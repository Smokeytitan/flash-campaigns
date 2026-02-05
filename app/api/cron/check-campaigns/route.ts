/**
 * Cron Job: Check Campaigns
 * Runs every 15 minutes to:
 * - Send notifications for newly live campaigns
 * - Automatically end campaigns that have passed their end date
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { notifyCampaignLaunch } from '@/lib/telegram/notifications';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find campaigns that just went live (status changed to LIVE in last 15 minutes)
    // For this, we'll check campaigns that are LIVE and have startAt in the last 15 minutes
    const newlyLiveCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
        startAt: {
          gte: fifteenMinutesAgo,
          lte: now,
        },
      },
    });

    console.log(`Found ${newlyLiveCampaigns.length} newly live campaigns`);

    // Send notifications for newly live campaigns
    for (const campaign of newlyLiveCampaigns) {
      // Check if we've already sent notifications (by checking notification logs)
      const existingNotifications = await prisma.notificationLog.findFirst({
        where: {
          campaignId: campaign.id,
        },
      });

      if (!existingNotifications) {
        console.log(`Sending notifications for campaign: ${campaign.title}`);
        await notifyCampaignLaunch(campaign.id);
      }
    }

    // Find campaigns that should be automatically ended
    const campaignsToEnd = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
        endAt: {
          lte: now,
        },
      },
    });

    console.log(`Found ${campaignsToEnd.length} campaigns to end`);

    // End campaigns
    for (const campaign of campaignsToEnd) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'ENDED' },
      });
      console.log(`Ended campaign: ${campaign.title}`);
    }

    return NextResponse.json({
      ok: true,
      newlyLive: newlyLiveCampaigns.length,
      ended: campaignsToEnd.length,
    });
  } catch (error) {
    console.error('Error in check-campaigns cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
