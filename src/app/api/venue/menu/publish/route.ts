import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { publishMenuJob } from '@/lib/menu-service';

async function getManagerVenueIdOrError() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }), venueId: null };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== 'MANAGER' && role !== 'ADMIN') {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }), venueId: null };
  }

  const venue = await prisma.venue.findFirst({
    where: { managerId: session.user.id },
    select: { id: true },
  });

  if (!venue) {
    return { error: NextResponse.json({ message: 'Venue not found' }, { status: 404 }), venueId: null };
  }

  return { error: null as null, venueId: venue.id };
}

export async function POST() {
  const result = await getManagerVenueIdOrError();
  if (result.error) return result.error;
  const { venueId } = result;

  try {
    // Find the latest job for the venue
    const latestJob = await prisma.menuDigitizationJob.findFirst({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestJob) {
      return NextResponse.json({ message: 'No menu found to publish. Please upload a menu first.' }, { status: 404 });
    }

    // Ensure the latest job is not already published and is completed
    if (latestJob.status !== 'COMPLETED') {
      return NextResponse.json(
        { message: 'Cannot publish an incomplete or failed menu. Please wait for digitization to complete or re-scan.' },
        { status: 400 }
      );
    }
    
    if (latestJob.isPublished) {
        return NextResponse.json({ message: 'Menu is already published' }, { status: 200 });
    }

    const publishedJob = await publishMenuJob(prisma, venueId, latestJob.id);

    return NextResponse.json(
      {
        message: 'Menu published successfully',
        publishedAt: publishedJob.publishedAt,
        jobId: latestJob.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error publishing menu:', error);
    return NextResponse.json(
      { message: 'Failed to publish menu', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
