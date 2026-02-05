/**
 * PKCE (Proof Key for Code Exchange) Utilities for OAuth 2.0
 * Required by X (Twitter) OAuth flow
 * Ported from employee-x-growth-program
 */

import crypto from 'crypto';

/**
 * Generate a random code verifier for PKCE
 * @returns Base64URL-encoded random string
 */
export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

/**
 * Generate code challenge from verifier using SHA256
 * @param verifier - Code verifier
 * @returns Base64URL-encoded SHA256 hash
 */
export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );
}

/**
 * Base64URL encode (without padding)
 * @param buffer - Buffer to encode
 * @returns Base64URL string
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate both verifier and challenge
 * @returns Object with verifier and challenge
 */
export function generatePKCEPair() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
  };
}
