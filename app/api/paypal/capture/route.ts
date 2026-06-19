import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { captureOrder } from "@/lib/paypal";

const prisma = new PrismaClient();

// ── GET /api/paypal/capture ────────────────────────────
// PayPal redirects here after buyer approves the payment.
// Query: order_id, user_id

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id") || searchParams.get("token");
    const userId = searchParams.get("user_id");

    if (!orderId) {
      return NextResponse.redirect(
        new URL("/prices?paypal=error&reason=missing_order", request.url),
      );
    }

    if (!userId) {
      return NextResponse.redirect(
        new URL("/prices?paypal=error&reason=missing_user", request.url),
      );
    }

    // ── Capture with PayPal ───────────────────────────

    const result = await captureOrder(orderId);

    if (result.status !== "COMPLETED") {
      console.warn(`[PayPal] capture incomplete: ${result.status}`);
      return NextResponse.redirect(
        new URL(`/prices?paypal=error&reason=${result.status}`, request.url),
      );
    }

    const capturedUserId =
      result.purchaseUnits?.[0]?.custom_id || userId;

    // ── Update user ───────────────────────────────────

    await prisma.user.update({
      where: { id: capturedUserId },
      data: {
        plan: "PRO",
        paypalOrderId: orderId,
      },
    });

    console.info(
      `[PayPal] user ${capturedUserId} upgraded to PRO, order ${orderId}`,
    );

    return NextResponse.redirect(
      new URL(`/dashboard?paypal=success&order=${orderId}`, request.url),
    );
  } catch (error) {
    console.error("GET /api/paypal/capture error:", error);
    return NextResponse.redirect(
      new URL(
        `/prices?paypal=error&reason=${encodeURIComponent(error instanceof Error ? error.message : "unknown")}`,
        request.url,
      ),
    );
  }
}
