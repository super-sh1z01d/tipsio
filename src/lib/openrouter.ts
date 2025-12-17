// src/lib/openrouter.ts
import type { OcrResult } from './menu-ai';

interface OpenRouterChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  created: number;
  model: string;
  object: 'chat.completion';
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterVisionResult {
  content: string;
  rawResponse: string;
}

export interface OpenRouterTextResult {
  content: string;
  rawResponse: string;
}

export class OpenRouterVisionError extends Error {
  constructor(message: string, public readonly rawResponse: string) {
    super(message);
    this.name = 'OpenRouterVisionError';
  }
}

export type OpenRouterImageInput =
  | { url: string }
  | {
      mimeType: string;
      data: Buffer;
    };

/**
 * Configuration for the OpenRouter client.
 */
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  visionModel?: string;
  textModel?: string;
}

/**
 * A client for interacting with the OpenRouter API.
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private visionModel: string;
  private textModel: string;

  constructor(config?: Partial<OpenRouterConfig>) {
    this.apiKey = config?.apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables or provided in config.');
    }
    this.baseUrl = config?.baseUrl || 'https://openrouter.ai/api/v1';
    this.timeoutMs = config?.timeoutMs || 90 * 1000; // Default 90 seconds
    this.visionModel =
      config?.visionModel ||
      process.env.OPENROUTER_VISION_MODEL ||
      'qwen/qwen2.5-vl-72b-instruct';
    this.textModel =
      config?.textModel ||
      process.env.OPENROUTER_TEXT_MODEL ||
      this.visionModel;
  }

  /**
   * Makes a request to the OpenRouter API.
   * @param endpoint The API endpoint (e.g., '/chat/completions').
   * @param method The HTTP method (e.g., 'POST').
   * @param body The request body.
   * @returns The parsed JSON response from the API.
   * @throws Error if the request fails or times out.
   */
  public async request<T = OpenRouterChatCompletionResponse>(
    endpoint: string,
    method: string,
    body: object
  ): Promise<{ data: T; rawText: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let requestSize = 0;
    let responseSize = 0;

    try {
      const bodyString = JSON.stringify(body);
      requestSize = Buffer.byteLength(bodyString, 'utf8');
      console.log(`OpenRouter Request: ${method} ${url}, Body Size: ${requestSize} bytes`);

      const response = await fetch(url, {
        method,
        headers,
        body: bodyString,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        responseSize = Buffer.byteLength(errorText, 'utf8');
        console.error(
          `OpenRouter Error: ${method} ${url}, Status: ${response.status}, ` +
          `Response Size: ${responseSize} bytes, Error: ${errorText}`
        );
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      responseSize = Buffer.byteLength(responseText, 'utf8');
      console.log(`OpenRouter Response: ${method} ${url}, Status: ${response.status}, ` +
                  `Response Size: ${responseSize} bytes`);

      return {
        data: JSON.parse(responseText) as T,
        rawText: responseText,
      };
    } catch (error: unknown) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`OpenRouter API request timed out after ${this.timeoutMs / 1000} seconds.`);
      }
      throw new Error(`OpenRouter API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Placeholder for specific model interactions (vision, text)
  // These will be implemented in subsequent tasks.

  /**
   * Calls the OpenRouter vision model to extract text from images.
   * @param images An array of image buffers.
   * @returns Raw JSON string content returned by the model.
   */
  public async extractTextFromImages(images: OpenRouterImageInput[]): Promise<OpenRouterVisionResult> {
    const ocrPrompt = [
      'You are an OCR engine.',
      'Extract ALL visible text from the provided menu image(s).',
      'Return ONLY valid JSON (no markdown, no commentary) in EXACTLY this format:',
      '{',
      '  "pages": [',
      '    { "pageIndex": 0, "lines": ["line 1", "line 2"] },',
      '    { "pageIndex": 1, "lines": ["..."] }',
      '  ]',
      '}',
      '',
      'Rules:',
      '- ALWAYS include the top-level key "pages" as an array.',
      '- The number of objects in "pages" MUST equal the number of input images.',
      '- "pageIndex" MUST be 0-based and match the order of the input images.',
      '- "lines" MUST be an array of strings, each representing a single line of text as it appears.',
      '- Preserve order; do not merge unrelated lines; do not invent items.',
      '- If a page has no readable text, return an empty lines array for that page.',
    ].join('\n');

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: ocrPrompt },
          ...images.map((image) => {
            if ('url' in image) {
              return { type: 'image_url', image_url: { url: image.url } };
            }

            return {
              type: 'image_url',
              image_url: { url: `data:${image.mimeType};base64,${image.data.toString('base64')}` },
            };
          })
        ],
      },
    ];

    const body = {
      model: this.visionModel,
      messages: messages,
      response_format: { type: 'json_object' }, // Requesting JSON output
      temperature: 0, // For deterministic OCR
    };

    const { data: response, rawText } = await this.request<OpenRouterChatCompletionResponse>('/chat/completions', 'POST', body);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error('OpenRouter vision response payload was empty:', rawText);
      throw new OpenRouterVisionError(
        'OpenRouter vision model returned an empty or invalid response.',
        rawText
      );
    }

    const ocrResultContent = response.choices[0].message.content;
    return {
      content: typeof ocrResultContent === 'string' ? ocrResultContent : JSON.stringify(ocrResultContent),
      rawResponse: rawText,
    };
  }

  /**
   * Calls the OpenRouter text LLM to structure extracted OCR text into menu data.
   * @param ocrResult The result from the OCR vision model.
   * @returns Raw JSON string content returned by the model.
   */
  public async structureMenuData(ocrResult: OcrResult): Promise<OpenRouterTextResult> {
    const extractedText = ocrResult.pages.map(page => page.lines.join('\n')).join('\n\n');

    const prompt = `
      You are an expert menu digitizer. Your task is to extract and structure menu categories and items from the provided text.
      The menu might contain dishes, drinks, prices, and descriptions.
      
      For each menu item, provide the following fields:
      - originalName: The exact name of the item as it appears in the text.
      - nameEn: English translation of the item name.
      - nameRu: Russian translation of the item name (ALWAYS provide; if unsure, transliterate into Cyrillic).
      - descriptionEn: English description of the item (if available, otherwise null).
      - descriptionRu: Russian description of the item (if available, otherwise null).
      - priceValue: The numeric price of the item (e.g., 15000 for Rp15.000, null if not found).
      - priceCurrency: The currency, default to "IDR".
      - isSpicy: true if the item is spicy, otherwise false.
      - approxCalories: Approximate calorie count (e.g., 320 for "~320 kcal", null if not found).
      - isLocalSpecial: true if the item is a local specialty, otherwise false.

      Group items under categories. Look for visual cues (headings, price blocks, blank lines) and split the menu into multiple categories whenever possible.
      If the text contains more than one logical section, create a dedicated category per section and give it a descriptive name (e.g., "Drinks", "Appetizers", "Mains", "Desserts").
      If you cannot find clear headings, infer meaningful groups from the dishes (e.g., beverages, sides, protein dishes).
      If a category has no name, use a default like "General" or "Miscellaneous".

      Output rules (strict):
      - Return a SINGLE JSON object matching the interface below.
      - Do NOT omit any keys. If a value is unknown or missing, set it to null (for nullable fields) or a sensible default.
      - nameEn and nameRu MUST be non-empty strings (no null). If you cannot translate nameRu, transliterate into Cyrillic.
      - Use boolean false when unsure for flags.
      - Use "IDR" when currency is missing.
      - priceValue and approxCalories MUST be numbers (or null), not strings.
      
      The output MUST be a JSON object conforming to the following TypeScript interface:
      interface StructuredMenu {
        categories: {
          nameEn: string;
          nameOriginal: string | null; // Original name of the category from the text
          nameRu: string;
          items: {
            originalName: string;
            nameEn: string;
            nameRu: string;
            priceValue: number | null;
            priceCurrency: string;
            descriptionEn: string | null;
            descriptionRu: string | null;
            isSpicy: boolean;
            approxCalories: number | null;
            isLocalSpecial: boolean;
          }[];
        }[];
      }
      
      Here is the extracted text from the menu:
      \`\`\`
      ${extractedText}
      \`\`\`
      
      Please return only the JSON object (no markdown, no commentary).
    `;

    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const body = {
      model: this.textModel,
      messages: messages,
      response_format: { type: 'json_object' }, // Requesting JSON output
      temperature: 0.2, // A bit higher temperature for creativity in translations, but still focused
    };

    const { data: response, rawText } = await this.request<OpenRouterChatCompletionResponse>('/chat/completions', 'POST', body);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error('OpenRouter text response payload was empty:', rawText);
      throw new Error('OpenRouter text LLM returned an empty or invalid response.');
    }

    const structuredMenuContent = response.choices[0].message.content;
    return {
      content: typeof structuredMenuContent === 'string'
        ? structuredMenuContent
        : JSON.stringify(structuredMenuContent),
      rawResponse: rawText,
    };
  }
}
