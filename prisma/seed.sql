-- 物价比价 - 数据库初始化（可重复运行）
-- 在 Supabase SQL Editor 中执行一次即可

-- 1. 创建枚举（已存在则跳过）
DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM ('暴乱', '盗窃', '天气');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. 创建表（已存在则跳过）
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "lemon_squeezy_customer_id" TEXT UNIQUE,
    "paypal_order_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "prices" (
    "id" TEXT PRIMARY KEY,
    "product" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '元/斤',
    "price" DECIMAL(12,2) NOT NULL,
    "store_name" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "safety_reports" (
    "id" TEXT PRIMARY KEY,
    "event_type" "EventType" NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reported_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "reporter_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. 索引（已存在则跳过）
CREATE INDEX IF NOT EXISTS "prices_lat_lng_idx" ON "prices" ("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "safety_reports_lat_lng_idx" ON "safety_reports" ("latitude", "longitude");

-- 4. 插入物价数据（重复数据自动跳过）
INSERT INTO "prices" ("id", "product", "unit", "price", "store_name", "latitude", "longitude", "created_at", "updated_at")
SELECT * FROM (VALUES
  (gen_random_uuid()::text, '大米（散装）',   '元/斤', 2.98,  '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '鸡蛋（10枚）',   '元/盒', 8.50,  '红旗连锁',  30.5730, 104.0650, NOW(), NOW()),
  (gen_random_uuid()::text, '猪五花肉',       '元/斤', 16.80, '钱大妈',    30.5700, 104.0680, NOW(), NOW()),
  (gen_random_uuid()::text, '蒙牛纯牛奶',     '元/箱', 49.90, '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '可口可乐 500ml', '元/瓶', 3.00,  '舞东风',   30.5740, 104.0640, NOW(), NOW()),
  (gen_random_uuid()::text, '康师傅方便面',   '元/袋', 2.50,  '红旗连锁',  30.5730, 104.0650, NOW(), NOW()),
  (gen_random_uuid()::text, '苹果（红富士）', '元/斤', 7.80,  '百果园',    30.5710, 104.0690, NOW(), NOW()),
  (gen_random_uuid()::text, '金龙鱼花生油',   '元/桶', 89.90, '永辉超市',  30.5728, 104.0668, NOW(), NOW()),
  (gen_random_uuid()::text, '豆腐（散装）',   '元/斤', 2.50,  '菜市场A',   30.5690, 104.0700, NOW(), NOW()),
  (gen_random_uuid()::text, '农夫山泉 550ml', '元/瓶', 1.50,  '全家',      30.5750, 104.0670, NOW(), NOW())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM "prices" LIMIT 1);

-- 5. 插入安全预警数据
INSERT INTO "safety_reports" ("id", "event_type", "description", "latitude", "longitude", "reported_at")
SELECT * FROM (VALUES
  (gen_random_uuid()::text, 'THEFT',  '春熙路地铁口近期有多起手机被盗报告，请保管好随身物品', 30.5720, 104.0670, NOW()),
  (gen_random_uuid()::text, 'WEATHER', '未来 6 小时成都市区有暴雨预警，出行请注意安全',         30.5730, 104.0660, NOW())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM "safety_reports" LIMIT 1);
