type MenuJobTx = {
  menuDigitizationJob: {
    updateMany: (args: {
      where: { venueId: string; isPublished?: boolean };
      data: { isPublished?: boolean };
    }) => Promise<{ count: number }>;
    update: (args: {
      where: { id: string };
      data: { isPublished?: boolean; publishedAt?: Date };
    }) => Promise<{ publishedAt: Date | null }>;
  };
};

type MenuJobClient = {
  $transaction: <T>(callback: (tx: MenuJobTx) => Promise<T>) => Promise<T>;
};

/**
 * Publishes a specific menu digitization job for a venue.
 * Ensures that only one job is published for the venue at any given time.
 * 
 * @param prisma The Prisma client instance (or transaction client).
 * @param venueId The ID of the venue.
 * @param jobId The ID of the job to publish.
 * @returns The updated job.
 */
export async function publishMenuJob(
  prisma: MenuJobClient,
  venueId: string,
  jobId: string
) {
  // We expect the caller to have validated that the job belongs to the venue and is ready to publish.
  // This function focuses on the atomicity of the publish operation.

  return await prisma.$transaction(async (tx) => {
    // 1. Unpublish any previously published job for this venue
    await tx.menuDigitizationJob.updateMany({
      where: {
        venueId: venueId,
        isPublished: true,
      },
      data: {
        isPublished: false,
      },
    });

    // 2. Set the target job as published
    const updatedJob = await tx.menuDigitizationJob.update({
      where: { id: jobId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return updatedJob;
  });
}
