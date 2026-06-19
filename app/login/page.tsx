"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-center text-2xl font-bold tracking-tight">登录</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        还没有账号？<Link href="/register" className="text-blue-600 hover:underline">免费注册</Link>
      </p>

      <form className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          登录
        </button>
      </form>
    </div>
  );
}
