import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { VenueWithPublishedMenuAndQr } from '@/types/prisma';
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
        menuJobs: {
          where: { isPublished: true, status: 'COMPLETED' },
          select: { id: true }
        },
        qrCodes: {
          where: { type: 'VENUE', status: 'ACTIVE' },
          select: { shortCode: true }
        }
      }
    }) as VenueWithPublishedMenuAndQr | null;

    if (!venue) {
      return NextResponse.json({ message: 'Venue not found' }, { status: 404 });
    }

    // Migration support: existing venues might not have a shortCode yet.
    if (!venue.shortCode) {
      await ensureVenueShortCode(prisma, venue.id);
    }

    const hasPublishedMenu = venue.menuJobs.length > 0;
    // Get the first active venue QR code, or null if none
    const tipQrShortCode = venue.qrCodes[0]?.shortCode || null;

    return NextResponse.json({
      venue: {
        id: venue.id,
        name: venue.name,
        logoUrl: venue.logoUrl,
        type: venue.type,
      },
      hasPublishedMenu,
      tipQrShortCode
    });
  } catch (error: unknown) {
    console.error('Error fetching venue public info:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
