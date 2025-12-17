import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  shouldShowQrCodes,
  shouldShowAddStaffNotification,
  shouldShowDownloadMaterials,
  getPrimaryQrType,
  QrDisplayConfig
} from './qr-display';

/**
 * **Feature: tipsio-refactor-v2, Property 7: Отображение QR при наличии сотрудников**
 * 
 * *Для любого* заведения с distributionMode = PERSONAL и количеством активных сотрудников > 0,
 * страница QR должна отображать QR-код и материалы для скачивания.
 * 
 * **Validates: Requirements 4.3**
 */
describe('Property 7: QR display for PERSONAL mode with staff', () => {

  it('should show QR codes for PERSONAL mode when staff exists', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (staffCount) => {
          const config: QrDisplayConfig = {
            distributionMode: 'PERSONAL',
            activeStaffCount: staffCount,
            hasVenueQr: false,
            hasStaffQrs: true,
          };
          
          expect(shouldShowQrCodes(config)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show download materials for PERSONAL mode when staff exists', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (staffCount) => {
          const config: QrDisplayConfig = {
            distributionMode: 'PERSONAL',
            activeStaffCount: staffCount,
            hasVenueQr: false,
            hasStaffQrs: true,
          };
          
          expect(shouldShowDownloadMaterials(config)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT show QR codes for PERSONAL mode when no staff', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (hasVenueQr, hasStaffQrs) => {
          const config: QrDisplayConfig = {
            distributionMode: 'PERSONAL',
            activeStaffCount: 0,
            hasVenueQr,
            hasStaffQrs,
          };
          
          expect(shouldShowQrCodes(config)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show add staff notification for PERSONAL mode without staff', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (hasVenueQr, hasStaffQrs) => {
          const config: QrDisplayConfig = {
            distributionMode: 'PERSONAL',
            activeStaffCount: 0,
            hasVenueQr,
            hasStaffQrs,
          };
          
          expect(shouldShowAddStaffNotification(config)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT show add staff notification for PERSONAL mode with staff', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.boolean(),
        fc.boolean(),
        (staffCount, hasVenueQr, hasStaffQrs) => {
          const config: QrDisplayConfig = {
            distributionMode: 'PERSONAL',
            activeStaffCount: staffCount,
            hasVenueQr,
            hasStaffQrs,
          };
          
          expect(shouldShowAddStaffNotification(config)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT show add staff notification for POOLED mode', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 50 }),
        fc.boolean(),
        fc.boolean(),
        (staffCount, hasVenueQr, hasStaffQrs) => {
          const config: QrDisplayConfig = {
            distributionMode: 'POOLED',
            activeStaffCount: staffCount,
            hasVenueQr,
            hasStaffQrs,
          };
          
          expect(shouldShowAddStaffNotification(config)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show QR codes for POOLED mode when venue QR exists', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 50 }),
        fc.boolean(),
        (staffCount, hasStaffQrs) => {
          const config: QrDisplayConfig = {
            distributionMode: 'POOLED',
            activeStaffCount: staffCount,
            hasVenueQr: true,
            hasStaffQrs,
          };
          
          expect(shouldShowQrCodes(config)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct primary QR type based on distribution mode', () => {
    expect(getPrimaryQrType('POOLED')).toBe('VENUE');
    expect(getPrimaryQrType('PERSONAL')).toBe('PERSONAL');
  });
});
