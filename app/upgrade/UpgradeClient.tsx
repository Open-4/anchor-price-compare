"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PLANS = [
  {
    id: "monthly", name: "月付", price: 19.90, label: "/月", original: null, badge: null,
    features: ["无限价格搜索", "5km 任意半径", "价格走势图", "安全预警推送", "随时取消"],
  },
  {
    id: "yearly", name: "年付", price: 159, label: "/年", original: 238.80, badge: "省 ¥80",
    popular: true,
    features: ["全部月付权益", "比月付省 33%", "优先体验新功能", "专属客服"],
  },
  {
    id: "lifetime", name: "终身", price: 499, label: "一次付清", original: null, badge: "最值",
    features: ["全部权益永不过期", "未来功能免费升级", "数据导出", "创始人感谢信"],
  },
];

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem("checkout_user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("checkout_user_id", uid);
  }
  return uid;
}

export default function UpgradeClient() {
  const [planId, setPlanId] = useState("yearly");
  const [step, setStep] = useState<"form" | "paypal" | "success" | "error">("form");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [savedOrderId, setSavedOrderId] = useState("");

  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);
  const plan = PLANS.find((p) => p.id === planId)!;

  // ── Fetch PayPal client ID ──
  useEffect(() => {
    fetch("/api/paypal/config")
      .then((r) => r.json())
      .then((d) => { if (d.clientId) setClientId(d.clientId); })
      .catch(() => setErrorMsg("支付配置加载失败"));
  }, []);

  // ── Render PayPal Smart Buttons ──
  const renderPayPal = useCallback(() => {
    if (!clientId || !paypalRef.current || buttonsRendered.current) return;
    buttonsRendered.current = true;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      const pp = (window as any).paypal;
      if (!pp) return;

      pp.Buttons({
        createOrder: async () => {
          const res = await fetch("/api/paypal/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: plan.price, currency: "USD", userId: getUserId() }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "创建订单失败");
          setSavedOrderId(data.orderId);
          return data.orderId;
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
            setSavedOrderId(data.orderID);
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
          setErrorMsg(err?.message || "PayPal 加载失败，请检查浏览器是否拦截了弹窗");
          setStep("error");
          buttonsRendered.current = false;
        },
      }).render(paypalRef.current);
    };
    script.onerror = () => {
      setErrorMsg("PayPal SDK 加载失败，请刷新页面重试");
      buttonsRendered.current = false;
    };
    document.body.appendChild(script);
  }, [clientId, plan.price]);

  useEffect(() => {
    if (step === "paypal") renderPayPal();
    return () => { buttonsRendered.current = false; };
  }, [step, renderPayPal]);

  // ── Link email after success ──
  const handleLinkEmail = async () => {
    if (!email.trim()) return;
    // Future: call API to link email to this userId
    window.location.href = "/dashboard?paypal=success";
  };

  // ── Success ──
  if (step === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✓</div>
        <h1 className="mt-8 text-3xl font-bold">支付成功 🎉</h1>
        <p className="mt-3 text-zinc-500">你已是 Pro 会员，感谢信任！</p>
        <div className="mt-8 rounded-2xl border bg-white p-6 text-left shadow-sm">
          <p className="text-sm font-medium">绑定邮箱（可选）</p>
          <p className="mt-1 text-xs text-zinc-400">填写后可用于登录和找回账号</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500" />
          <button onClick={handleLinkEmail}
            className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            完成
          </button>
          <a href="/dashboard"
            className="mt-3 block text-center text-xs text-zinc-400 underline">
            跳过，直接进入控制台
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">选择你的计划</h1>
        <p className="mt-2 text-zinc-500">升级 Pro，解锁全部功能。随时取消，无隐藏费用。</p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLANS.map((p) => {
          const active = planId === p.id;
          return (
            <button key={p.id} onClick={() => { setPlanId(p.id); setStep("form"); }}
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

      {/* Pay Button */}
      {step === "form" && (
        <div className="mx-auto mt-10 max-w-md text-center">
          <p className="mb-3 text-sm text-zinc-500">已选：{plan.name} — ${plan.price}</p>
          <button onClick={() => { setErrorMsg(""); setStep("paypal"); }}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            使用 PayPal 支付
          </button>
          <p className="mt-2 text-xs text-zinc-400">
            支持 PayPal / 信用卡 / 借记卡
          </p>
          {errorMsg && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
        </div>
      )}

      {/* PayPal Container */}
      {step === "paypal" && (
        <div className="mx-auto mt-10 max-w-md">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold">完善支付</h2>
            <p className="mb-4 text-sm text-zinc-500">{plan.name} — ${plan.price}</p>
            <div ref={paypalRef} className="min-h-[180px]" />
            {loading && <p className="mt-3 text-center text-sm text-zinc-500">处理中…</p>}
            {errorMsg && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
            <button onClick={() => { setStep("form"); buttonsRendered.current = false; }}
              className="mt-3 w-full text-center text-xs text-zinc-400 underline">
              返回
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="text-center text-lg font-semibold">常见问题</h2>
        <div className="mt-6 space-y-4">
          {[
            ["支持哪些支付方式？", "通过 PayPal 可使用 PayPal 余额、信用卡（Visa/MasterCard/American Express）、借记卡支付。"],
            ["如何取消？", "发送邮件到我们邮箱即可取消，无任何手续费。"],
            ["付款安全吗？", "所有支付通过 PayPal 处理，我们不存储任何银行卡信息。"],
            ["可以退款吗？", "购买后 7 天内可申请全额退款。"],
          ].map(([q, a]) => (
            <details key={q} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer text-sm font-medium">{q}</summary>
              <p className="mt-2 text-sm text-zinc-500">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
