import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validatePasswordMatch, validateStep1 } from './validation';

/**
 * **Feature: tipsio-refactor-v2, Property 1: Валидация совпадения паролей**
 * 
 * *Для любых* двух строк password и confirmPassword, если они не равны,
 * форма регистрации должна показать ошибку и заблокировать переход к следующему шагу.
 * 
 * **Validates: Requirements 2.3**
 */
describe('Property 1: Password validation', () => {
  it('should return true when passwords match', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 6 }),
        (password) => {
          // For any password, matching it with itself should return true
          expect(validatePasswordMatch(password, password)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false when passwords do not match', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 6 }),
        fc.string({ minLength: 1 }),
        (password, suffix) => {
          // For any two different strings, validation should fail
          const differentPassword = password + suffix;
          if (password !== differentPassword) {
            expect(validatePasswordMatch(password, differentPassword)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail step1 validation when passwords do not match', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 6 }),
        fc.string({ minLength: 6 }),
        fc.string({ minLength: 2 }),
        (email, password, confirmPassword, venueName) => {
          // Skip if passwords happen to match
          if (password === confirmPassword) return;

          const result = validateStep1({
            email,
            password,
            confirmPassword,
            venueName,
          });

          // Validation should fail when passwords don't match
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
          expect(result.errors?.some(e => e.includes("match"))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass step1 validation when all fields are valid and passwords match', () => {
    // Generate alphanumeric strings to avoid whitespace-only values
    const alphanumeric = fc.stringMatching(/^[a-zA-Z0-9]+$/);
    // Generate simple valid emails (user@domain.tld format)
    const simpleEmail = fc.tuple(
      alphanumeric.filter(s => s.length >= 1),
      alphanumeric.filter(s => s.length >= 1),
      fc.constantFrom('com', 'org', 'net', 'io')
    ).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);
    
    fc.assert(
      fc.property(
        simpleEmail,
        alphanumeric.filter(s => s.length >= 6),
        alphanumeric.filter(s => s.length >= 2),
        (email, password, venueName) => {
          const result = validateStep1({
            email,
            password,
            confirmPassword: password, // Same password
            venueName,
          });

          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation for passwords shorter than 6 characters', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 2 }),
        (email, shortPassword, venueName) => {
          const result = validateStep1({
            email,
            password: shortPassword,
            confirmPassword: shortPassword,
            venueName,
          });

          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
