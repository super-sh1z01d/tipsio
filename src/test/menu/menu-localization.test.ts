import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getLocalizedName,
  getLocalizedDescription,
  formatCalories,
  formatPrice,
} from '../../lib/menu-localization';

import { PublicMenuItem } from '@/types/prisma';

describe('Menu Localization Helper Functions (Property-Based Tests)', () => {
  /**
   * **Feature: smart-menu, Property 8: Localization Fallback Logic**
   * For any menu item displayed to a guest, if the requested language translation
   * (nameRu, descriptionRu) is null or empty, the system SHALL fall back to
   * the English version (nameEn, descriptionEn).
   *
   * Validates: Requirements 7.3
   */
  it('should apply localization fallback logic for name and description', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // nameEn
        fc.option(fc.string({ minLength: 1 })), // nameRu
        fc.string({ minLength: 1 }), // descriptionEn
        fc.option(fc.string({ minLength: 1 })), // descriptionRu
        (nameEn, nameRu, descriptionEn, descriptionRu) => {
          const item: PublicMenuItem = {
            id: 'test-id',
            originalName: 'Original Name',
            nameEn: nameEn,
            nameRu: nameRu || null,
            descriptionEn: descriptionEn,
            descriptionRu: descriptionRu || null,
            priceValue: 100,
            priceCurrency: 'IDR',
            isSpicy: false,
            approxCalories: null,
            isLocalSpecial: false,
            order: 0,
            venueId: 'venue-id',
            jobId: 'job-id',
            categoryId: 'cat-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Test getLocalizedName
          expect(getLocalizedName(item, 'en')).toBe(nameEn);
          if (nameRu) {
            expect(getLocalizedName(item, 'ru')).toBe(nameRu);
          } else {
            expect(getLocalizedName(item, 'ru')).toBe(nameEn);
          }

          // Test getLocalizedDescription
          expect(getLocalizedDescription(item, 'en')).toBe(descriptionEn);
          if (descriptionRu) {
            expect(getLocalizedDescription(item, 'ru')).toBe(descriptionRu);
          } else {
            expect(getLocalizedDescription(item, 'ru')).toBe(descriptionEn);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: smart-menu, Property 9: Calorie Display Formatting**
   * For any menu item with a non-null `approxCalories` value, the system SHALL
   * format it as "~{value} kcal" (e.g., "~320 kcal").
   *
   * Validates: Requirements 7.6
   */
  it('should format calorie display correctly', () => {
    fc.assert(
      fc.property(fc.option(fc.integer({ min: 0, max: 2000 })), (calories) => {
        if (calories !== null && calories !== undefined) {
          expect(formatCalories(calories)).toBe(`~${calories} kcal`);
        } else {
          expect(formatCalories(calories)).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should format price to IDR correctly', () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: 0, max: 1_000_000_000 })), // Price up to 1 billion IDR
        (price) => {
          if (price !== null && price !== undefined) {
            // Using a specific locale for consistent testing of Intl.NumberFormat
            const formatter = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
            expect(formatPrice(price, 'IDR')).toBe(formatter.format(price));
          } else {
            expect(formatPrice(price, 'IDR')).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
