export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">隐私政策</h1>
      <p className="mt-2 text-sm text-zinc-400">最后更新：2026 年 6 月</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
        <div>
          <h2 className="font-semibold text-zinc-900">1. 信息收集</h2>
          <p className="mt-1">我们仅收集你在搜索物价时主动提供的位置信息（经纬度），用于比价功能。我们不收集个人身份信息。</p>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900">2. 信息使用</h2>
          <p className="mt-1">位置信息仅用于计算附近超市的距离和商品价格，不会用于其他用途。</p>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900">3. 数据存储</h2>
          <p className="mt-1">你的搜索数据和账户信息存储在加密的云数据库中。我们使用行业标准的安全措施保护数据。</p>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900">4. 第三方服务</h2>
          <p className="mt-1">我们使用 PayPal 处理支付，使用 Supabase 存储数据。这些服务商有各自的隐私政策。</p>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900">5. 联系我们</h2>
          <p className="mt-1">如有隐私相关问题，请联系 <a href="mailto:znkfhyq@outlook.com" className="text-blue-600 underline">znkfhyq@outlook.com</a></p>
        </div>
      </div>
    </div>
  );
}
