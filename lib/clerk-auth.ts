/**
 * Clerk Auth Helpers
 * Helper functions for authentication in API routes
 */

import { auth as clerkAuth } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  const { userId } = await clerkAuth();
  return userId;
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    return null;
  }
  return userId;
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await clerkAuth();
  if (!userId || sessionClaims?.metadata?.role !== 'ADMIN') {
    return null;
  }
  return userId;
}
