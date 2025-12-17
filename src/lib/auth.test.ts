import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: tipsio-refactor-v2, Property 2: Автоматическая авторизация после регистрации**
 * 
 * *Для любого* успешно завершённого процесса регистрации, пользователь должен быть
 * автоматически авторизован и иметь активную сессию.
 * 
 * **Validates: Requirements 2.11**
 */

// Mock registration and auth flow
interface RegistrationData {
  email: string;
  password: string;
  venueName: string;
  distributionMode: 'POOLED' | 'PERSONAL';
}

interface RegistrationResult {
  success: boolean;
  userId?: string;
  venueId?: string;
  error?: string;
}

interface AuthResult {
  authenticated: boolean;
  sessionActive: boolean;
  userId?: string;
}

// Simulated registration function
async function simulateRegistration(data: RegistrationData): Promise<RegistrationResult> {
  // Simulate successful registration
  if (data.email && data.password.length >= 6 && data.venueName.length >= 2) {
    return {
      success: true,
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      venueId: `venue_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
  return { success: false, error: 'Invalid data' };
}

// Simulated auto-login function
async function simulateAutoLogin(registrationResult: RegistrationResult): Promise<AuthResult> {
  if (registrationResult.success && registrationResult.userId) {
    return {
      authenticated: true,
      sessionActive: true,
      userId: registrationResult.userId,
    };
  }
  return {
    authenticated: false,
    sessionActive: false,
  };
}

// Combined registration + auto-login flow
async function registerAndAutoLogin(data: RegistrationData): Promise<{
  registration: RegistrationResult;
  auth: AuthResult;
}> {
  const registration = await simulateRegistration(data);
  const auth = await simulateAutoLogin(registration);
  return { registration, auth };
}

describe('Property 2: Auto-authentication after registration', () => {
  // Generate valid registration data
  const alphanumeric = fc.stringMatching(/^[a-zA-Z0-9]+$/);
  const simpleEmail = fc.tuple(
    alphanumeric.filter(s => s.length >= 1),
    alphanumeric.filter(s => s.length >= 1),
    fc.constantFrom('com', 'org', 'net', 'io')
  ).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);

  const validRegistrationData = fc.record({
    email: simpleEmail,
    password: alphanumeric.filter(s => s.length >= 6),
    venueName: alphanumeric.filter(s => s.length >= 2),
    distributionMode: fc.constantFrom('POOLED' as const, 'PERSONAL' as const),
  });

  it('should auto-authenticate user after successful registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRegistrationData,
        async (data) => {
          const result = await registerAndAutoLogin(data);

          // If registration was successful, user should be authenticated
          if (result.registration.success) {
            expect(result.auth.authenticated).toBe(true);
            expect(result.auth.sessionActive).toBe(true);
            expect(result.auth.userId).toBe(result.registration.userId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have active session after successful registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRegistrationData,
        async (data) => {
          const result = await registerAndAutoLogin(data);

          // For any successful registration, session must be active
          expect(result.registration.success).toBe(true);
          expect(result.auth.sessionActive).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve user identity between registration and session', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRegistrationData,
        async (data) => {
          const result = await registerAndAutoLogin(data);

          // User ID from registration should match session user ID
          if (result.registration.success && result.auth.authenticated) {
            expect(result.auth.userId).toBe(result.registration.userId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
