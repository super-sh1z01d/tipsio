import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { MenuJobWithRelations } from '@/types/prisma';
import { ensureVenueShortCode } from '@/lib/venue-shortcode';

export async function GET(
  req: Request,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;

  if (!shortCode) {
    return NextResponse.json({ message: 'Short code is required' }, { status: 400 });
  }

  try {
    const venue = await prisma.venue.findFirst({
      where: {
        OR: [{ shortCode }, { id: shortCode }],
      },
      include: {
        qrCodes: {
          where: { type: 'VENUE', status: 'ACTIVE' },
          select: { shortCode: true },
        },
        menuJobs: {
          where: { isPublished: true, status: 'COMPLETED' },
          take: 1,
          orderBy: { publishedAt: 'desc' },
          include: {
            categories: {
              orderBy: { order: 'asc' },
              include: {
                items: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json({ message: 'Venue not found' }, { status: 404 });
    }

    // Migration support: existing venues might not have a shortCode yet.
    if (!venue.shortCode) {
      await ensureVenueShortCode(prisma, venue.id);
    }

    const publishedJob = venue.menuJobs[0] as MenuJobWithRelations | undefined; // Cast to the new type

    if (!publishedJob) {
      return NextResponse.json({ message: 'No published menu found' }, { status: 404 });
    }

    const tipQrShortCode = venue.qrCodes[0]?.shortCode || null;

    return NextResponse.json({
      venue: {
        id: venue.id,
        name: venue.name,
        logoUrl: venue.logoUrl,
        type: venue.type,
      },
      categories: publishedJob.categories,
      publishedAt: publishedJob.publishedAt,
      tipQrShortCode,
    });
  } catch (error: unknown) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
