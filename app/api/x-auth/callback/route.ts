/**
 * X OAuth Callback Endpoint
 * Handles OAuth redirect, exchanges code for tokens
 * Ported from employee-x-growth-program
 */

import { NextRequest, NextResponse } from 'next/server';
import { xOAuthClient } from '@/lib/x-oauth/client';
import { encrypt } from '@/lib/utils/encryption';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('X OAuth error:', error);
      return NextResponse.redirect(
        new URL('/profile?error=oauth_denied', request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/profile?error=invalid_callback', request.url)
      );
    }

    // Retrieve code verifier from cookie
    const codeVerifier = request.cookies.get('x_code_verifier')?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/profile?error=missing_verifier', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await xOAuthClient.exchangeCodeForToken(code, codeVerifier);

    // Fetch user profile from X
    const profile = await xOAuthClient.getUserProfile(tokens.access_token);

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    // Upsert user record with X credentials (handles case where user record
    // may not exist yet if Clerk webhook hasn't fired)
    const xData = {
      xUserId: profile.data.id,
      xHandle: profile.data.username,
      xName: profile.data.name,
      xAvatarUrl: profile.data.profile_image_url,
      xAccessToken: encryptedAccessToken,
      xRefreshToken: encryptedRefreshToken,
      xTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
    };

    await prisma.user.upsert({
      where: { id: state },
      update: xData,
      create: {
        id: state,
        ...xData,
      },
    });

    // Clear code verifier cookie
    const response = NextResponse.redirect(
      new URL('/profile?success=x_connected', request.url)
    );
    response.cookies.delete('x_code_verifier');

    return response;
  } catch (error: any) {
    console.error('X Auth callback error:', error?.message || error);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.redirect(
      new URL('/profile?error=connection_failed', request.url)
    );
  }
}
