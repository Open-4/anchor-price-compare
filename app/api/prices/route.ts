import { NextRequest, NextResponse } from 'next/server';
import { fetchPrices, createPrice } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lng = parseFloat(searchParams.get('lng') ?? '');
    const radius = parseFloat(searchParams.get('radius') ?? '10');
    const keyword = searchParams.get('keyword')?.trim() || undefined;
    if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
    if (isNaN(radius) || radius <= 0) return NextResponse.json({ error: 'radius > 0 required' }, { status: 400 });
    const data = await fetchPrices(lat, lng, radius, keyword);
    return NextResponse.json({ data, total: data.length });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, price, unit, storeName, lat, lng } = body;
    if (!productName?.trim()) return NextResponse.json({ error: 'productName required' }, { status: 400 });
    const p = Number(price);
    if (isNaN(p) || p <= 0) return NextResponse.json({ error: 'price > 0 required' }, { status: 400 });
    const la = parseFloat(lat), ln = parseFloat(lng);
    if (isNaN(la) || isNaN(ln)) return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
    const record = await createPrice({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      product: productName.trim(), price: p, unit: unit || '元/斤',
      store_name: storeName || null, latitude: la, longitude: ln,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });
    return NextResponse.json({ data: record[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
