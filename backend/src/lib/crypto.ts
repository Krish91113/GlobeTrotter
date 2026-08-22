import crypto from 'crypto';

/**
 * Creates a SHA-256 hash of the input string
 * Used for hashing session tokens and share links
 */
export const sha256 = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Generates a cryptographically secure random token
 * @param bytes - Number of random bytes to generate (default: 32)
 * @returns Hex-encoded random string
 */
export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};