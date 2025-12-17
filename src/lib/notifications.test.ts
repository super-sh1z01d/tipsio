import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  shouldShowNoStaffAlert, 
  getNotificationConfig,
  DistributionMode 
} from './notifications';

/**
 * **Feature: tipsio-refactor-v2, Property 6: Уведомления при отсутствии сотрудников**
 * 
 * *Для любого* заведения с distributionMode = PERSONAL и количеством активных сотрудников = 0,
 * должно отображаться уведомление о необходимости добавить сотрудников на дашборде и странице QR.
 * 
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Property 6: No staff notifications', () => {
  const staffCountArb = fc.nat({ max: 100 });

  it('should show no staff alert for PERSONAL mode with 0 staff', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        fc.constant(0),
        (mode, staffCount) => {
          expect(shouldShowNoStaffAlert(mode, staffCount)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not show no staff alert for PERSONAL mode with staff > 0', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        fc.integer({ min: 1, max: 100 }),
        (mode, staffCount) => {
          expect(shouldShowNoStaffAlert(mode, staffCount)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never show no staff alert for POOLED mode regardless of staff count', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        staffCountArb,
        (mode, staffCount) => {
          expect(shouldShowNoStaffAlert(mode, staffCount)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show alert on both dashboard and QR page when conditions are met', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        fc.constant(0),
        (mode, staffCount) => {
          const config = getNotificationConfig(mode, staffCount);
          
          expect(config.showNoStaffAlert).toBe(true);
          expect(config.showAddStaffOnQrPage).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should hide alerts when staff exists in PERSONAL mode', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        fc.integer({ min: 1, max: 100 }),
        (mode, staffCount) => {
          const config = getNotificationConfig(mode, staffCount);
          
          expect(config.showNoStaffAlert).toBe(false);
          expect(config.showAddStaffOnQrPage).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should hide alerts for POOLED mode regardless of staff count', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        staffCountArb,
        (mode, staffCount) => {
          const config = getNotificationConfig(mode, staffCount);
          
          expect(config.showNoStaffAlert).toBe(false);
          expect(config.showAddStaffOnQrPage).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
