import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Auth helper ─────────────────────────────────────────

/**
 * Extract the authenticated user ID from the request.
 *
 * Adapt this function to your auth system:
 *   - NextAuth.js → getServerSession(request)
 *   - Clerk       → auth() from @clerk/nextjs
 *   - Custom JWT  → verify the Authorization Bearer token
 *
 * For now it reads an `x-user-id` header, which you set
 * in your auth middleware after verifying the session.
 */
async function getUserId(request: NextRequest): Promise<string | null> {
  // Option A: middleware-set header
  const userId = request.headers.get("x-user-id");
  if (userId) return userId;

  // Option B: Bearer token (replace with your JWT verification)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // TODO: decode & verify token, then extract sub/uid
    return null;
  }

  return null;
}

// ── GET /api/subscription/status ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      plan: user.plan.toLowerCase(), // "free" | "pro"
    });
  } catch (error) {
    console.error("GET /api/subscription/status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
