"use client";

import { useState, useEffect, useRef } from "react";

const PLANS = [
  {
    id: "monthly",
    name: "月付",
    price: 19.90,
    label: "/月",
    original: null,
    badge: null,
    features: [
      "无限价格搜索",
      "5km 任意半径",
      "价格走势图",
      "安全预警推送",
      "随时取消",
    ],
  },
  {
    id: "yearly",
    name: "年付",
    price: 159,
    label: "/年",
    original: 238.80,
    badge: "省 ¥79",
    popular: true,
    features: [
      "全部月付权益",
      "比月付省 33%",
      "优先新功能体验",
      "专属客服",
    ],
  },
  {
    id: "lifetime",
    name: "终身",
    price: 499,
    label: "一次付清",
    original: null,
    badge: "最值",
    features: [
      "全部权益永不过期",
      "未来功能免费升级",
      "数据导出",
      "创始人感谢信",
    ],
  },
];

interface State {
  planId: string;
  email: string;
  loading: boolean;
  step: "form" | "paypal" | "success" | "error";
  errorMsg: string;
}

export default function UpgradeClient({
  paypalClientId,
}: {
  paypalClientId: string;
}) {
  const [state, setState] = useState<State>({
    planId: "yearly",
    email: "",
    loading: false,
    step: "form",
    errorMsg: "",
  });

  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  const plan = PLANS.find((p) => p.id === state.planId)!;

  // ── Load PayPal SDK & render buttons ──
  useEffect(() => {
    if (state.step !== "paypal" || !paypalRef.current || buttonsRendered.current) return;

    buttonsRendered.current = true;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      const paypal = (window as any).paypal;
      if (!paypal) return;

      paypal.Buttons({
        createOrder: async () => {
          const res = await fetch("/api/paypal/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              price: plan.price,
              currency: "USD",
              userId: state.email.trim(),
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "创建订单失败");
          return data.orderId;
        },
        onApprove: async (data: { orderID: string }) => {
          setState((s) => ({ ...s, loading: true }));
          const res = await fetch("/api/paypal/capture-client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderID,
              userId: state.email.trim(),
            }),
          });
          const result = await res.json();
          if (result.status === "COMPLETED") {
            setState((s) => ({ ...s, step: "success", loading: false }));
          } else {
            setState((s) => ({
              ...s,
              step: "error",
              errorMsg: result.error || "支付失败",
              loading: false,
            }));
          }
        },
        onCancel: () => {
          setState((s) => ({
            ...s,
            step: "form",
            errorMsg: "支付已取消",
          }));
          buttonsRendered.current = false;
        },
        onError: (err: unknown) => {
          setState((s) => ({
            ...s,
            step: "error",
            errorMsg: String(err),
          }));
          buttonsRendered.current = false;
        },
      }).render(paypalRef.current);
    };
    document.body.appendChild(script);
    return () => { buttonsRendered.current = false; };
  }, [state.step, paypalClientId, plan.price, state.email]);

  const handleStart = () => {
    if (!state.email.trim()) {
      setState((s) => ({ ...s, errorMsg: "请先输入邮箱" }));
      return;
    }
    setState((s) => ({ ...s, step: "paypal", errorMsg: "" }));
  };

  // ── Success ──
  if (state.step === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>
        <h1 className="mt-8 text-3xl font-bold">支付成功 🎉</h1>
        <p className="mt-3 text-zinc-500">你已是 Pro 会员，感谢信任！</p>
        <ul className="mt-8 space-y-2 text-left text-sm text-zinc-600">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {f}
            </li>
          ))}
        </ul>
        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          进入控制台
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          选择你的计划
        </h1>
        <p className="mt-2 text-zinc-500">
          升级 Pro，解锁全部功能。随时取消，无隐藏费用。
        </p>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLANS.map((p) => {
          const active = state.planId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setState((s) => ({ ...s, planId: p.id, step: "form" }))}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                active
                  ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                  {p.badge}
                </span>
              )}
              {p.popular && (
                <span className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-medium text-white">
                  推荐
                </span>
              )}

              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">${p.price}</span>
                <span className="text-sm text-zinc-400">{p.label}</span>
              </div>
              {p.original && (
                <p className="mt-1 text-xs text-zinc-400 line-through">
                  ${p.original}
                </p>
              )}

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

      {/* ── Checkout ── */}
      {state.step === "form" && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">确认升级</h2>
          <p className="mt-1 text-sm text-zinc-500">
            计划：{plan.name} — ${plan.price}
          </p>

          <input
            type="email"
            value={state.email}
            onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
            placeholder="你的邮箱"
            className="mt-4 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <button
            onClick={handleStart}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            继续 - 使用 PayPal 支付
          </button>

          {state.errorMsg && (
            <p className="mt-2 text-xs text-red-500">{state.errorMsg}</p>
          )}
        </div>
      )}

      {/* ── PayPal Buttons ── */}
      {state.step === "paypal" && (
        <div className="mx-auto mt-10 max-w-md">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold">PayPal 支付</h2>
            <p className="mb-4 text-sm text-zinc-500">
              {plan.name} — ${plan.price}
            </p>
            <div ref={paypalRef} className="min-h-[200px]" />
            {state.loading && (
              <p className="mt-3 text-center text-sm text-zinc-500">处理中…</p>
            )}
            <button
              onClick={() => {
                setState((s) => ({ ...s, step: "form" }));
                buttonsRendered.current = false;
              }}
              className="mt-3 w-full text-center text-xs text-zinc-400 underline"
            >
              返回上一步
            </button>
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="text-center text-lg font-semibold">常见问题</h2>
        <div className="mt-6 space-y-4">
          {[
            ["如何取消？", "发送邮件到我们的邮箱即可取消，无任何手续费。"],
            ["付款安全吗？", "所有支付通过 PayPal 处理，我们不存储任何银行卡信息。"],
            ["可以退款吗？", "购买后 7 天内可申请全额退款。"],
          ].map(([q, a]) => (
            <details key={q} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer text-sm font-medium">
                {q}
              </summary>
              <p className="mt-2 text-sm text-zinc-500">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
