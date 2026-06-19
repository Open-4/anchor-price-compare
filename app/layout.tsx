import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物价比价 - 看看附近哪家最便宜",
  description: "打开 App，看到附近 5km 内哪家超市的东西最便宜。比价 + 安全预警，覆盖线下消费场景。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <a href="/" className="text-base font-semibold tracking-tight">
              物价比价
            </a>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <a href="/prices" className="hover:text-zinc-900">查价格</a>
              <a href="/login" className="hover:text-zinc-900">登录</a>
              <a
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                注册
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
