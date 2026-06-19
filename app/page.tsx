import Link from "next/link";

const features = [
  {
    title: "附近比价",
    desc: "打开 App，看到附近 5km 内哪家超市的大米最便宜、鸡蛋差价多少。",
    icon: "📊",
  },
  {
    title: "安全预警",
    desc: "收到附近的安全事件推送——暴乱、盗窃、天气预警，出门前心里有数。",
    icon: "🛡️",
  },
  {
    title: "社区贡献",
    desc: "你报的价格，别人能看到；别人报的，你也能用。大家一起省。",
    icon: "🤝",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          看看附近哪家最便宜
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-500 sm:text-lg">
          搜一搜你常买的东西，看看附近 5km 内哪家超市最便宜。
          <br className="hidden sm:inline" />
          多走 200 米的事，一周能省出两杯咖啡。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/prices"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            开始查价格
          </Link>
          <Link
            href="/register"
            className="rounded-lg border px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            免费注册
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 text-base font-semibold text-zinc-900">
              {f.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-12 text-center text-white shadow-lg">
        <h2 className="text-xl font-semibold sm:text-2xl">
          加入内测，前 50 人 Pro 半价
        </h2>
        <p className="mt-2 text-sm text-blue-100">
          使用折扣码 <span className="rounded bg-white/20 px-2 py-0.5 font-mono text-white">PRO50</span> 升级享 5 折优惠
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          立即注册
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-center text-sm text-zinc-400">
        <p>物价比价 · 做一个帮普通人省钱的工具</p>
      </footer>
    </div>
  );
}
