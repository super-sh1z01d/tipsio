import { decrypt, encrypt } from "./encryption";

const MIDTRANS_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

/**
 * Encrypt a Midtrans key for secure storage
 */
export function encryptKey(key: string): string {
  return encrypt(key);
}
const MIDTRANS_PRODUCTION_URL = "https://app.midtrans.com/snap/v1/transactions";

interface MidtransCredentials {
  serverKey: string;
  clientKey: string;
  merchantId: string;
  environment: "sandbox" | "production";
}

interface CreateTransactionParams {
  orderId: string;
  amount: number;
  customerDetails?: {
    firstName?: string;
    email?: string;
    phone?: string;
  };
  itemDetails?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
}

interface SnapResponse {
  token: string;
  redirect_url: string;
}

/**
 * Get decrypted Midtrans credentials for a venue
 */
export function getDecryptedCredentials(venue: {
  midtransServerKey: string | null;
  midtransClientKey: string | null;
  midtransMerchantId: string | null;
  midtransEnvironment: string;
}): MidtransCredentials | null {
  if (!venue.midtransServerKey || !venue.midtransClientKey || !venue.midtransMerchantId) {
    return null;
  }

  return {
    serverKey: decrypt(venue.midtransServerKey),
    clientKey: venue.midtransClientKey, // Client key is not encrypted
    merchantId: venue.midtransMerchantId,
    environment: venue.midtransEnvironment as "sandbox" | "production",
  };
}

/**
 * Create a Snap transaction with Midtrans
 */
export async function createSnapTransaction(
  credentials: MidtransCredentials,
  params: CreateTransactionParams
): Promise<SnapResponse> {
  const baseUrl =
    credentials.environment === "production"
      ? MIDTRANS_PRODUCTION_URL
      : MIDTRANS_SANDBOX_URL;

  const authString = Buffer.from(`${credentials.serverKey}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: params.customerDetails,
    item_details: params.itemDetails || [
      {
        id: "tip",
        name: "Digital Tip",
        price: params.amount,
        quantity: 1,
      },
    ],
    callbacks: params.callbacks,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Midtrans error:", error);
    throw new Error(error.error_messages?.[0] || "Failed to create transaction");
  }

  return response.json();
}

/**
 * Verify Midtrans webhook signature
 */
export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  
  return hash === signatureKey;
}

/**
 * Generate unique order ID for tips
 */
export function generateTipOrderId(venueId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TIP-${venueId.substring(0, 8)}-${timestamp}-${random}`;
}
