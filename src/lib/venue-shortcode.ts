import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

/**
 * Generates a unique 8-character URL-safe short code for a venue.
 *
 * The shortCode is designed to be:
 * - Exactly 8 characters long.
 * - Composed of URL-safe alphanumeric characters.
 * - Unique (highly improbable collision rate).
 *
 * @returns {string} The generated short code.
 */
export function generateVenueShortCode(): string {
  // nanoid(8) generates a URL-safe string of 8 characters.
  // The default alphabet for nanoid is URL-safe: `_~ID`
  // From nanoid documentation: `A-Za-z0-9_-`
  return nanoid(8);
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/**
 * Ensures a venue has a shortCode, generating one if missing.
 *
 * Uses a conditional update to avoid overwriting a code that might have been
 * generated concurrently, and retries on unique constraint collisions.
 */
export async function ensureVenueShortCode(
  prisma: PrismaClient,
  venueId: string,
  { maxAttempts = 5 }: { maxAttempts?: number } = {}
): Promise<string> {
  const existing = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { shortCode: true },
  });

  if (!existing) {
    throw new Error('Venue not found');
  }

  if (existing.shortCode) {
    return existing.shortCode;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateVenueShortCode();

    try {
      const res = await prisma.venue.updateMany({
        where: { id: venueId, shortCode: null },
        data: { shortCode: candidate },
      });

      if (res.count === 1) {
        return candidate;
      }

      const after = await prisma.venue.findUnique({
        where: { id: venueId },
        select: { shortCode: true },
      });

      if (after?.shortCode) {
        return after.shortCode;
      }
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to generate a unique venue shortCode');
}
