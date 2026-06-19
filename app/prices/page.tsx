"use client";

import { useState } from "react";

interface PriceResult {
  product: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export default function PricesPage() {
  const [lat, setLat] = useState("30.5728");
  const [lng, setLng] = useState("104.0668");
  const [keyword, setKeyword] = useState("");
  const [radius, setRadius] = useState("5");
  const [results, setResults] = useState<PriceResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const params = new URLSearchParams({
        lat, lng, radius,
        ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
      });
      const res = await fetch(`/api/prices?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "搜索失败");
      }
      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">查价格</h1>
      <p className="mt-2 text-zinc-500">输入位置和商品，看看附近哪家最便宜</p>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700">纬度</label>
            <input type="text" value={lat} onChange={(e) => setLat(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">经度</label>
            <input type="text" value={lng} onChange={(e) => setLng(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">范围 (km)</label>
            <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-700">商品</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="留空显示全部，输入大米、鸡蛋等关键词"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        </div>
        <button onClick={handleSearch} disabled={loading}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "搜索中…" : "搜索"}
        </button>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* 结果 */}
      {results !== null && (
        <div className="mt-8 space-y-3">
          {results.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">附近未找到相关商品</p>
          ) : (
            results.map((r) => (
              <div key={r.product} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{r.product}</h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {r.count} 家店铺
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-4 text-sm">
                  <span className="text-lg font-bold text-green-600">¥{r.minPrice.toFixed(2)}</span>
                  <span className="text-zinc-400">均价 ¥{r.avgPrice.toFixed(2)}</span>
                  <span className="text-zinc-400">最高 ¥{r.maxPrice.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 提示 */}
      {results === null && !loading && (
        <div className="mt-8 text-center text-sm text-zinc-400">
          <p>输入坐标和商品名称后点击搜索</p>
        </div>
      )}
    </div>
  );
}
