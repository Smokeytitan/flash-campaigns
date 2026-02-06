/**
 * AES-256-GCM Encryption Utilities
 * Used for encrypting sensitive tokens (X OAuth tokens) before storing in database
 * Ported from employee-x-growth-program
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY?.trim();
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Ensure key is correct length
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters), got ${keyBuffer.length} bytes`);
  }

  return keyBuffer;
}

/**
 * Encrypt a string value
 * @param text - Plaintext string to encrypt
 * @returns Encrypted string in format: {iv}:{ciphertext}:{authTag} (hex encoded)
 */
export function encrypt(text: string | null): string | null {
  if (!text) return null;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:encrypted:authTag (all hex encoded)
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - Encrypted string in format: {iv}:{ciphertext}:{authTag}
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedText: string | null): string | null {
  if (!encryptedText) return null;

  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a new encryption key (for setup)
 * @returns 32-byte key as hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Check if a value appears to be encrypted
 * @param value - Value to check
 * @returns true if value looks like encrypted format
 */
export function isEncrypted(value: string | null): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && /^[0-9a-f]+$/.test(parts[0]);
}
