export default function PricesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">查价格</h1>
      <p className="mt-2 text-zinc-500">输入你的位置和想查的商品，看看附近哪家最便宜。</p>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">纬度</label>
            <input
              type="text"
              defaultValue="30.5728"
              readOnly
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">经度</label>
            <input
              type="text"
              defaultValue="104.0668"
              readOnly
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-700">商品</label>
          <input
            type="text"
            placeholder="例如：大米、鸡蛋、猪肉……"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <button className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
          搜索
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-zinc-400">
        <p>需要连接 Postgres 数据库并填充种子数据才能看到实际结果。</p>
        <p className="mt-1">详情见 <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">docs/marketing/launch_sop.md</code></p>
      </div>
    </div>
  );
}
