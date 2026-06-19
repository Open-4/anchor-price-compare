"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-center text-2xl font-bold tracking-tight">注册</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        已有账号？<Link href="/login" className="text-blue-600 hover:underline">登录</Link>
      </p>

      <form className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="name">昵称</label>
          <input
            id="name"
            type="text"
            placeholder="你的名字"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
            placeholder="至少 6 位"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          注册
        </button>
        <p className="mt-4 text-center text-xs text-zinc-400">
          注册即表示同意 <span className="underline cursor-pointer">服务条款</span>
        </p>
      </form>
    </div>
  );
}
