// src/lib/openrouter.ts
import { OcrResult, StructuredMenu } from './menu-ai';

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
      'google/gemini-2.0-flash-001';
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
  ): Promise<T> {
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

      return JSON.parse(responseText) as T;
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
   * @returns An OcrResult object with extracted text.
   */
  public async extractTextFromImages(images: Buffer[]): Promise<OcrResult> {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this menu image. Return the text content for each page/image in a structured JSON format, where each page has an array of lines of text. Do not include any other text or explanation, only the JSON.' },
          ...images.map(imageBuffer => ({
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` },
          }))
        ],
      },
    ];

    const body = {
      model: this.visionModel,
      messages: messages,
      response_format: { type: 'json_object' }, // Requesting JSON output
      temperature: 0, // For deterministic OCR
    };

    const response = await this.request<OpenRouterChatCompletionResponse>('/chat/completions', 'POST', body);

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('OpenRouter vision model returned an empty or invalid response.');
    }

    const ocrResultContent = response.choices[0].message.content;
    try {
      const parsedContent = JSON.parse(ocrResultContent);
      // Expected structure: { pages: [{ pageIndex: 0, lines: ["line1", "line2"] }] }
      // The model might return a slightly different structure, adapt parsing if needed.
      // For now, assume it returns something like { "text": "..." } or similar
      // We need to refine this based on actual model output.
      // For now, let's assume it returns a direct JSON of what we asked.
      return parsedContent as OcrResult; // Cast directly, will validate later with Zod
    } catch (parseError) {
      throw new Error(`Failed to parse OCR result JSON: ${parseError}`);
    }
  }

  /**
   * Calls the OpenRouter text LLM to structure extracted OCR text into menu data.
   * @param ocrResult The result from the OCR vision model.
   * @returns A StructuredMenu object.
   */
  public async structureMenuData(ocrResult: OcrResult): Promise<StructuredMenu> {
    const extractedText = ocrResult.pages.map(page => page.lines.join('\n')).join('\n\n');

    const prompt = `
      You are an expert menu digitizer. Your task is to extract and structure menu categories and items from the provided text.
      The menu might contain dishes, drinks, prices, and descriptions.
      
      For each menu item, provide the following fields:
      - originalName: The exact name of the item as it appears in the text.
      - nameEn: English translation of the item name.
      - nameRu: Russian translation of the item name (if possible, otherwise null).
      - descriptionEn: English description of the item (if available, otherwise null).
      - descriptionRu: Russian description of the item (if available, otherwise null).
      - priceValue: The numeric price of the item (e.g., 15000 for Rp15.000, null if not found).
      - priceCurrency: The currency, default to "IDR".
      - isSpicy: true if the item is spicy, otherwise false.
      - approxCalories: Approximate calorie count (e.g., 320 for "~320 kcal", null if not found).
      - isLocalSpecial: true if the item is a local specialty, otherwise false.

      Group items under categories. If categories are not explicitly mentioned, try to infer them or group similar items.
      If a category has no name, use a default like "General" or "Miscellaneous".
      
      The output MUST be a JSON object conforming to the following TypeScript interface:
      interface StructuredMenu {
        categories: {
          nameEn: string;
          nameOriginal: string | null; // Original name of the category from the text
          nameRu: string | null;
          items: {
            originalName: string;
            nameEn: string;
            nameRu: string | null;
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
      
      Please return only the JSON object.
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

    const response = await this.request<OpenRouterChatCompletionResponse>('/chat/completions', 'POST', body);

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('OpenRouter text LLM returned an empty or invalid response.');
    }

    const structuredMenuContent = response.choices[0].message.content;
    try {
      const parsedContent = JSON.parse(structuredMenuContent);
      return parsedContent as StructuredMenu; // Cast directly, will validate later with Zod
    } catch (parseError) {
      throw new Error(`Failed to parse structured menu JSON: ${parseError}`);
    }
  }
}


