import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Signature verification ──────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing LEMONSQUEEZY_WEBHOOK_SECRET");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody, "utf8");
  const digest = hmac.digest("base64");

  // Use constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

// ── Types ───────────────────────────────────────────────

interface LSEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    type: string;
    attributes: {
      customer_id?: number;
      user_email?: string;
      [key: string]: unknown;
    };
  };
}

// ── POST /api/webhooks/lemon-squeezy ────────────────────

export async function POST(request: NextRequest) {
  // 1. Read raw body once (must be text for signature verification)
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  // 2. Verify
  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "invalid webhook signature" },
      { status: 401 },
    );
  }

  // 3. Parse payload
  let payload: LSEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "invalid JSON body" },
      { status: 400 },
    );
  }

  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data ?? {};
  const userId: string | undefined = customData.user_id;

  if (!eventName) {
    return NextResponse.json(
      { error: "missing event_name" },
      { status: 400 },
    );
  }

  console.info(`[LS Webhook] received: ${eventName}`);

  // 4. Process event
  switch (eventName) {
    // ── Grant PRO access ──────────────────────────────
    case "order_created":
    case "subscription_created":
    case "subscription_updated": {
      if (!userId) {
        console.warn(`[LS Webhook] ${eventName}: no user_id in custom_data`);
        // Acknowledge so LS doesn't retry forever
        return NextResponse.json({ received: true });
      }

      const customerId = String(
        payload.data.attributes.customer_id ?? "",
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: "PRO",
          ...(customerId
            ? { lemonSqueezyCustomerId: customerId }
            : {}),
        },
      });

      console.info(
        `[LS Webhook] upgraded user ${userId} to PRO (customer: ${customerId})`,
      );
      break;
    }

    // ── Revoke PRO access ─────────────────────────────
    case "subscription_cancelled":
    case "subscription_expired": {
      if (!userId) {
        console.warn(`[LS Webhook] ${eventName}: no user_id in custom_data`);
        return NextResponse.json({ received: true });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { plan: "FREE" },
      });

      console.info(
        `[LS Webhook] downgraded user ${userId} to FREE (${eventName})`,
      );
      break;
    }

    default:
      console.info(`[LS Webhook] unhandled event: ${eventName}`);
  }

  return NextResponse.json({ received: true });
}
