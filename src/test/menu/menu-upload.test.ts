import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateFileFormat,
  validateFileSize,
  validateFileCount,
} from '../../lib/menu-upload';

describe('Menu File Validation (Property-Based Tests)', () => {
  /**
   * **Feature: smart-menu, Property 2: File Format Validation**
   * For any uploaded file, the system SHALL accept it if and only if its extension
   * is one of: jpg, jpeg, png (case-insensitive).
   *
   * Validates: Requirements 2.2
   */
  it('should correctly validate file format', () => {
    fc.assert(
      fc.property(fc.string(), (extension) => {
        const lowerCaseExt = extension.toLowerCase();
        const mimeTypeMap: { [key: string]: string } = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
        };
        const mimeType = mimeTypeMap[lowerCaseExt] || `image/${lowerCaseExt}`;

        if (['jpg', 'jpeg', 'png'].includes(lowerCaseExt)) {
          expect(validateFileFormat(mimeType)).toBeNull();
        } else {
          expect(validateFileFormat(mimeType)).toBe('Only JPG, JPEG, and PNG files are allowed');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: smart-menu, Property 3: File Size Validation**
   * For any uploaded file, the system SHALL accept it if and only if its size is
   * less than or equal to 5MB (5,242,880 bytes).
   *
   * Validates: Requirements 2.3
   */
  it('should correctly validate file size', () => {
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_FILE_SIZE_BYTES * 2 }), (fileSize) => {
        if (fileSize <= MAX_FILE_SIZE_BYTES) {
          expect(validateFileSize(fileSize)).toBeNull();
        } else {
          expect(validateFileSize(fileSize)).toBe('Each file must be under 5MB');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: smart-menu, Property 4: File Count Validation**
   * For any upload request, the system SHALL accept it if and only if the number of files
   * is between 1 and 10 inclusive.
   *
   * Validates: Requirements 2.4
   */
  it('should correctly validate file count', () => {
    const MIN_FILE_COUNT = 1;
    const MAX_FILE_COUNT = 10;

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 15 }), (fileCount) => {
        if (fileCount >= MIN_FILE_COUNT && fileCount <= MAX_FILE_COUNT) {
          expect(validateFileCount(fileCount)).toBeNull();
        } else if (fileCount < MIN_FILE_COUNT) {
          expect(validateFileCount(fileCount)).toBe('Please upload at least one image');
        } else { // fileCount > MAX_FILE_COUNT
          expect(validateFileCount(fileCount)).toBe('Maximum 10 files allowed');
        }
      }),
      { numRuns: 100 }
    );
  });
});
