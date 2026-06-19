const LS_API_URL = "https://api.lemonsqueezy.com/v1";

export interface CreateCheckoutParams {
  /** Lemon Squeezy variant ID (the price point / product variant) */
  variantId: number;
  /** Your internal user ID — passed as custom_data so it arrives in webhooks */
  userId: string;
  /** Where to send the user after a successful purchase */
  redirectUrl?: string;
  /** Pre-fill the buyer email */
  email?: string;
}

export interface CheckoutResult {
  /** The hosted checkout page URL */
  url: string;
  /** Lemon Squeezy checkout object ID */
  checkoutId: string;
}

/**
 * Create a Lemon Squeezy checkout session.
 *
 * Returns the hosted checkout URL your frontend should redirect to.
 *
 * Required env vars:
 *   - LEMONSQUEEZY_API_KEY
 *   - LEMONSQUEEZY_STORE_ID
 */
export async function createCheckout(
  params: CreateCheckoutParams,
): Promise<CheckoutResult> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set");
  }
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not set");
  }

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: params.email,
          custom: {
            user_id: params.userId,
          },
        },
        ...(params.redirectUrl
          ? {
              product_options: {
                redirect_url: params.redirectUrl,
              },
            }
          : {}),
      },
      relationships: {
        store: {
          data: { type: "stores", id: String(storeId) },
        },
        variant: {
          data: { type: "variants", id: String(params.variantId) },
        },
      },
    },
  };

  const response = await fetch(`${LS_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Lemon Squeezy API error (${response.status}): ${errorBody}`,
    );
  }

  const json: {
    data: { id: string; attributes: { url: string } };
  } = await response.json();

  return {
    url: json.data.attributes.url,
    checkoutId: json.data.id,
  };
}
