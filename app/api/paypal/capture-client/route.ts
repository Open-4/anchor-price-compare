import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { captureOrder } from "@/lib/paypal";

const prisma = new PrismaClient();

// ── POST /api/paypal/capture-client ────────────────────
// Called by PayPal Smart Buttons after user approves.
// Returns JSON instead of redirecting.

export async function POST(request: NextRequest) {
  try {
    const { orderId: orderID, userId } = await request.json();

    if (!orderID || !userId) {
      return NextResponse.json(
        { error: "orderId and userId are required" },
        { status: 400 },
      );
    }

    // Capture via PayPal API
    const result = await captureOrder(orderID);

    if (result.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal capture failed: ${result.status}` },
        { status: 400 },
      );
    }

    // Update user in database
    await prisma.user.upsert({
      where: { id: userId },
      update: { plan: "PRO", paypalOrderId: orderID },
      create: {
        id: userId,
        email: `${userId}@checkout.local`,
        name: "PayPal User",
        password: "",
        plan: "PRO",
        paypalOrderId: orderID,
      },
    });

    return NextResponse.json({
      status: "COMPLETED",
      orderId: orderID,
      message: "升级成功！你已是 Pro 会员 🎉",
    });
  } catch (error) {
    console.error("POST /api/paypal/capture-client error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Capture failed",
      },
      { status: 500 },
    );
  }
}
