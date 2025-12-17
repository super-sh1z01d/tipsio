import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensureVenueShortCode } from '@/lib/venue-shortcode';

const MenuUpdatePayloadSchema = z.object({
  categories: z.array(
    z.object({
      nameEn: z.string().min(1),
      nameOriginal: z.string().nullable().optional(),
      nameRu: z.string().min(1),
      order: z.number().int().min(0).optional(),
      items: z.array(
        z.object({
          originalName: z.string().min(1),
          nameEn: z.string().min(1),
          nameRu: z.string().min(1),
          descriptionEn: z.string().nullable().optional(),
          descriptionRu: z.string().nullable().optional(),
          priceValue: z.number().int().min(0).nullable().optional(),
          priceCurrency: z.string().optional(),
          isSpicy: z.boolean().optional(),
          approxCalories: z.number().int().min(0).nullable().optional(),
          isLocalSpecial: z.boolean().optional(),
          order: z.number().int().min(0).optional(),
        })
      ),
    })
  ),
});

async function getManagerVenueIdOrThrow() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      venueId: null,
      shortCode: null,
    };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== 'MANAGER' && role !== 'ADMIN') {
    return {
      error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
      venueId: null,
      shortCode: null,
    };
  }

  const venue = await prisma.venue.findFirst({
    where: { managerId: session.user.id },
    select: { id: true, shortCode: true },
  });

  if (!venue) {
    return {
      error: NextResponse.json({ message: 'Venue not found' }, { status: 404 }),
      venueId: null,
      shortCode: null,
    };
  }

  const shortCode =
    venue.shortCode ?? (await ensureVenueShortCode(prisma, venue.id));

  return { error: null as null, venueId: venue.id, shortCode };
}

export async function GET() {
  const result = await getManagerVenueIdOrThrow();
  if (result.error) return result.error;
  const { venueId, shortCode } = result;

  try {
    const latestJob = await prisma.menuDigitizationJob.findFirst({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!latestJob) {
      return NextResponse.json(
        {
          shortCode,
          job: null,
          categories: [],
          stats: {
            categoryCount: 0,
            itemCount: 0,
          },
        },
        { status: 200 }
      );
    }

    const categoryCount = latestJob.categories.length;
    const itemCount = latestJob.categories.reduce((sum, category) => sum + category.items.length, 0);

    return NextResponse.json(
      {
        shortCode,
        job: {
          id: latestJob.id,
          status: latestJob.status,
          isPublished: latestJob.isPublished,
          createdAt: latestJob.createdAt,
          errorMessage: latestJob.errorMessage,
        },
        categories: latestJob.categories,
        stats: {
          categoryCount,
          itemCount,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch menu data', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const result = await getManagerVenueIdOrThrow();
  if (result.error) return result.error;
  const { venueId } = result;

  try {
    const payload = MenuUpdatePayloadSchema.parse(await req.json());

    // Find the latest job for the venue
    const latestJob = await prisma.menuDigitizationJob.findFirst({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestJob) {
      return NextResponse.json({ message: 'No menu to update. Please upload a menu first.' }, { status: 404 });
    }

    if (latestJob.status !== 'COMPLETED') {
      return NextResponse.json(
        { message: 'Menu is not ready to edit yet. Please wait for digitization to complete.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Step 1: Delete existing categories and items associated with the latest job
      // This is a simpler approach for updates; a more sophisticated one might involve
      // diffing and partial updates. Given MVP, full replacement is acceptable.
      await tx.menuItem.deleteMany({ where: { jobId: latestJob.id } });
      await tx.menuCategory.deleteMany({ where: { jobId: latestJob.id } });

      // Step 2: Recreate categories and items from the incoming data
      for (let categoryIndex = 0; categoryIndex < payload.categories.length; categoryIndex++) {
        const categoryData = payload.categories[categoryIndex];
        const newCategory = await tx.menuCategory.create({
          data: {
            venueId: latestJob.venueId,
            jobId: latestJob.id,
            nameEn: categoryData.nameEn,
            nameOriginal: categoryData.nameOriginal || null,
            nameRu: categoryData.nameRu || null,
            order: categoryData.order ?? categoryIndex,
          },
        });

        for (let itemIndex = 0; itemIndex < categoryData.items.length; itemIndex++) {
          const itemData = categoryData.items[itemIndex];
          await tx.menuItem.create({
            data: {
              venueId: latestJob.venueId,
              jobId: latestJob.id,
              categoryId: newCategory.id,
              originalName: itemData.originalName,
              nameEn: itemData.nameEn,
              nameRu: itemData.nameRu || null,
              descriptionEn: itemData.descriptionEn || null,
              descriptionRu: itemData.descriptionRu || null,
              priceValue: itemData.priceValue ?? null,
              priceCurrency: itemData.priceCurrency || 'IDR',
              isSpicy: itemData.isSpicy || false,
              approxCalories: itemData.approxCalories ?? null,
              isLocalSpecial: itemData.isLocalSpecial || false,
              order: itemData.order ?? itemIndex,
            },
          });
        }
      }
    });

    return NextResponse.json({ message: 'Menu updated successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating menu data:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid menu data', issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update menu data', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
