/**
 * Clerk Webhook Handler
 * Syncs user data between Clerk and database
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import prisma from '@/lib/db/prisma';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const userData = evt.data;

  try {
    switch (eventType) {
      case 'user.created':
        // Create user in database
        await prisma.user.create({
          data: {
            id: userData.id,
            email: userData.email_addresses[0]?.email_address,
            name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
            image: userData.image_url,
            emailVerified: userData.email_addresses[0]?.verification?.status === 'verified'
              ? new Date()
              : null,
            role: userData.public_metadata?.role || 'USER',
          },
        });
        console.log(`User created in database: ${userData.id}`);
        break;

      case 'user.updated':
        // Update user in database
        await prisma.user.update({
          where: { id: userData.id },
          data: {
            email: userData.email_addresses[0]?.email_address,
            name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
            image: userData.image_url,
            emailVerified: userData.email_addresses[0]?.verification?.status === 'verified'
              ? new Date()
              : null,
            role: userData.public_metadata?.role || 'USER',
          },
        });
        console.log(`User updated in database: ${userData.id}`);
        break;

      case 'user.deleted':
        // Delete user from database (or soft delete)
        await prisma.user.delete({
          where: { id: userData.id },
        });
        console.log(`User deleted from database: ${userData.id}`);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
