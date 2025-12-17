import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  validateFileFormat,
  validateFileSize,
  validateFileCount,
} from '@/lib/menu-upload';
import { processMenuDigitization } from '@/lib/menu-ai';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promises as fs } from 'fs';

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

export async function POST(req: Request) {
  const result = await getManagerVenueIdOrError();
  if (result.error) return result.error;
  const { venueId } = result;

  // Handle multipart form data
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  // 1. File Validation
  const fileCountError = validateFileCount(files.length);
  if (fileCountError) {
    return NextResponse.json({ message: fileCountError }, { status: 400 });
  }

  const imageUrls: string[] = [];
  const writtenFilePaths: string[] = [];

  // Ensure the upload directory is dynamic and within the public folder
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'menu', venueId);

  let job; // Declare job outside try-catch to be accessible in finally or for later updates

  try {
    // Validate all files before writing anything
    for (const file of files) {
      const fileFormatError = validateFileFormat(file.type);
      if (fileFormatError) {
        return NextResponse.json({ message: fileFormatError }, { status: 400 });
      }

      const fileSizeError = validateFileSize(file.size);
      if (fileSizeError) {
        return NextResponse.json({ message: fileSizeError }, { status: 400 });
      }
    }

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const fileBuffers: Buffer[] = [];

    for (const file of files) {
      const fileExtension =
        path.extname(file.name) ||
        (file.type === 'image/png' ? '.png' : '.jpg');
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);
      const publicPath = `/uploads/menu/${venueId}/${filename}`; // Public URL path

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      writtenFilePaths.push(filePath);
      imageUrls.push(publicPath);
      fileBuffers.push(buffer); // Collect buffers for AI processing
    }

    // 2. Create MenuDigitizationJob
    job = await prisma.menuDigitizationJob.create({
      data: {
        venueId,
        status: 'PROCESSING',
        imageUrls: imageUrls,
      },
    });

    // 3. Call AI Pipeline
    const { structuredMenu, rawOcrResponse, rawLlmResponse } = await processMenuDigitization(fileBuffers);

    // 4. Create MenuCategory and MenuItem records on success
    await prisma.$transaction(async (tx) => {
      // Clean up previously created categories and items if this is a re-scan/retry for the same job.
      // Or, better, associate new items with the new job ID, and previous items with previous jobs.
      // The requirement states: "Create MenuCategory and MenuItem records on success".
      // This implies creating new ones, not updating old ones for a new job.
      // For editing, there's a PATCH /api/venue/menu route.
      // So, here we just create.

      for (let index = 0; index < structuredMenu.categories.length; index++) {
        const categoryData = structuredMenu.categories[index];
        const newCategory = await tx.menuCategory.create({
          data: {
            venueId,
            jobId: job!.id, // Link to the current job
            nameEn: categoryData.nameEn,
            nameOriginal: categoryData.nameOriginal,
            nameRu: categoryData.nameRu,
            order: index,
          },
        });

        for (let itemIndex = 0; itemIndex < categoryData.items.length; itemIndex++) {
          const itemData = categoryData.items[itemIndex];
          await tx.menuItem.create({
            data: {
              venueId,
              jobId: job!.id, // Link to the current job
              categoryId: newCategory.id,
              originalName: itemData.originalName,
              nameEn: itemData.nameEn,
              nameRu: itemData.nameRu,
              descriptionEn: itemData.descriptionEn,
              descriptionRu: itemData.descriptionRu,
              priceValue: itemData.priceValue,
              priceCurrency: itemData.priceCurrency,
              isSpicy: itemData.isSpicy,
              approxCalories: itemData.approxCalories,
              isLocalSpecial: itemData.isLocalSpecial,
              order: itemIndex,
            },
          });
        }
      }
    });

    // Update job status to COMPLETED
    job = await prisma.menuDigitizationJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        rawOcrResponse: rawOcrResponse,
        rawLlmResponse: rawLlmResponse,
      },
    });

    return NextResponse.json(
      {
        message: 'Menu digitized successfully',
        jobId: job.id,
        status: job.status,
        categories: structuredMenu.categories,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Menu upload API error:', error);

    // Update job status to FAILED if it was created
    if (job) {
      await prisma.menuDigitizationJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : String(error) || 'Unknown error during digitization',
        },
      });
    }

    // Clean up uploaded files if an error occurred
    for (const filePathToRemove of writtenFilePaths) {
      try {
        await fs.unlink(filePathToRemove);
      } catch (cleanupError) {
        console.error(`Failed to delete uploaded file: ${filePathToRemove}`, cleanupError);
      }
    }

    return NextResponse.json(
      {
        message: 'Menu digitization failed',
        error: error instanceof Error ? error.message : String(error),
        jobId: job?.id || null,
      },
      { status: 500 }
    );
  }
}
