// Auto-strip BOM from env vars
const strip = (s: string) => s ? s.replace(/^\uFEFF/, '') : '';

const SUPABASE_URL = strip(process.env.SUPABASE_URL || '');
const SUPABASE_SERVICE = strip(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SUPABASE_ANON = strip(process.env.SUPABASE_ANON_KEY || '');



function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchPrices(lat: number, lng: number, radius: number, keyword?: string) {
  const url = SUPABASE_URL + '/rest/v1/prices?select=*';
  const headers = { apikey: SUPABASE_SERVICE, Authorization: 'Bearer ' + SUPABASE_SERVICE };
  const res = await fetch(url, { headers });
  if (!res.ok) { const t = await res.text(); throw new Error('Supabase: ' + t); }
  const prices = (await res.json()) as any[];
  let filtered = prices.filter((p: any) => haversine(lat, lng, p.latitude, p.longitude) <= radius);
  if (keyword) filtered = filtered.filter((p: any) => p.product.toLowerCase().includes(keyword.toLowerCase()));
  const g: Record<string, { sum: number; min: number; max: number; cnt: number }> = {};
  filtered.forEach((p: any) => {
    const e = g[p.product] || { sum: 0, min: Infinity, max: -Infinity, cnt: 0 };
    e.sum += Number(p.price); e.min = Math.min(e.min, Number(p.price)); e.max = Math.max(e.max, Number(p.price)); e.cnt++;
    g[p.product] = e;
  });
  return Object.entries(g).map(([product, e]) => ({
    product, avgPrice: Math.round((e.sum / e.cnt) * 100) / 100, minPrice: e.min, maxPrice: e.max, count: e.cnt
  }));
}

export async function createPrice(data: any) {
  const url = SUPABASE_URL + '/rest/v1/prices';
  const headers = { apikey: SUPABASE_SERVICE, Authorization: 'Bearer ' + SUPABASE_SERVICE, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
  if (!res.ok) { const t = await res.text(); throw new Error('Supabase: ' + t); }
  return res.json();
}


