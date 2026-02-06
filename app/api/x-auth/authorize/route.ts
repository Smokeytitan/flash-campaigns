/**
 * X OAuth Authorization Endpoint
 * Initiates OAuth flow with PKCE
 * Ported from employee-x-growth-program
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/clerk-auth';
import { xOAuthClient } from '@/lib/x-oauth/client';
import { generatePKCEPair } from '@/lib/x-oauth/pkce';

export async function GET(request: NextRequest) {
  try {
    // Require authenticated session
    const userId = await requireAuth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate PKCE pair
    const { codeVerifier, codeChallenge } = generatePKCEPair();

    // Build authorization URL
    const authUrl = xOAuthClient.getAuthorizationUrl(
      userId, // Pass user ID as state
      codeChallenge
    );

    // Store code verifier in httpOnly cookie (10 min expiry)
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('x_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('X Auth authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
