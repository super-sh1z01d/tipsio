// src/lib/menu-ai.ts
import { z } from 'zod';
import {
  OpenRouterClient,
  type OpenRouterImageInput,
  OpenRouterRequestError,
  OpenRouterTextError,
  OpenRouterVisionError,
  type OpenRouterVisionResult,
} from './openrouter';

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

export class MenuDigitizationError extends Error {
  public readonly rawOcrResponse: string | null;
  public readonly rawLlmResponse: string | null;

  constructor(
    message: string,
    options?: {
      rawOcrResponse?: string;
      rawLlmResponse?: string;
      cause?: unknown;
    }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'MenuDigitizationError';
    this.rawOcrResponse = options?.rawOcrResponse?.length ? options.rawOcrResponse : null;
    this.rawLlmResponse = options?.rawLlmResponse?.length ? options.rawLlmResponse : null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTextToLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseModelJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    // Fallback: some models may still wrap JSON in code-fences or include leading text.
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = content.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Fallthrough to throw the original error below
      }
    }

    throw new Error(
      `Failed to parse model JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function coerceOcrPages(raw: unknown): Array<{ pageIndex: number; lines: string[] }> {
  const pages: Array<{ pageIndex: number; lines: string[] }> = [];

  const coercePage = (pageRaw: unknown, fallbackIndex: number) => {
    if (typeof pageRaw === 'string') {
      pages.push({ pageIndex: fallbackIndex, lines: normalizeTextToLines(pageRaw) });
      return;
    }

    if (Array.isArray(pageRaw)) {
      pages.push({
        pageIndex: fallbackIndex,
        lines: pageRaw.map((v) => String(v)).map((l) => l.trim()).filter((l) => l.length > 0),
      });
      return;
    }

    if (!isRecord(pageRaw)) return;

    const explicitIndex =
      typeof pageRaw.pageIndex === 'number'
        ? pageRaw.pageIndex
        : typeof pageRaw.index === 'number'
          ? pageRaw.index
          : typeof pageRaw.page === 'number'
            ? pageRaw.page
            : undefined;

    const pageIndex =
      typeof explicitIndex === 'number' && Number.isInteger(explicitIndex) && explicitIndex >= 0
        ? explicitIndex
        : fallbackIndex;

    const linesValue = pageRaw.lines ?? pageRaw.line ?? pageRaw.textLines;
    if (Array.isArray(linesValue)) {
      pages.push({
        pageIndex,
        lines: linesValue.map((v) => String(v)).map((l) => l.trim()).filter((l) => l.length > 0),
      });
      return;
    }

    const textValue =
      typeof pageRaw.text === 'string'
        ? pageRaw.text
        : typeof pageRaw.content === 'string'
          ? pageRaw.content
          : typeof pageRaw.pageText === 'string'
            ? pageRaw.pageText
            : null;

    if (typeof textValue === 'string') {
      pages.push({ pageIndex, lines: normalizeTextToLines(textValue) });
    }
  };

  if (Array.isArray(raw)) {
    // Could be an array of pages, or an array of lines.
    const looksLikePages = raw.some((entry) => isRecord(entry) || Array.isArray(entry));
    if (looksLikePages) {
      raw.forEach((entry, idx) => coercePage(entry, idx));
      return pages;
    }

    pages.push({
      pageIndex: 0,
      lines: raw.map((v) => String(v)).map((l) => l.trim()).filter((l) => l.length > 0),
    });
    return pages;
  }

  if (typeof raw === 'string') {
    pages.push({ pageIndex: 0, lines: normalizeTextToLines(raw) });
    return pages;
  }

  if (!isRecord(raw)) return pages;

  if ('pages' in raw) {
    const rawPages = raw.pages;
    if (Array.isArray(rawPages)) {
      rawPages.forEach((entry, idx) => coercePage(entry, idx));
      return pages;
    }

    if (isRecord(rawPages)) {
      const entries = Object.entries(rawPages);
      entries
        .sort(([a], [b]) => {
          const ai = Number(a);
          const bi = Number(b);
          if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi;
          return a.localeCompare(b);
        })
        .forEach(([key, value], idx) => {
          const numericKey = Number(key);
          const fallbackIndex = Number.isNaN(numericKey) ? idx : numericKey;
          coercePage(value, fallbackIndex);
        });
      return pages;
    }

    if (typeof rawPages === 'string') {
      pages.push({ pageIndex: 0, lines: normalizeTextToLines(rawPages) });
      return pages;
    }
  }

  if (Array.isArray(raw.lines)) {
    pages.push({
      pageIndex: 0,
      lines: raw.lines.map((v) => String(v)).map((l) => l.trim()).filter((l) => l.length > 0),
    });
    return pages;
  }

  if (typeof raw.text === 'string') {
    pages.push({ pageIndex: 0, lines: normalizeTextToLines(raw.text) });
    return pages;
  }

  return pages;
}

export function normalizeOcrResult(raw: unknown): OcrResult {
  const direct = OcrResultSchema.safeParse(raw);
  if (direct.success) return direct.data;

  // Unwrap common wrappers like { result: ... } or { data: ... }.
  const unwrapped: unknown =
    isRecord(raw) && 'result' in raw
      ? raw.result
      : isRecord(raw) && 'data' in raw
        ? raw.data
        : raw;

  const directUnwrapped = OcrResultSchema.safeParse(unwrapped);
  if (directUnwrapped.success) return directUnwrapped.data;

  const pages = coerceOcrPages(unwrapped);
  return OcrResultSchema.parse({ pages });
}

// =========================================================
// Schemas for Text LLM (Structured Menu) Response
// =========================================================

export const MenuItemSchema = z.object({
  originalName: z.string().min(1, "Original name cannot be empty."),
  nameEn: z.string().min(1, "English name cannot be empty."),
  nameRu: z.string().min(1, "Russian name cannot be empty."),
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
  nameRu: z.string().min(1, "Russian category name cannot be empty."),
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
  images: OpenRouterImageInput[],
): Promise<{ structuredMenu: StructuredMenu; rawOcrResponse: string; rawLlmResponse: string }> {
  const openRouterClient = new OpenRouterClient();
  let rawOcrResponse: string = '';
  let rawLlmResponse: string = '';
  let currentStage: 'ocr' | 'llm' = 'ocr';
  const llmTracking = { rawResponse: '' };

  try {
    // Step 1: OCR - Extract text from images
    const { content: ocrContent, rawResponse: rawOcrRaw } =
      await runOcrWithRetry(openRouterClient, images);
    rawOcrResponse = rawOcrRaw;
    const ocrParsed = parseModelJson(ocrContent);
    const ocrResult = normalizeOcrResult(ocrParsed);
    OcrResultSchema.parse(ocrResult); // Validate normalized OCR result

    // Step 2: Structuring - Convert extracted text into structured menu data
    currentStage = 'llm';
    const structuredMenu =
      await runStructuredMenuWithRetry(openRouterClient, ocrResult, llmTracking);
    rawLlmResponse = llmTracking.rawResponse;

    return { structuredMenu, rawOcrResponse, rawLlmResponse };
  } catch (error: unknown) {
    rawLlmResponse = rawLlmResponse || llmTracking.rawResponse;
    console.error('Error during menu digitization pipeline:', error);
    const fallbackOcr =
      error instanceof OpenRouterVisionError
        ? error.rawResponse
        : error instanceof OpenRouterRequestError && currentStage === 'ocr'
          ? error.rawText
          : rawOcrResponse;

    const fallbackLlm =
      error instanceof OpenRouterTextError
        ? error.rawResponse
        : error instanceof OpenRouterRequestError && currentStage === 'llm'
          ? error.rawText
          : rawLlmResponse;

    throw new MenuDigitizationError(
      `Menu digitization failed: ${error instanceof Error ? error.message : String(error)}`,
      {
        rawOcrResponse: fallbackOcr,
        rawLlmResponse: fallbackLlm,
        cause: error,
      }
    );
  }
}

async function runOcrWithRetry(
  openRouterClient: OpenRouterClient,
  images: OpenRouterImageInput[],
): Promise<OpenRouterVisionResult> {
  const MAX_ATTEMPTS = 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await openRouterClient.extractTextFromImages(images);
    } catch (error: unknown) {
      lastError = error;
      const isRetriable =
        error instanceof OpenRouterRequestError
          ? error.status >= 500 || error.status === 429
          : error instanceof OpenRouterVisionError;

      if (isRetriable && attempt < MAX_ATTEMPTS - 1) {
        console.warn(
          `OCR failed (attempt ${attempt + 1}/${MAX_ATTEMPTS}), retrying:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to extract text from images');
}

async function runStructuredMenuWithRetry(
  openRouterClient: OpenRouterClient,
  ocrResult: OcrResult,
  tracking: { rawResponse: string }
): Promise<StructuredMenu> {
  const MAX_ATTEMPTS = 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { content, rawResponse } = await openRouterClient.structureMenuData(ocrResult);
    tracking.rawResponse = rawResponse;
    try {
      const parsed = parseModelJson(content);
      const structuredMenu = StructuredMenuSchema.parse(parsed);
      return structuredMenu;
    } catch (error: unknown) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS - 1) {
        console.warn(
          `Structured menu parse failed (attempt ${attempt + 1}/${MAX_ATTEMPTS}), retrying:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to parse structured menu response');
}
