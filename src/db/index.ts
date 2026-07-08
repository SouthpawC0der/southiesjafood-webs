import { neon } from "@neondatabase/serverless";

/**
 * Neon serverless Postgres client.
 * DATABASE_URL is set by the Vercel/Neon integration (never hardcoded).
 */
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

/* ── Types ────────────────────────────────────────────────────────────────── */

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type OrderRow = {
  id: string;
  clerk_user_id: string;
  email: string | null;
  stripe_session_id: string;
  status: OrderStatus;
  subtotal_cents: number;
  total_cents: number;
  special_instructions: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price_cents: number;
  quantity: number;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

/* ── Queries ──────────────────────────────────────────────────────────────── */

/**
 * Fetch a user's orders (newest first) with their line items.
 * Always scoped by clerk_user_id — the caller passes the verified session
 * user ID sourced from auth(), never from client input.
 */
export async function getOrdersForUser(clerkUserId: string): Promise<OrderWithItems[]> {
  const sql = getSql();

  const orders = (await sql`
    SELECT id, clerk_user_id, email, stripe_session_id, status,
           subtotal_cents, total_cents, special_instructions, created_at
    FROM orders
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
    LIMIT 50
  `) as OrderRow[];

  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const items = (await sql`
    SELECT id, order_id, menu_item_id, name, price_cents, quantity
    FROM order_items
    WHERE order_id = ANY(${ids})
  `) as OrderItemRow[];

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of items) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }

  return orders.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
}

/**
 * Persist a paid order from the Stripe webhook (the only write path for orders).
 * Idempotent on stripe_session_id — Stripe may deliver a webhook more than once.
 */
export async function createOrderFromWebhook(params: {
  clerkUserId: string;
  email: string | null;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
  subtotalCents: number;
  totalCents: number;
  specialInstructions: string | null;
  items: Array<{ menuItemId: string; name: string; priceCents: number; quantity: number }>;
}): Promise<void> {
  const sql = getSql();

  const inserted = (await sql`
    INSERT INTO orders (
      clerk_user_id, email, stripe_session_id, stripe_payment_intent,
      status, subtotal_cents, total_cents, special_instructions
    ) VALUES (
      ${params.clerkUserId}, ${params.email}, ${params.stripeSessionId},
      ${params.stripePaymentIntent}, 'paid', ${params.subtotalCents},
      ${params.totalCents}, ${params.specialInstructions}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING id
  `) as Array<{ id: string }>;

  // Duplicate webhook delivery — order already recorded
  if (inserted.length === 0) return;

  const orderId = inserted[0].id;
  for (const item of params.items) {
    await sql`
      INSERT INTO order_items (order_id, menu_item_id, name, price_cents, quantity)
      VALUES (${orderId}, ${item.menuItemId}, ${item.name}, ${item.priceCents}, ${item.quantity})
    `;
  }
}
