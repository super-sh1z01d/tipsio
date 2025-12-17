import { describe, it, expect } from 'vitest';
import { generateVenueShortCode } from '../../lib/venue-shortcode';
import * as fc from 'fast-check';

describe('Venue ShortCode Generation (Property-Based Tests)', () => {
  /**
   * **Feature: smart-menu, Property 1: ShortCode Format and Uniqueness**
   * For any generated venue shortCode, it SHALL be exactly 8 characters long,
   * contain only URL-safe alphanumeric characters (a-z, A-Z, 0-9, _, -),
   * and be unique across all venues in the system.
   *
   * Validates: Requirements 1.1, 1.2
   */
  it('should generate an 8-character, URL-safe, and unique shortCode', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (numGenerations) => {
        const generatedCodes = new Set<string>();
        for (let i = 0; i < numGenerations; i++) {
          const shortCode = generateVenueShortCode();

          // Check length
          expect(shortCode).toHaveLength(8);

          // Check URL-safe characters (alphanumeric, _, -)
          expect(shortCode).toMatch(/^[A-Za-z0-9_-]{8}$/);

          // Check uniqueness
          expect(generatedCodes.has(shortCode)).toBe(false);
          generatedCodes.add(shortCode);
        }
      }),
      { numRuns: 100 } // Run 100 different scenarios for numGenerations
    );
  });
});
