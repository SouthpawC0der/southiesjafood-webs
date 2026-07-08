-- Run this in your Neon console: neon.tech → your project → SQL editor

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id         TEXT        UNIQUE NOT NULL,
  points_balance        INTEGER     NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  points_earned_total   INTEGER     NOT NULL DEFAULT 0,
  points_redeemed_total INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id     TEXT        NOT NULL,
  type              TEXT        NOT NULL CHECK (type IN ('earn', 'redeem')),
  points            INTEGER     NOT NULL,       -- positive = earned, negative = redeemed
  balance_after     INTEGER     NOT NULL,
  description       TEXT        NOT NULL,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_user_date
  ON loyalty_transactions (clerk_user_id, created_at DESC);
