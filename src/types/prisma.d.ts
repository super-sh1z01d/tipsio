import { Prisma } from '@prisma/client';

// Type for MenuDigitizationJob with all its relations (categories and items)
export type MenuJobWithRelations = Prisma.MenuDigitizationJobGetPayload<{
  include: {
    categories: {
      include: {
        items: true;
      };
    };
  };
}>;

// Type for Venue with just enough info to determine published menu and tip QR
export type VenueWithPublishedMenuAndQr = Prisma.VenueGetPayload<{
  include: {
    menuJobs: {
      where: { isPublished: true, status: 'COMPLETED' };
      select: { id: true };
    };
    qrCodes: {
      where: { type: 'VENUE', status: 'ACTIVE' };
      select: { shortCode: true };
    };
  };
}>;

// Type for a single Venue with its shortCode
export type VenueWithShortCode = Prisma.VenueGetPayload<{
  select: { shortCode: true };
}>;

// Type for a menu item as returned by the public API
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PublicMenuItem = Prisma.MenuItemGetPayload<{}>; // Basic payload, adjust if more fields needed

// Type for a menu category as returned by the public API
export type PublicMenuCategory = Prisma.MenuCategoryGetPayload<{
  include: {
    items: true; // Include items within categories
  };
}>;
