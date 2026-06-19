"use client";

import { useState } from "react";

const PLANS = [
  {
    id: "monthly", name: "月付", price: 19.90, label: "/月",
    features: ["无限价格搜索", "5km 任意半径", "价格走势图", "安全预警推送"],
  },
  {
    id: "yearly", name: "年付", price: 159, label: "/年",
    original: 238.80, badge: "省 ¥80", popular: true,
    features: ["全部月付权益", "比月付省 33%", "优先新功能体验", "专属客服"],
  },
  {
    id: "lifetime", name: "终身", price: 499, label: "一次付清",
    badge: "最值",
    features: ["全部权益永不过期", "未来功能免费升级", "数据导出", "创始人感谢信"],
  },
];

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem("checkout_user_id");
  if (!uid) { uid = crypto.randomUUID(); localStorage.setItem("checkout_user_id", uid); }
  return uid;
}

export default function UpgradeClient() {
  const [planId, setPlanId] = useState("yearly");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const plan = PLANS.find((p) => p.id === planId)!;

  async function handlePayPal() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: plan.price, currency: "USD", userId: getUserId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建订单失败");

      // 直接跳转到 PayPal（同一标签页）
      window.location.href = data.approvalUrl;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "网络错误");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-base text-zinc-600">正在跳转 PayPal 安全支付…</p>
        <p className="mt-2 text-xs text-zinc-400">请稍候，即将进入支付页面</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">选择你的计划</h1>
      <p className="mt-2 text-center text-zinc-500">升级 Pro，解锁全部功能</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLANS.map((p) => {
          const active = planId === p.id;
          return (
            <button key={p.id} onClick={() => { setPlanId(p.id); setErrorMsg(""); }}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                active ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100" : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"
              }`}>
              {p.badge && <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">{p.badge}</span>}
              {p.popular && <span className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-medium text-white">推荐</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">${p.price}</span>
                <span className="text-sm text-zinc-400">{p.label}</span>
              </div>
              {p.original && <p className="mt-1 text-xs text-zinc-400 line-through">${p.original}</p>}
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="text-blue-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-md text-center">
        <p className="mb-3 text-sm text-zinc-500">已选：{plan.name} — ${plan.price}</p>
        <button onClick={handlePayPal} disabled={loading}
          className="w-full rounded-xl bg-[#0070ba] py-3 text-sm font-medium text-white shadow-lg hover:bg-[#003087] disabled:opacity-50">
          使用 PayPal 支付
        </button>
        <p className="mt-2 text-xs text-zinc-400">支持信用卡 / 借记卡 / PayPal 余额</p>
        {errorMsg && <p className="mt-4 text-sm text-red-500">{errorMsg}</p>}
      </div>
    </div>
  );
}
