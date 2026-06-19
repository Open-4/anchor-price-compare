import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const EARTH_RADIUS_KM = 6371;

// ── GET /api/prices ──────────────────────────────────────
// Query: lat, lng, radius (km, default 10), keyword (optional)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const radius = parseFloat(searchParams.get("radius") ?? "10");
    const keyword = searchParams.get("keyword")?.trim() || null;

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "lat and lng are required numeric parameters" },
        { status: 400 },
      );
    }

    if (isNaN(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "radius must be a positive number" },
        { status: 400 },
      );
    }

    const sql = `
      SELECT
        product,
        AVG(price)::numeric(12,2) AS avgprice,
        MIN(price)::numeric(12,2) AS minprice,
        MAX(price)::numeric(12,2) AS maxprice,
        COUNT(*)::int AS count
      FROM prices
      WHERE $1 * acos(
        cos(radians($2)) * cos(radians(latitude))
        * cos(radians(longitude) - radians($3))
        + sin(radians($2)) * sin(radians(latitude))
      ) < $4
      ${keyword ? `AND product ILIKE '%' || $5 || '%'` : ""}
      GROUP BY product
      ORDER BY count DESC, product ASC
    `;
    const params: unknown[] = [EARTH_RADIUS_KM, lat, lng, radius];
    if (keyword) params.push(keyword);

    const rows = await prisma.$queryRawUnsafe(sql, ...params) as any[];

    const data = rows.map((r: any) => ({
      product: r.product,
      avgPrice: Number(r.avgprice),
      minPrice: Number(r.minprice),
      maxPrice: Number(r.maxprice),
      count: Number(r.count),
    }));

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("GET /api/prices error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST /api/prices ─────────────────────────────────────
// Body: { productName, price, unit?, storeName?, lat, lng }

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const { productName, price, unit, storeName, lat, lng } = body;

    // ── Validation ──────────────────────────────────────

    if (
      !productName ||
      typeof productName !== "string" ||
      productName.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "productName is required and must be a non-empty string" },
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

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "lat and lng are required numeric parameters" },
        { status: 400 },
      );
    }

    // ── Transactional write ─────────────────────────────

    const record = await prisma.$transaction(async (tx: any) => {
      return (tx as any).price.create({
        data: {
          product: productName.trim(),
          price: priceNum,
          unit: unit || "元/斤",
          storeName: storeName || null,
          latitude: latNum,
          longitude: lngNum,
        },
      });
    });

    await prisma.$disconnect();

    return NextResponse.json(
      {
        data: {
          id: record.id,
          product: record.product,
          unit: record.unit,
          price: Number(record.price),
          storeName: record.storeName,
          latitude: record.latitude,
          longitude: record.longitude,
          createdAt: record.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/prices error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

