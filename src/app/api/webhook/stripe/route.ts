import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { menuItems } from "@/lib/menu-data";
import { createOrderFromWebhook } from "@/db";
import type Stripe from "stripe";

// Raw body needed for Stripe signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.arrayBuffer();

  try {
    event = getStripe().webhooks.constructEvent(
      Buffer.from(body),
      signature,
      webhookSecret
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};

      const clerkUserId = meta.clerkUserId;
      if (!clerkUserId) {
        // Payment not tied to an account — log and acknowledge so Stripe stops retrying
        console.error("Webhook: session missing clerkUserId", session.id);
        break;
      }

      // Re-derive line items from canonical menu data (id:qty pairs in metadata)
      const items = (meta.items ?? "")
        .split(",")
        .filter(Boolean)
        .flatMap((pair) => {
          const [id, qtyRaw] = pair.split(":");
          const canonical = menuItems.find((m) => m.id === id);
          const quantity = parseInt(qtyRaw, 10);
          if (!canonical || !Number.isFinite(quantity) || quantity < 1) return [];
          return [{
            menuItemId: canonical.id,
            name: canonical.name,
            priceCents: canonical.price,
            quantity: Math.min(quantity, 20),
          }];
        });

      const subtotal = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

      try {
        await createOrderFromWebhook({
          clerkUserId,
          email: session.customer_details?.email ?? null,
          stripeSessionId: session.id,
          stripePaymentIntent:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          subtotalCents: subtotal,
          totalCents: session.amount_total ?? subtotal,
          specialInstructions:
            meta.specialInstructions && meta.specialInstructions !== "None"
              ? meta.specialInstructions
              : null,
          items,
        });
      } catch (err) {
        console.error("Webhook: failed to persist order", session.id, err);
        // 500 so Stripe retries — the insert is idempotent on stripe_session_id
        return NextResponse.json({ error: "Order persistence failed." }, { status: 500 });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", intent.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
