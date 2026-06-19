"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handlePayPal() {
    if (!email.trim()) {
      setError("请先输入你的邮箱");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: 19.90,
          currency: "USD",
          userId: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "创建订单失败");
      }

      // 跳转到 PayPal 付款页面
      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      {/* 定价卡片 */}
      <div className="rounded-xl border bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight">升级 Pro</h1>
        <p className="mt-2 text-sm text-zinc-500">
          解锁无限搜索、价格走势图和实时安全预警
        </p>

        <div className="mt-8 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">$19.90</span>
          <span className="text-zinc-400">/ 月</span>
        </div>

        <ul className="mt-6 space-y-3 text-left text-sm">
          {[
            "无限价格搜索，不限半径",
            "商品历史价格走势图",
            "实时安全预警推送",
            "Pro 专属标识",
            "优先体验新功能",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {/* 邮箱输入 */}
        <div className="mt-8">
          <label className="block text-left text-sm font-medium text-zinc-700">
            你的邮箱（用于识别账号）
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* PayPal 按钮 */}
        <button
          onClick={handlePayPal}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070ba] px-6 py-3 text-sm font-medium text-white hover:bg-[#003087] disabled:opacity-50"
        >
          {loading ? (
            "处理中…"
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
              </svg>
              使用 PayPal 支付
            </>
          )}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <p className="mt-4 text-xs text-zinc-400">
          支付后自动升级，随时可以取消订阅
        </p>
      </div>
    </div>
  );
}
