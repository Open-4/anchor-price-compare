# 环境变量清单

> 最后更新：2026-06-18
> 适用范围：生产环境部署（Vercel / 自建服务器）

---

## 一、数据库与缓存

### `DATABASE_URL`

| 属性 | 值 |
|------|-----|
| **用途** | Prisma 连接 PostgreSQL 的连接字符串 |
| **必填** | 是 |
| **示例** | `postgresql://anchor:password@prod-db-host:5432/anchor?schema=public&connection_limit=10&pool_timeout=10` |
| **获取方式** | 数据库托管商（AWS RDS / Supabase / Neon / 自建 Postgres）的控制台提供连接串 |
| **注意事项** | 生产环境建议加 `connection_limit` 和 `pool_timeout` 参数，避免连接池耗尽 |

### `REDIS_URL`

| 属性 | 值 |
|------|-----|
| **用途** | Redis 连接字符串，用于会话缓存和限流计数器 |
| **必填** | 否（缓存降级仍可运行，但前 100 名半价计数器精度会下降） |
| **示例** | `redis://:password@redis-host:6379` |
| **获取方式** | Redis 托管商（Upstash / Redis Cloud / 自建）控制台 |

---

## 二、身份认证

### `NEXTAUTH_URL`

| 属性 | 值 |
|------|-----|
| **用途** | NextAuth.js 回调域名，OAuth 流程跳转地址 |
| **必填** | 是（如果使用 NextAuth） |
| **示例** | `https://yourdomain.com` |
| **获取方式** | 你的生产域名，注意末尾**不要**加斜杠 |

### `NEXTAUTH_SECRET`

| 属性 | 值 |
|------|-----|
| **用途** | NextAuth 加密 JWT 和会话 Cookie 的密钥 |
| **必填** | 是 |
| **示例** | `openssl rand -base64 32` 的输出 |
| **获取方式** | 终端运行 `openssl rand -base64 32` 或访问 https://generate-secret.vercel.app/32 |
| **注意事项** | 一旦生成、用到生产后**不要更换**，否则所有活跃会话会立即失效 |

---

## 三、支付（Lemon Squeezy）

### `LEMONSQUEEZY_API_KEY`

| 属性 | 值 |
|------|-----|
| **用途** | 调用 Lemon Squeezy API 创建 Checkout 会话的凭据 |
| **必填** | 是 |
| **获取方式** | Lemon Squeezy 后台 → Settings → API Keys → 生成密钥（Store API Key） |

### `LEMONSQUEEZY_STORE_ID`

| 属性 | 值 |
|------|-----|
| **用途** | 标识你的商店，API 创建 Checkout 时需传入 |
| **必填** | 是 |
| **获取方式** | Lemon Squeezy 后台 → 进入你的 Store → URL 末尾的数字即 Store ID，例如 `https://app.lemonsqueezy.com/stores/12345` 中的 `12345` |

### `LEMONSQUEEZY_WEBHOOK_SECRET`

| 属性 | 值 |
|------|-----|
| **用途** | 验证 Webhook 请求来源确实是 Lemon Squeezy（HMAC-SHA256 签名验证） |
| **必填** | 是 |
| **获取方式** | LS 后台 → Settings → Webhooks → 创建 Webhook → 生成 Signing Secret |
| **安全性** | 此密钥出现在每次 Webhook 请求的 `X-Signature` 头中，服务端需要用它做签名校验 |

---

## 四、应用配置

### `SESSION_SECRET`

| 属性 | 值 |
|------|-----|
| **用途** | 自建 Session / Cookie 加密密钥（非 NextAuth 场景） |
| **必填** | 否（如使用 NextAuth 则 `NEXTAUTH_SECRET` 替代） |
| **生成** | `openssl rand -hex 32` |

### `NODE_ENV`

| 属性 | 值 |
|------|-----|
| **用途** | 环境标识，Vercel 自动设置为 `production` |
| **必填** | 否（Vercel 会自动设置） |
| **值** | `development` / `production` |

---

## 五、Docker 专属变量（自建服务器场景）

以下变量在 `docker-compose.prod.yml` 中使用：

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `POSTGRES_USER` | `anchor` | Postgres 用户名 |
| `POSTGRES_PASSWORD` | 无默认，必填 | Postgres 密码 |
| `POSTGRES_DB` | `anchor` | Postgres 数据库名 |
| `PORT` | `3000` | Node.js 监听端口 |

---

## 六、数据库迁移方案

### 安全步骤（生产环境）

```bash
# 1. 备份数据库
pg_dump "$DATABASE_URL" --no-owner --format=custom -f /tmp/pre_migration_backup.dump

# 2. 生成迁移文件（本地开发环境执行）
npx prisma migrate dev --name describe_your_change

# 3. 提交迁移文件到 Git（generated 目录 /prisma/migrations/）
git add prisma/migrations/
git commit -m "feat(db): add X table"

# 4. 生产环境执行迁移（CI/CD 或手动）
npx prisma migrate deploy

# 5. 生成新版 Prisma Client
npx prisma generate
```

### 原则

- **生产环境永远 `migrate deploy` 而不是 `migrate dev`**。`migrate dev` 包含重置数据库的风险，`deploy` 只应用未执行的迁移
- 迁移文件必须**先提交到 Git 再部署**，保证可追溯
- 不要在迁移中删除列（可以 rename 或 deprecate），便于回滚

### 回滚预案

| 场景 | 操作 |
|------|------|
| 迁移执行后应用崩溃 | 1. 立即停止应用<br>2. 用 pg_restore 还原备份<br>3. 回退代码版本重新部署 |
| 迁移失败（如外键冲突） | `prisma migrate deploy` 会报错终止，数据库状态不变。修复迁移文件后重新提交 |
| 需要撤销最近一次迁移 | 手动写一条 `migration.sql` 反转 DDL，执行后提交到 Git 作为新的迁移版本 |

### 备份恢复示例

```bash
# 从备份恢复
pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" /tmp/pre_migration_backup.dump

# 标记某次迁移为已回滚（极端情况）
npx prisma migrate resolve --rolled-back "20260618000000_my_migration"
```
