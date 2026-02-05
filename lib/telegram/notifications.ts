/**
 * Telegram Notifications Service
 * Handles sending notifications to users via Telegram
 */

import prisma from '@/lib/db/prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://polygon-flash-campaigns.vercel.app';

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      }
    );

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export async function notifyCampaignLaunch(campaignId: string): Promise<void> {
  try {
    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      console.error('Campaign not found:', campaignId);
      return;
    }

    // Get all users with Telegram enabled
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
        notifyOptIn: true,
      },
    });

    console.log(`Sending campaign launch notification to ${users.length} users`);

    // Send notification to each user
    const results = await Promise.allSettled(
      users.map(async (user) => {
        if (!user.telegramChatId) return;

        const message = `🚀 *New Flash Campaign Launched!*\n\n` +
          `*${campaign.title}*\n\n` +
          `${campaign.brief.substring(0, 150)}${campaign.brief.length > 150 ? '...' : ''}\n\n` +
          `💰 Prize Pool: ${campaign.prizePoolCurrency} ${Number(campaign.prizePoolAmount).toLocaleString()}\n` +
          `🏆 Winners: ${campaign.winnersCount}\n\n` +
          `[View Campaign & Submit →](${APP_URL}/campaigns/${campaign.id})`;

        const success = await sendTelegramMessage(user.telegramChatId, message);

        // Log notification
        await prisma.notificationLog.create({
          data: {
            campaignId,
            userId: user.id,
            channel: 'TELEGRAM',
            status: success ? 'SENT' : 'FAILED',
            message,
            error: success ? null : 'Failed to send',
          },
        });

        return { userId: user.id, success };
      })
    );

    // Log results
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value
    ).length;
    console.log(
      `Campaign launch notification sent: ${successful}/${users.length} successful`
    );
  } catch (error) {
    console.error('Error notifying campaign launch:', error);
  }
}

export async function notifyWinner(
  winnerId: string
): Promise<void> {
  try {
    const winner = await prisma.winner.findUnique({
      where: { id: winnerId },
      include: {
        user: true,
        campaign: true,
      },
    });

    if (!winner || !winner.user.telegramChatId) {
      return;
    }

    const message = `🎉 *Congratulations! You're a Winner!*\n\n` +
      `You've won in: *${winner.campaign.title}*\n\n` +
      `🏆 Rank: #${winner.rank}\n` +
      `${winner.prizeAmount ? `💰 Prize: ${winner.campaign.prizePoolCurrency} ${Number(winner.prizeAmount).toLocaleString()}\n` : ''}` +
      `\nWe'll be in touch soon with details about claiming your prize!`;

    const success = await sendTelegramMessage(
      winner.user.telegramChatId,
      message
    );

    // Log notification
    await prisma.notificationLog.create({
      data: {
        campaignId: winner.campaignId,
        userId: winner.userId,
        channel: 'TELEGRAM',
        status: success ? 'SENT' : 'FAILED',
        message,
        error: success ? null : 'Failed to send',
      },
    });
  } catch (error) {
    console.error('Error notifying winner:', error);
  }
}
