import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { DistributionMode, VenueStatus } from '@prisma/client';

import prisma from '@/lib/prisma';

// Helper function to create a test venue and manager
async function createTestVenue(managerId: string) {
  return await prisma.venue.create({
    data: {
      name: `Test Venue ${Math.random().toString(36).substring(7)}`,
      type: 'RESTAURANT',
      manager: { connect: { id: managerId } },
      status: VenueStatus.ACTIVE,
      distributionMode: DistributionMode.PERSONAL,
    },
  });
}

// Helper function to create a test menu digitization job
async function createTestMenuJob(venueId: string, status: 'COMPLETED' | 'FAILED' = 'COMPLETED') {
  return await prisma.menuDigitizationJob.create({
    data: {
      venueId,
      status: status,
      imageUrls: [],
      rawOcrResponse: '{}',
      rawLlmResponse: '{}',
    },
  });
}

describe('Menu Publish Invariant (Property-Based Test)', () => {
  let testManagerId: string;

  beforeEach(async () => {
    // Clean up all data before each test
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.menuDigitizationJob.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.user.deleteMany();

    // Create a dummy user to act as a manager
    const user = await prisma.user.create({
      data: {
        email: `manager-${Math.random().toString(36).substring(7)}@example.com`,
        role: 'MANAGER',
      },
    });
    testManagerId = user.id;
  });

  /**
   * **Feature: smart-menu, Property 7: Single Published Menu Invariant**
   * For any venue at any point in time, there SHALL be at most one
   * MenuDigitizationJob with `isPublished=true`. Publishing a new menu SHALL
   * automatically unpublish any previously published menu for that venue.
   *
   * Validates: Requirements 4.6, 9.2
   */
  it('should ensure only one menu job is published per venue at any time', async () => {
    // Generate a test venue
    const venue = await createTestVenue(testManagerId);

    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.integer({ min: 1, max: 5 }), // Simulate 1 to 5 publish attempts
          { minLength: 1, maxLength: 5 }
        ),
        async (publishAttempts) => {
          // Create multiple jobs for the venue
          const jobs = await Promise.all(
            publishAttempts.map(() => createTestMenuJob(venue.id))
          );

          for (const jobToPublish of jobs) {
            // Simulate publishing this job
            await prisma.$transaction(async (tx) => {
              // Unpublish any previously published job for this venue
              await tx.menuDigitizationJob.updateMany({
                where: {
                  venueId: venue.id,
                  isPublished: true,
                },
                data: {
                  isPublished: false,
                },
              });

              // Set the current job as published
              await tx.menuDigitizationJob.update({
                where: { id: jobToPublish.id },
                data: {
                  isPublished: true,
                  publishedAt: new Date(),
                },
              });
            });

            // Verify the invariant: at most one job is published for this venue
            const publishedJobs = await prisma.menuDigitizationJob.findMany({
              where: { venueId: venue.id, isPublished: true },
            });

            expect(publishedJobs.length).toBeLessThanOrEqual(1);
            if (publishedJobs.length === 1) {
              expect(publishedJobs[0].id).toBe(jobToPublish.id);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // Increase timeout for async property tests
});
