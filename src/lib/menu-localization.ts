// src/lib/menu-localization.ts

import { PublicMenuCategory, PublicMenuItem, MenuCategoryData, MenuItemData } from '../types/menu';

/**
 * Returns the localized name of a menu category or item, falling back to English if the requested language is not available.
 * @param item The category or item object.
 * @param locale The desired locale ('en' or 'ru').
 * @returns The localized name.
 */
export function getLocalizedName(
  item: PublicMenuCategory | PublicMenuItem | MenuCategoryData | MenuItemData,
  locale: 'en' | 'ru'
): string {
  if (locale === 'ru' && item.nameRu) {
    return item.nameRu;
  }
  return item.nameEn; // English is the fallback and primary language
}

/**
 * Returns the localized description of a menu item, falling back to English if the requested language is not available.
 * @param item The menu item object.
 * @param locale The desired locale ('en' or 'ru').
 * @returns The localized description or null if neither is available.
 */
export function getLocalizedDescription(
  item: PublicMenuItem | MenuItemData,
  locale: 'en' | 'ru'
): string | null {
  if (locale === 'ru' && item.descriptionRu) {
    return item.descriptionRu;
  }
  return item.descriptionEn || null; // English is the fallback
}

/**
 * Formats calorie count for display (e.g., "~320 kcal").
 * @param calories The approximate calorie count.
 * @returns Formatted string or null if calories are not provided.
 */
export function formatCalories(calories: number | null | undefined): string | null {
  if (calories === null || calories === undefined) {
    return null;
  }
  return `~${calories} kcal`;
}

/**
 * Formats a price value to Indonesian Rupiah (IDR).
 * @param price The price value (in smallest currency unit).
 * @param currency The currency code (default 'IDR').
 * @returns Formatted price string (e.g., "Rp15.000").
 */
export function formatPrice(price: number | null | undefined, currency: string = 'IDR'): string | null {
  if (price === null || price === undefined) {
    return null;
  }
  // Assuming price is already in the smallest unit (e.g., cents for USD, rupiah for IDR)
  // For IDR, it's usually without decimals and large numbers.
  // Using Intl.NumberFormat for proper localization and currency formatting.
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0, // IDR usually doesn't have cents
    maximumFractionDigits: 0,
  }).format(price);
}
