/**
 * Telegram Webhook Endpoint
 * Receives updates from Telegram bot and handles account linking
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import crypto from 'crypto';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendTelegramMessage(chatId: number, text: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function handleLinkingCode(
  code: string,
  chatId: number,
  username?: string
) {
  // Find user with this linking code
  const user = await prisma.user.findFirst({
    where: {
      telegramLinkingCode: code,
      telegramCodeExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    await sendTelegramMessage(
      chatId,
      '❌ Invalid or expired code. Please generate a new code from your profile.'
    );
    return;
  }

  // Link the Telegram account
  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: chatId.toString(),
      telegramUsername: username || null,
      telegramLinkingCode: null,
      telegramCodeExpiry: null,
    },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Account linked successfully!\n\nYou'll now receive notifications when new Flash Campaigns launch.`
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();

    if (!expectedSecret || webhookSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();

    // Handle message
    if (update.message && update.message.text) {
      const message = update.message;
      const text = message.text?.trim() || '';
      const chatId = message.chat.id;
      const username = message.from?.username;

      // Handle /start command with code
      if (text.startsWith('/start ')) {
        const code = text.substring(7).trim().toUpperCase();
        await handleLinkingCode(code, chatId, username);
      }
      // Handle /start without code
      else if (text === '/start') {
        await sendTelegramMessage(
          chatId,
          `👋 Welcome to Flash Campaigns!\n\nTo link your account:\n1. Visit polygon-flash-campaigns.vercel.app\n2. Go to your Profile\n3. Click "Link Telegram"\n4. Send the code here`
        );
      }
      // Handle raw code (6-character alphanumeric)
      else if (/^[A-Z0-9]{6}$/.test(text)) {
        await handleLinkingCode(text, chatId, username);
      }
      // Unknown command
      else {
        await sendTelegramMessage(
          chatId,
          `I didn't understand that. Send me your 6-character linking code from your profile, or use /start to get started.`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
