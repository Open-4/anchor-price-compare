"use client";

import { useState, useEffect, useRef } from "react";

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

export default function UpgradeClient({
  paypalClientId,
}: {
  paypalClientId: string;
}) {
  const [planId, setPlanId] = useState("yearly");
  const [step, setStep] = useState<"form" | "paypal" | "success" | "error">("form");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");

  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);
  const plan = PLANS.find((p) => p.id === planId)!;

  // ── Render PayPal Smart Buttons ──
  useEffect(() => {
    if (step !== "paypal" || !paypalRef.current || buttonsRendered.current) return;
    if (!paypalClientId) {
      setErrorMsg("支付功能暂未配置，请联系管理员");
      return;
    }

    buttonsRendered.current = true;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => {
      const pp = (window as any).paypal;
      if (!pp) { setErrorMsg("PayPal 加载异常"); return; }

      pp.Buttons({
        createOrder: async () => {
          const res = await fetch("/api/paypal/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: plan.price, currency: "USD", userId: getUserId() }),
          });
          if (!res.ok) throw new Error((await res.json()).error || "创建订单失败");
          return (await res.json()).orderId;
        },
        onApprove: async (data: { orderID: string }) => {
          setLoading(true);
          const res = await fetch("/api/paypal/capture-client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID, userId: getUserId() }),
          });
          const result = await res.json();
          if (result.status === "COMPLETED") {
            setStep("success");
          } else {
            setErrorMsg(result.error || "支付失败");
            setStep("error");
          }
          setLoading(false);
        },
        onCancel: () => {
          setErrorMsg("支付已取消");
          setStep("form");
          buttonsRendered.current = false;
        },
        onError: (err: any) => {
          setErrorMsg("支付组件加载失败，请检查浏览器是否拦截了弹窗或刷新重试");
          setStep("form");
          buttonsRendered.current = false;
        },
      }).render(paypalRef.current);
    };
    script.onerror = () => {
      setErrorMsg("PayPal SDK 加载失败");
      setStep("form");
      buttonsRendered.current = false;
    };
    document.body.appendChild(script);
  }, [step, paypalClientId, plan.price]);

  // ── Success ──
  if (step === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✓</div>
        <h1 className="mt-8 text-3xl font-bold">支付成功 🎉</h1>
        <p className="mt-3 text-zinc-500">你已是 Pro 会员</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">选择你的计划</h1>
        <p className="mt-2 text-zinc-500">升级 Pro，解锁全部功能</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLANS.map((p) => {
          const active = planId === p.id;
          return (
            <button key={p.id} onClick={() => { setPlanId(p.id); setStep("form"); buttonsRendered.current = false; }}
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

      {step === "form" && (
        <div className="mx-auto mt-10 max-w-md text-center">
          <p className="mb-3 text-sm text-zinc-500">已选：{plan.name} — ${plan.price}</p>
          <button onClick={() => { setErrorMsg(""); setStep("paypal"); }}
            className="w-full rounded-xl bg-[#0070ba] py-3 text-sm font-medium text-white shadow-lg hover:bg-[#003087]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>
              使用 PayPal 支付
            </span>
          </button>
          <p className="mt-2 text-xs text-zinc-400">支持 PayPal / 信用卡 / 借记卡</p>
          {errorMsg && <p className="mt-4 text-sm text-red-500">{errorMsg}</p>}
        </div>
      )}

      {step === "paypal" && (
        <div className="mx-auto mt-10 max-w-md">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">支付</h2>
            <div ref={paypalRef} className="min-h-[150px]" />
            {loading && <p className="mt-3 text-center text-sm text-zinc-500">处理中…</p>}
            {errorMsg && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
