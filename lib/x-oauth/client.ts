/**
 * X (Twitter) OAuth 2.0 Client
 * Handles authorization flow and token exchange
 * Ported from employee-x-growth-program
 */

import { encrypt, decrypt } from '@/lib/utils/encryption';
import prisma from '@/lib/db/prisma';

const X_AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const X_USER_URL = 'https://api.twitter.com/2/users/me';

interface XTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface XUserProfile {
  data: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };
}

export class XOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.X_CLIENT_ID || '';
    this.clientSecret = process.env.X_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.NEXTAUTH_URL}/api/x-auth/callback`;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('X OAuth credentials not configured');
    }
  }

  /**
   * Build authorization URL for OAuth flow
   * @param state - State parameter (typically userId)
   * @param codeChallenge - PKCE code challenge
   * @returns Authorization URL
   */
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${X_AUTHORIZE_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from callback
   * @param codeVerifier - PKCE code verifier
   * @returns Token response
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<XTokenResponse> {
    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(X_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Encrypted refresh token from database
   * @returns New token response
   */
  async refreshAccessToken(refreshToken: string): Promise<XTokenResponse> {
    const decryptedRefreshToken = decrypt(refreshToken);
    if (!decryptedRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(X_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  /**
   * Fetch user profile from X API
   * @param accessToken - Access token
   * @returns User profile data
   */
  async getUserProfile(accessToken: string): Promise<XUserProfile> {
    const response = await fetch(
      `${X_USER_URL}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to fetch user profile:', error);
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  /**
   * Get valid access token for user (auto-refreshes if expired)
   * @param userId - User ID
   * @returns Decrypted access token
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xAccessToken: true,
        xRefreshToken: true,
        xTokenExpiry: true,
      },
    });

    if (!user?.xAccessToken || !user.xRefreshToken) {
      throw new Error('User not connected to X');
    }

    // Check if token is still valid (with 5 min buffer)
    const now = new Date();
    const expiryWithBuffer = new Date(
      user.xTokenExpiry!.getTime() - 5 * 60 * 1000
    );

    if (now < expiryWithBuffer) {
      // Token still valid
      return decrypt(user.xAccessToken)!;
    }

    // Token expired, refresh it
    console.log(`Refreshing access token for user ${userId}`);
    const tokens = await this.refreshAccessToken(user.xRefreshToken);

    // Update database with new tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        xAccessToken: encrypt(tokens.access_token),
        xRefreshToken: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : user.xRefreshToken,
        xTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return tokens.access_token;
  }
}

// Singleton instance
export const xOAuthClient = new XOAuthClient();
