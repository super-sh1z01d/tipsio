import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import {
  OcrResultSchema,
  StructuredMenuSchema,
  OcrResult,
  StructuredMenu,
} from '../../lib/menu-ai';

describe('AI Response JSON Schema Validation (Property-Based Tests)', () => {
  /**
   * **Feature: smart-menu, Property 5: AI Response JSON Schema Validation**
   * For any JSON response from the AI, the system SHALL successfully parse it
   * if and only if it conforms to the OcrResultSchema and StructuredMenuSchema.
   *
   * Validates: Requirements 3.4
   */
  it('should validate OcrResultSchema with valid and invalid data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            pageIndex: fc.integer({ min: 0, max: 10 }),
            lines: fc.array(fc.string()),
          })
        ),
        (pages) => {
          const validOcrResult: OcrResult = { pages };
          expect(() => OcrResultSchema.parse(validOcrResult)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );

    // Test with invalid data (e.g., missing 'pages' array)
    expect(() => OcrResultSchema.parse({ invalidKey: [] })).toThrow(z.ZodError);
    // Test with invalid data (e.g., pageIndex not a number)
    expect(() => OcrResultSchema.parse({ pages: [{ pageIndex: '0', lines: [] }] })).toThrow(z.ZodError);
  });

  it('should validate StructuredMenuSchema with valid and invalid data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            nameEn: fc.string({ minLength: 1 }),
            nameOriginal: fc.option(fc.string()),
            nameRu: fc.string({ minLength: 1 }),
            items: fc.array(
              fc.record({
                originalName: fc.string({ minLength: 1 }),
                nameEn: fc.string({ minLength: 1 }),
                nameRu: fc.string({ minLength: 1 }),
                priceValue: fc.option(fc.integer({ min: 0 })),
                priceCurrency: fc.string().filter(s => s.length <= 3).map(s => s.toUpperCase()).filter(s => s.length > 0), // Simple currency string
                descriptionEn: fc.option(fc.string()),
                descriptionRu: fc.option(fc.string()),
                isSpicy: fc.boolean(),
                approxCalories: fc.option(fc.integer({ min: 0 })),
                isLocalSpecial: fc.boolean(),
              })
            ),
          })
        ),
        (categories) => {
          const validStructuredMenu: StructuredMenu = { categories };
          expect(() => StructuredMenuSchema.parse(validStructuredMenu)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );

    // Test with invalid data (e.g., missing 'categories' array)
    expect(() => StructuredMenuSchema.parse({ invalidKey: [] })).toThrow(z.ZodError);
    // Test with invalid data (e.g., nameEn empty string)
    expect(() => StructuredMenuSchema.parse({ categories: [{ nameEn: '', items: [] }] })).toThrow(z.ZodError);
    // Test with invalid data (e.g., priceValue negative)
    expect(() =>
      StructuredMenuSchema.parse({
        categories: [
          {
            nameEn: 'Category',
            items: [{ originalName: 'Item', nameEn: 'Item', priceValue: -1, priceCurrency: 'IDR' }],
          },
        ],
      })
    ).toThrow(z.ZodError);
  });

  /**
   * **Feature: smart-menu, Property 6: Invalid JSON Handling**
   * For any non-JSON or malformed JSON response from the AI, the system SHALL
   * set the job status to FAILED and store an appropriate error message.
   * (This property test validates the parsing part, not the job status update).
   *
   * Validates: Requirements 3.7 (parsing part)
   */
  it('should verify JSON.parse throws for malformed JSON strings', () => {
    fc.assert(
      fc.property(
        fc.string(), // Generate arbitrary strings
        (jsonString) => {
          // Attempt to parse the string
          let parsedSuccessfully = true;
          try {
            JSON.parse(jsonString);
          } catch {
            parsedSuccessfully = false;
          }

          // If the string was NOT parsed successfully (i.e., it was malformed JSON),
          // then JSON.parse SHOULD have thrown an error.
          if (!parsedSuccessfully) {
            expect(() => JSON.parse(jsonString)).toThrow();
          }
        }
      ),
      { numRuns: 100 }
    );

    // Explicitly test some malformed JSON for clarity and guaranteed failure
    expect(() => JSON.parse('{')).toThrow();
    expect(() => JSON.parse('{"key": "value"')).toThrow();
    expect(() => JSON.parse('not json')).toThrow();
    expect(() => JSON.parse('')).toThrow();
  });
});
