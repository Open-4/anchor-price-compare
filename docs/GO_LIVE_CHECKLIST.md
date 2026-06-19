# 启动前检查清单

> 最后更新：2026-06-18
> 目的：确保生产环境上线前所有环节经过验证，降低线上事故概率。
> 建议安排两名角色：**执行者**（逐项操作）和**验证者**（逐项确认打勾）。

---

## 一、域名 & DNS

| # | 检查项 | 命令 / 操作 | 验证标准 | 勾选 |
|---|--------|-------------|----------|------|
| 1.1 | 域名 A 记录指向服务器 | `dig +short yourdomain.com` | 返回服务器 IP | ☐ |
| 1.2 | www CNAME 解析 | `dig +short www.yourdomain.com` | 返回 yourdomain.com | ☐ |
| 1.3 | 域名 TTL 是否降到 300 | `dig +nocmd yourdomain.com any +noall +answer` | TTL <= 300 | ☐ |
| 1.4 | DNSSEC 配置（如有） | `dig yourdomain.com +dnssec` | ad flag 存在 | ☐ |

---

## 二、SSL / TLS

| # | 检查项 | 命令 / 操作 | 验证标准 | 勾选 |
|---|--------|-------------|----------|------|
| 2.1 | 证书已签发 | 浏览器访问 `https://yourdomain.com` | 锁图标显示 | ☐ |
| 2.2 | 证书链完整 | `curl -vI https://yourdomain.com 2>&1 | grep "SSL certificate"` | 无警告 | ☐ |
| 2.3 | 自动续期已验证 | `acme.sh --list` 或 certbot 状态 | 下次续期时间 >= 30 天 | ☐ |
| 2.4 | HTTP → HTTPS 强跳转 | `curl -sI http://yourdomain.com | grep Location` | 返回 301/308 到 https | ☐ |
| 2.5 | HSTS 头 | `curl -sI https://yourdomain.com | grep -i Strict-Transport-Security` | `max-age` >= 31536000 | ☐ |

---

## 三、应用部署

| # | 检查项 | 操作 | 验证标准 | 勾选 |
|---|--------|------|----------|------|
| 3.1 | 环境变量已注入 | Vercel Dashboard → Project Settings → Environment Variables | 所有变量存在且值匹配生产 | ☐ |
| 3.2 | Prisma Client 已生成 | `npx prisma generate` 在构建日志中成功 | 无 `@prisma/client` 相关错误 | ☐ |
| 3.3 | 首页加载 | `curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com` | 200 | ☐ |
| 3.4 | 健康检查端点可用 | `curl https://yourdomain.com/api/health` | `{"status":"ok"}` | ☐ |
| 3.5 | 定价页加载 | `curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/prices` | 200 | ☐ |
| 3.6 | 登录/注册页加载 | `curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/login` | 200 | ☐ |
| 3.7 | 移动端布局 | 用手机浏览器打开首页 | 显示正常，无横向滚动 | ☐ |
| 3.8 | 控制台无 JS 错误 | 打开浏览器 DevTools → Console | 无红色错误日志 | ☐ |

---

## 四、数据库

| # | 检查项 | 操作 | 验证标准 | 勾选 |
|---|--------|------|----------|------|
| 4.1 | 迁移已部署 | `npx prisma migrate deploy` 或确认 CI/CD 日志 | "All migrations have been applied" | ☐ |
| 4.2 | 迁移前已备份 | `pg_dump "$DATABASE_URL" -f backup_$(date +%F).dump` | `.dump` 文件存在 | ☐ |
| 4.3 | 种子数据就位 | `psql -d "$DATABASE_URL" -c "SELECT count(*) FROM prices;"` | >= 10 条 | ☐ |
| 4.4 | 数据库连接池 | 检查 `pgbouncer` 或 Prisma `connection_limit` 配置 | 连接数不超过上限的 80% | ☐ |
| 4.5 | 自动备份 cron | 检查 `/etc/crontab` 或云服务商定时任务 | 每日全量备份已配置 | ☐ |

---

## 五、支付（Lemon Squeezy）

| # | 检查项 | 操作 | 验证标准 | 勾选 |
|---|--------|------|----------|------|
| 5.1 | Webhook URL 已配置 | LS 后台 → Settings → Webhooks | URL 指向生产地址 | ☐ |
| 5.2 | Webhook 签名验证通过 | 用 LS 后台 "Send test" 发一个 `order_created` 事件 | 服务器日志显示 `[LS Webhook] received: order_created` | ☐ |
| 5.3 | Checkout 流程穿行 | 用测试卡 `4242 4242 4242 4242` 走完一单 | 成功重定向到 `redirect_url` | ☐ |
| 5.4 | 数据库 plan 更新验证 | `psql -d "$DATABASE_URL" -c "SELECT id, plan FROM users WHERE plan = 'PRO';"` | 出现 PRO 记录 | ☐ |
| 5.5 | 取消订阅测试 | 在 LS 后台取消订阅 | Webhook 触发，plan 降为 FREE | ☐ |
| 5.6 | Webhook 安全性 | 确认 `x-signature` 校验逻辑已启用 | 伪造请求返回 401 | ☐ |

---

## 六、监控 & 告警

| # | 检查项 | 操作 | 验证标准 | 勾选 |
|---|--------|------|----------|------|
| 6.1 | Uptime 监控 | 配置 UptimeRobot / Better Uptime / 阿里云云监控 | 5 分钟间隔，3 次失败触发告警 | ☐ |
| 6.2 | 错误日志可达 | 确认日志平台（Vercel Logs / Sentry / 自建 Loki）能收到日志 | 写入一条测试日志后能在平台搜到 | ☐ |
| 6.3 | 数据库连接告警 | 设置连接数 > 80% 时触发通知 | 告警通道已验证 | ☐ |
| 6.4 | SSL 过期告警 | 证书到期前 30 天 / 14 天 / 7 天各提醒一次 | 至少配置了邮箱通知 | ☐ |
| 6.5 | 服务器响应告警 | `curl` 响应时间 > 5s 时触发 | 告警通道已验证 | ☐ |

---

## 七、种子数据

生产环境至少需要以下种子数据才能给用户一个有意义的首页体验。

### 7.1 物价数据（必填）

```sql
-- 以目标城市坐标为准，下面以成都春熙路为例
INSERT INTO prices (id, product, unit, price, store_name, latitude, longitude, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, '大米（散装）',   '元/斤', 2.98,  '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '鸡蛋（10枚）',   '元/盒', 8.50,  '红旗连锁',  30.5730, 104.0650, NOW(), NOW()),
  (gen_random_uuid()::text, '猪五花肉',       '元/斤', 16.80, '钱大妈',    30.5700, 104.0680, NOW(), NOW()),
  (gen_random_uuid()::text, '蒙牛纯牛奶',     '元/箱', 49.90, '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '可口可乐 500ml', '元/瓶', 3.00,  '舞东风',   30.5740, 104.0640, NOW(), NOW()),
  (gen_random_uuid()::text, '康师傅方便面',   '元/袋', 2.50,  '红旗连锁',  30.5730, 104.0650, NOW(), NOW()),
  (gen_random_uuid()::text, '苹果（红富士）', '元/斤', 7.80,  '百果园',    30.5710, 104.0690, NOW(), NOW()),
  (gen_random_uuid()::text, '金龙鱼花生油',   '元/桶', 89.90, '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '豆腐（散装）',   '元/斤', 2.50,  '菜市场A',   30.5690, 104.0700, NOW(), NOW()),
  (gen_random_uuid()::text, '农夫山泉 550ml', '元/瓶', 1.50,  '全家',      30.5750, 104.0670, NOW(), NOW());
```

验证：

```bash
# 检查数据条数
psql "$DATABASE_URL" -c "SELECT count(*) FROM prices;"

# 测试 5km 搜索 API
curl "https://yourdomain.com/api/prices?lat=30.5728&lng=104.0668&radius=5"
# 期望返回 10 条数据
```

### 7.2 安全预警数据（可选，建议加几条展示功能）

```sql
INSERT INTO safety_reports (id, event_type, description, latitude, longitude, reported_at)
VALUES
  (gen_random_uuid()::text, 'THEFT',  '春熙路地铁口近期有多起手机被盗报告，请保管好随身物品', 30.5720, 104.0670, NOW()),
  (gen_random_uuid()::text, 'WEATHER', '未来 6 小时成都市区有暴雨预警，出行请注意安全',         30.5730, 104.0660, NOW());
```

---

## 八、安全基线

| # | 检查项 | 说明 | 勾选 |
|---|--------|------|------|
| 8.1 | 开发密钥已替换 | 确认 `.env.production` 中的密钥不是开发环境的占位符 | ☐ |
| 8.2 | 调试日志已关闭 | `NEXT_PUBLIC_DEBUG` 或类似变量在生产环境不存在 | ☐ |
| 8.3 | HTTPS 全覆盖 | 服务器或反向代理配置 HTTP → 301 → HTTPS | ☐ |
| 8.4 | 安全响应头 | 检查 `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` 已返回 | ☐ |
| 8.5 | CORS 限制 | API 路由的 `Access-Control-Allow-Origin` 未设为 `*`（除非公共 API） | ☐ |
| 8.6 | Rate Limiting | 注册 / 搜索等接口有速率限制（建议 10 req/min 未认证，60 req/min 已认证） | ☐ |
| 8.7 | 数据库连接串不含密码泄露 | `DATABASE_URL` 只出现在环境变量中，不在任何静态文件或 Git 中 | ☐ |

---

## 九、回滚准备

| # | 检查项 | 操作 | 勾选 |
|---|--------|------|------|
| 9.1 | 数据库备份 | `pg_dump` 备份已就位，存放在备份目录或对象存储 | ☐ |
| 9.2 | 回滚代码 | Vercel 支持一键回滚到上一个部署版本（Dashboard → Deployments → ⋮ → Promote to Production） | ☐ |
| 9.3 | 回滚数据库 | 如果迁移需要回退，确认有反向 SQL 脚本或备份 | ☐ |
| 9.4 | 回滚沟通 | 团队知道回滚决策流程：谁决策、谁执行、如何通知用户 | ☐ |

---

## 十、最终确认签名

```text
执行者签字：________________    日期：________________

验证者签字：________________    日期：________________
```

---

*本文件位于 docs/GO_LIVE_CHECKLIST.md，建议逐项操作并打勾。*
