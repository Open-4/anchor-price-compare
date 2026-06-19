import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal";

// ── POST /api/paypal/create ─────────────────────────────
// Body: { price, currency?, userId }
//
// Returns: { orderId, approvalUrl }
// Frontend should redirect the user to approvalUrl.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price, currency, userId } = body;

    // ── Validation ────────────────────────────────────

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: "price must be a positive number" },
        { status: 400 },
      );
    }

    // ── Create PayPal order ───────────────────────────

    const origin = request.headers.get("origin") || "https://znkfhyq.xyz";

    const result = await createOrder({
      price: priceNum,
      currency: currency || "USD",
      userId,
      returnUrl: `${origin}/api/paypal/capture?user_id=${userId}`,
      cancelUrl: `${origin}/prices?paypal=cancelled`,
    });

    return NextResponse.json({
      orderId: result.orderId,
      approvalUrl: result.approvalUrl,
    });
  } catch (error) {
    console.error("POST /api/paypal/create error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
