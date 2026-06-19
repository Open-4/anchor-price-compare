import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.DATABASE_URL || "NOT_SET";
  const clean = raw.replace(/^\uFEFF/, "");
  const prefix = clean.slice(0, Math.min(30, clean.length));
  const hasBom = raw !== clean;

  // Try connecting
  let connectResult: unknown;
  try {
    const { PrismaClient } = require("@prisma/client");
    const p = new PrismaClient({ datasources: { db: { url: clean } } });
    await p.$connect();
    connectResult = "CONNECTED";
    await p.$disconnect();
  } catch (e: unknown) {
    connectResult = String(e).slice(0, 500);
  }

  return NextResponse.json({
    raw_length: raw.length,
    clean_length: clean.length,
    prefix,
    hasBom,
    connectResult,
  });
}
