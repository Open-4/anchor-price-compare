import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          看看附近
          <span className="text-blue-600">哪家最便宜</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
          搜一下你常买的东西，马上看到附近超市的价格对比。
          买对不买贵，一周省出两杯咖啡钱。
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/prices" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
            开始查价格
          </Link>
          <Link href="/upgrade" className="rounded-xl border px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
            升级 Pro
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-10 text-white sm:grid-cols-3">
        {[["10,000+", "物价数据"], ["50+", "覆盖城市"], ["30 天", "无理由退款"]].map(([n, l]) => (
          <div key={l} className="text-center"><p className="text-3xl font-bold">{n}</p><p className="mt-1 text-sm text-blue-200">{l}</p></div>
        ))}
      </section>

      {/* How it works */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-bold">三步开始</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[["1","输入位置","打开网站，输入你的当前位置，或自动定位。"],["2","搜索商品","输入想买的东西，比如大米、鸡蛋、猪肉。"],["3","对比价格","看到附近 5km 内哪家最便宜，直接去。"],].map(([n,t,d])=>(<div key={n} className="rounded-2xl border bg-white p-6 text-center shadow-sm"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{n}</div><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{d}</p></div>))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-bold">不只是比价</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">更多实用功能，让日常购物更省心</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[{t:"实时比价",d:"搜索任意商品，显示附近所有店铺的价格排序，最低价一目了然。"},{t:"价格走势",d:"查看商品过去 30 天的价格变化，知道什么时候买最划算。",pro:true},{t:"安全预警",d:"附近的突发事件和天气预警实时推送，出门前心里有数。"},{t:"购物清单",d:"创建购物清单，一键查看所有商品的最低总价方案。",pro:true},{t:"店铺排行",d:"看附近哪些店铺整体价格最低，哪家买菜最划算。"},{t:"降价提醒",d:"关注的商品降价时自动通知你，不错过好价。",pro:true}].map((f)=>(<div key={f.t} className="relative rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">{f.pro&&<span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Pro</span>}<h3 className="text-sm font-semibold">{f.t}</h3><p className="mt-1 text-sm leading-relaxed text-zinc-500">{f.d}</p></div>))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mt-24 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">免费开始，Pro 更强</h2>
        <p className="mt-2 text-sm text-zinc-400">Pro 用户无限使用全部功能</p>
        <div className="mt-8 grid gap-4 sm:mx-auto sm:max-w-lg sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-5"><p className="text-sm font-medium">免费版</p><p className="mt-1 text-2xl font-bold">¥0</p><ul className="mt-3 space-y-1 text-xs text-zinc-400"><li>每日 5 次搜索</li><li>5km 范围</li><li>基础比价</li></ul></div>
          <div className="rounded-xl bg-blue-600 p-5 shadow-lg"><p className="text-sm font-medium">Pro 版</p><p className="mt-1 text-2xl font-bold">¥19.9/月</p><ul className="mt-3 space-y-1 text-xs text-blue-200"><li>无限搜索</li><li>不限半径</li><li>全部功能</li></ul></div>
        </div>
        <Link href="/upgrade" className="mt-8 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100">查看全部方案</Link>
      </section>

      {/* Testimonials */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-bold">用户怎么说</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[["以前买菜全靠感觉，用了这个才发现楼下超市比对面贵了 ¥3。","小王","成都"],["出门前搜一下鸡蛋价格，一周能省十几块。推荐给身边朋友了。","李女士","杭州"],["上次暴雨预警提醒让我提前回了家，这个功能很实用。","阿杰","广州"],].map(([t,n,c])=>(<div key={n} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm leading-relaxed text-zinc-600">&ldquo;{t}&rdquo;</p><div className="mt-4 flex items-center gap-2 text-sm"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">{n[0]}</div><div><p className="font-medium">{n}</p><p className="text-xs text-zinc-400">{c}</p></div></div></div>))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-2xl pb-24">
        <h2 className="text-center text-2xl font-bold">常见问题</h2>
        <div className="mt-8 space-y-3">
          {[["数据准确吗？","我们的价格数据由社区用户提交和人工核实，同时计划接入部分超市公开数据。"],["覆盖哪些城市？","目前已覆盖全国主要城市，新城市每周增加。"],["Pro 值得买吗？","如果你每周买菜，Pro 的无限搜索能帮你轻松省回订阅费。"],["隐私安全吗？","我们只收集必要的位置信息用于比价，不追踪、不出售数据。见隐私政策。"],["可以随时取消吗？","月付方案可随时取消，当前周期结束后不再扣款。年付支持按比例退款。"],].map(([q,a])=>(<details key={q} className="rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm font-medium">{q}</summary><p className="mt-2 text-sm text-zinc-500">{a}</p></details>))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 text-center text-sm text-zinc-400">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          <Link href="/privacy" className="hover:text-zinc-600">隐私政策</Link>
          <span className="text-zinc-200">|</span>
          <a href="mailto:znkfhyq@outlook.com" className="hover:text-zinc-600">联系我们</a>
        </div>
        <p>物价比价 · 帮普通人省钱的工具</p>
        <p className="mt-1 text-xs text-zinc-300">© 2026 Anchor Price Compare</p>
      </footer>
    </div>
  );
}
