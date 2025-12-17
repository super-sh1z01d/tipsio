// src/lib/menu-ai.ts
import { z } from 'zod';
import { OpenRouterClient } from './openrouter';

// =========================================================
// Schemas for Vision Model (OCR) Response
// =========================================================

export const OcrLineSchema = z.string();

export const OcrPageSchema = z.object({
  pageIndex: z.number().int().min(0),
  lines: z.array(OcrLineSchema),
});

export const OcrResultSchema = z.object({
  pages: z.array(OcrPageSchema),
});

/**
 * Type definition for the OCR result based on Zod schema.
 */
export type OcrResult = z.infer<typeof OcrResultSchema>;


// =========================================================
// Schemas for Text LLM (Structured Menu) Response
// =========================================================

export const MenuItemSchema = z.object({
  originalName: z.string().min(1, "Original name cannot be empty."),
  nameEn: z.string().min(1, "English name cannot be empty."),
  nameRu: z.string().nullable(),
  priceValue: z.number().int().min(0).nullable(), // Price in smallest currency unit, can be null
  priceCurrency: z.string().default("IDR"),
  descriptionEn: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  isSpicy: z.boolean().default(false),
  approxCalories: z.number().int().min(0).nullable(),
  isLocalSpecial: z.boolean().default(false),
});

export const MenuCategorySchema = z.object({
  nameEn: z.string().min(1, "English category name cannot be empty."),
  nameOriginal: z.string().nullable(),
  nameRu: z.string().nullable(),
  items: z.array(MenuItemSchema),
});

export const StructuredMenuSchema = z.object({
  categories: z.array(MenuCategorySchema),
});

/**
 * Type definition for the structured menu data based on Zod schema.
 */
export type StructuredMenu = z.infer<typeof StructuredMenuSchema>;

/**
 * Main pipeline function to process menu digitization from images.
 * Orchestrates image saving, OCR, structuring, and validation.
 * @param images An array of image buffers.
 * @param prismaClient An instance of PrismaClient.
 * @returns The structured menu data or throws an error.
 */
export async function processMenuDigitization(
  images: Buffer[],
): Promise<{ structuredMenu: StructuredMenu; rawOcrResponse: string; rawLlmResponse: string }> {
  const openRouterClient = new OpenRouterClient();
  let rawOcrResponse: string = '';
  let rawLlmResponse: string = '';

  try {
    // Step 1: OCR - Extract text from images
    const ocrResult = await openRouterClient.extractTextFromImages(images);
    rawOcrResponse = JSON.stringify(ocrResult); // Store raw response
    OcrResultSchema.parse(ocrResult); // Validate OCR result

    // Step 2: Structuring - Convert extracted text into structured menu data
    const structuredMenu = await openRouterClient.structureMenuData(ocrResult);
    rawLlmResponse = JSON.stringify(structuredMenu); // Store raw response
    StructuredMenuSchema.parse(structuredMenu); // Validate structured menu data

    return { structuredMenu, rawOcrResponse, rawLlmResponse };
  } catch (error: unknown) {
    console.error('Error during menu digitization pipeline:', error);
    // Re-throw to be caught by the API route
    throw new Error(`Menu digitization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


