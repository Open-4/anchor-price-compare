"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const paypalSuccess = searchParams.get("paypal") === "success";
  const paypalOrder = searchParams.get("order");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {paypalSuccess ? (
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mt-6 text-2xl font-bold">支付成功 🎉</h1>
          <p className="mt-2 text-zinc-500">
            你已经是 Pro 会员了，感谢你的信任！
          </p>
          {paypalOrder && (
            <p className="mt-1 text-xs text-zinc-400">
              订单号: {paypalOrder.slice(0, 12)}...
            </p>
          )}
          <div className="mt-8 rounded-xl border bg-white p-6 text-left shadow-sm">
            <h2 className="text-sm font-semibold">Pro 权益已激活</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                无限价格搜索，不限半径
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                商品历史价格走势图（即将上线）
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                实时安全预警推送
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">控制台</h1>
          <p className="mt-2 text-zinc-500">
            登录后可以在这里管理你的订阅和设置。
          </p>
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-400">
              当前版本：免费版
            </p>
            <a
              href="/upgrade"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              升级 Pro
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
