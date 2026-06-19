const PAYPAL_MODE = (process.env.PAYPAL_MODE || "").replace(/^\uFEFF/, "");
const PAYPAL_API_BASE =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ── Access Token ────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").replace(/^\uFEFF/, "");
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").replace(/^\uFEFF/, "");

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal auth error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ── Create Order ────────────────────────────────────────

export interface PayPalCreateParams {
  price: number;
  currency?: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalCreateResult {
  orderId: string;
  approvalUrl: string;
}

export async function createOrder(
  params: PayPalCreateParams,
): Promise<PayPalCreateResult> {
  const token = await getAccessToken();

  const body = {
    intent: "CAPTURE" as const,
    purchase_units: [
      {
        amount: {
          currency_code: params.currency || "USD",
          value: params.price.toFixed(2),
        },
        description: "物价比价 Pro 订阅",
        custom_id: params.userId,
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          user_action: "PAY_NOW",
        },
      },
    },
  };

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal order error (${res.status}): ${err}`);
  }

  const data = await res.json();

  const approvalLink = data.links?.find(
    (l: { rel: string; href: string }) => l.rel === "payer-action",
  )?.href;

  if (!approvalLink) {
    throw new Error("PayPal did not return an approval URL");
  }

  return { orderId: data.id, approvalUrl: approvalLink };
}

// ── Capture Order ───────────────────────────────────────

export interface PayPalCaptureResult {
  status: string;
  payerId?: string;
  purchaseUnits: Array<{
    amount: { value: string };
    custom_id?: string;
  }>;
}

export async function captureOrder(
  orderId: string,
): Promise<PayPalCaptureResult> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const payerId = data.payer?.payer_id;
  const status = data.status;

  return {
    status,
    payerId,
    purchaseUnits: (data.purchase_units || []).map(
      (u: { amount: { value: string }; custom_id?: string }) => ({
        amount: u.amount,
        custom_id: u.custom_id,
      }),
    ),
  };
}

