-- ─── Southie's Ja Foods — PostgreSQL Schema ──────────────────────────────────
-- Target: Neon Postgres (Vercel Marketplace)
-- Run with: psql $DATABASE_URL -f src/db/schema.sql
--
-- Users live in Clerk; this database stores orders keyed by the Clerk user ID.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Orders ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'paid', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id         TEXT NOT NULL,              -- Clerk user ID (user_xxx)
  email                 TEXT,
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  status                order_status NOT NULL DEFAULT 'pending',
  subtotal_cents        INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  total_cents           INTEGER NOT NULL CHECK (total_cents >= 0),
  special_instructions  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Order items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,                       -- matches MenuItem.id in menu-data.ts
  name         TEXT NOT NULL,
  price_cents  INTEGER NOT NULL CHECK (price_cents > 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 20),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Defense in depth: even if app code has a bug, a session scoped to one user
-- can never read another user's rows. The app sets `app.clerk_user_id` per
-- request (see src/db/index.ts); the webhook uses the bypass role.

ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON orders      TO app_user;
GRANT SELECT, INSERT         ON order_items TO app_user;

DROP POLICY IF EXISTS orders_owner ON orders;
CREATE POLICY orders_owner ON orders
  FOR ALL TO app_user
  USING (clerk_user_id = current_setting('app.clerk_user_id', TRUE));

DROP POLICY IF EXISTS order_items_owner ON order_items;
CREATE POLICY order_items_owner ON order_items
  FOR ALL TO app_user
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE clerk_user_id = current_setting('app.clerk_user_id', TRUE)
    )
  );

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id  ON orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON order_items(order_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
