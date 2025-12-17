import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';
import { VenueStatus, DistributionMode } from '@prisma/client';

// We will use the Next.js Request/Response objects, but since we are testing logic we can mock the request
// or better, extract logic. However, since we are in an integration test environment with a DB, 
// we can invoke the handler directly if we mock the Request object.

// Importing the handlers (dynamic imports to avoid issues if files change or context)
// But since these are route handlers, they export GET.
import { GET as getVenue } from '@/app/api/v/[shortCode]/route';
import { GET as getMenu } from '@/app/api/menu/[shortCode]/route';

describe('Public Menu API Routes', () => {
  let venueId: string;
  let shortCode: string;

  beforeEach(async () => {
    // Cleanup
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.menuDigitizationJob.deleteMany();
    await prisma.qrCode.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.user.deleteMany();

    // Setup
    const user = await prisma.user.create({
      data: {
        email: `manager-${Math.random()}@example.com`,
        role: 'MANAGER',
      },
    });

    shortCode = `v-${Math.random().toString(36).substring(7)}`;

    const venue = await prisma.venue.create({
      data: {
        name: 'Test Venue',
        type: 'RESTAURANT',
        manager: { connect: { id: user.id } },
        status: VenueStatus.ACTIVE,
        shortCode: shortCode,
        distributionMode: DistributionMode.PERSONAL,
      },
    });
    venueId = venue.id;
  });

  it('GET /api/v/[shortCode] should return venue info', async () => {
    // Create a QR code
    await prisma.qrCode.create({
      data: {
        type: 'VENUE',
        shortCode: 'qr-123',
        venue: { connect: { id: venueId } },
      }
    });

    const req = new Request(`http://localhost/api/v/${shortCode}`);
    const res = await getVenue(req, { params: { shortCode } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.venue.name).toBe('Test Venue');
    expect(data.hasPublishedMenu).toBe(false);
    expect(data.tipQrShortCode).toBe('qr-123');
  });

  it('GET /api/menu/[shortCode] should return published menu', async () => {
    // Create a published menu job
    const job = await prisma.menuDigitizationJob.create({
      data: {
        venueId,
        status: 'COMPLETED',
        isPublished: true,
        publishedAt: new Date(),
        imageUrls: [],
      }
    });

    // Create categories and items
    await prisma.menuCategory.create({
      data: {
        venueId,
        jobId: job.id,
        nameEn: 'Starters',
        order: 1,
        items: {
            create: {
                venueId,
                jobId: job.id,
                originalName: 'Soup',
                nameEn: 'Soup',
                priceValue: 100,
                order: 1
            }
        }
      }
    });

    const req = new Request(`http://localhost/api/menu/${shortCode}`);
    const res = await getMenu(req, { params: { shortCode } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.categories).toHaveLength(1);
    expect(data.categories[0].nameEn).toBe('Starters');
    expect(data.categories[0].items).toHaveLength(1);
    expect(data.categories[0].items[0].nameEn).toBe('Soup');
  });

  it('GET /api/menu/[shortCode] should return 404 if no published menu', async () => {
     const req = new Request(`http://localhost/api/menu/${shortCode}`);
     const res = await getMenu(req, { params: { shortCode } });
     expect(res.status).toBe(404);
  });
});
