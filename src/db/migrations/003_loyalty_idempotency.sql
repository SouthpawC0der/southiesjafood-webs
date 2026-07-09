-- Prevents duplicate loyalty transaction rows for the same Stripe session.
-- NULL stripe_session_id values are excluded from uniqueness (Postgres NULL != NULL).
-- Run in Neon console: neon.tech → your project → SQL editor

ALTER TABLE loyalty_transactions
  ADD CONSTRAINT uq_loyalty_tx_session_type UNIQUE (stripe_session_id, type);
