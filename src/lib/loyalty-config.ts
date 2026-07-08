// ── Points earning ────────────────────────────────────────────────────────────
export const POINTS_PER_DOLLAR = 10; // base earn rate per $1 of order paid

// ── Tiers (based on lifetime points earned, never decrements) ─────────────────
export const TIERS = [
  { name: "Gold",   min: 3000, multiplier: 1.5, label: "1.5× points every order" },
  { name: "Silver", min: 1000, multiplier: 1.2, label: "1.2× points every order" },
  { name: "Bronze", min: 0,    multiplier: 1.0, label: "10 pts per $1 spent"      },
] as const;

export type TierName = "Gold" | "Silver" | "Bronze";

// ── Redemption ────────────────────────────────────────────────────────────────
export const REDEEM_UNIT = 100;       // 100 points = $1 off (1 pt = 1 ¢)
export const MIN_REDEEM  = 500;       // minimum 500 pts ($5) to redeem
export const MAX_REDEEM_PCT = 0.5;    // can redeem up to 50 % of subtotal

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getTier(lifetimeEarned: number) {
  return TIERS.find((t) => lifetimeEarned >= t.min) ?? TIERS[TIERS.length - 1];
}

/** Next tier above current, or null if already at the top. */
export function getNextTier(lifetimeEarned: number) {
  const idx = TIERS.findIndex((t) => lifetimeEarned >= t.min);
  return idx > 0 ? TIERS[idx - 1] : null;
}

/** Points earned for a completed order (amount in cents). */
export function calcPointsEarned(amountPaidCents: number, lifetimeEarned: number): number {
  const { multiplier } = getTier(lifetimeEarned);
  return Math.floor((amountPaidCents / 100) * POINTS_PER_DOLLAR * multiplier);
}

/** Cent value of a points amount (must already be a multiple of REDEEM_UNIT). */
export function pointsToCents(points: number): number {
  return Math.floor(points / REDEEM_UNIT) * REDEEM_UNIT; // 100 pts → 100 ¢ → $1
}

/** Largest multiple of REDEEM_UNIT a user can apply given their balance and order subtotal. */
export function maxRedeemable(balance: number, subtotalCents: number): number {
  const capByBalance = Math.floor(balance / REDEEM_UNIT) * REDEEM_UNIT;
  const capByOrder   = Math.floor((subtotalCents * MAX_REDEEM_PCT) / REDEEM_UNIT) * REDEEM_UNIT;
  return Math.min(capByBalance, capByOrder);
}

/** Tier-progress percentage toward the next tier (0–100). */
export function tierProgress(lifetimeEarned: number): number {
  const current = getTier(lifetimeEarned);
  const next    = getNextTier(lifetimeEarned);
  if (!next) return 100; // already Gold
  const range = next.min - current.min;
  return Math.min(100, Math.round(((lifetimeEarned - current.min) / range) * 100));
}
