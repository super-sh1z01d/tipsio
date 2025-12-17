import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { publishMenuJob } from './menu-service';

// Mock types
interface Job {
  id: string;
  venueId: string;
  isPublished: boolean;
  publishedAt: Date | null;
}

// Mock Prisma Client
class MockPrisma {
  jobs: Job[];

  constructor(initialJobs: Job[]) {
    this.jobs = initialJobs;
  }

  // Mock $transaction just executes the callback with "this" (the mock client)
  async $transaction<T>(callback: (tx: MockPrisma) => Promise<T>): Promise<T> {
    return callback(this);
  }

  get menuDigitizationJob() {
    return {
      updateMany: async (args: { where: { venueId: string; isPublished?: boolean }, data: { isPublished?: boolean } }) => {
        const { where, data } = args;
        let count = 0;
        this.jobs.forEach(job => {
            // Simple match for venueId and isPublished
            if (job.venueId === where.venueId && 
                (where.isPublished === undefined || job.isPublished === where.isPublished)) {
                
                if (data.isPublished !== undefined) job.isPublished = data.isPublished;
                // update other fields if needed
                count++;
            }
        });
        return { count };
      },
      update: async (args: { where: { id: string }, data: { isPublished?: boolean; publishedAt?: Date } }) => {
        const job = this.jobs.find(j => j.id === args.where.id);
        if (!job) throw new Error('Job not found');
        
        if (args.data.isPublished !== undefined) job.isPublished = args.data.isPublished;
        if (args.data.publishedAt !== undefined) job.publishedAt = args.data.publishedAt;
        
        return { ...job };
      }
    };
  }
}

describe('Property 7: Single Published Menu Invariant', () => {
  it('should ensure at most one menu is published per venue', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // venueId
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }), // jobIds
        fc.array(fc.nat()), // indices of jobs to publish in sequence
        async (venueId, jobIds, publishSequence) => {
          // Setup initial state: create jobs for the venue, all unpublished initially
          const jobs: Job[] = jobIds.map(id => ({
            id,
            venueId,
            isPublished: false,
            publishedAt: null
          }));

          const prismaMock = new MockPrisma(jobs);

          // Execute publish operations
          for (const index of publishSequence) {
            // Pick a job ID from the list (using modulo to be safe)
            const jobIndex = index % jobIds.length;
            const jobId = jobIds[jobIndex];
            
            await publishMenuJob(prismaMock, venueId, jobId);
          }

          // Verify invariant: Count of published jobs for this venue must be <= 1
          const publishedCount = prismaMock.jobs.filter(j => j.venueId === venueId && j.isPublished).length;
          expect(publishedCount).toBeLessThanOrEqual(1);
          
          // Verify that if we did any operations, exactly one is published (unless logic failed silently)
          // Actually, since we start with 0 and only publish, if sequence > 0, we should have exactly 1.
          if (publishSequence.length > 0) {
             expect(publishedCount).toBe(1);
             // The last published one should correspond to the last operation? 
             // Yes, but let's just stick to the invariant <= 1 for safety.
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
