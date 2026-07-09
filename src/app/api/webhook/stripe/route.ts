import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { menuItems } from "@/lib/menu-data";
import { createOrderFromWebhook } from "@/db";
import type Stripe from "stripe";

export const runtime = "nodejs";

// This handler only processes PayPal payments routed through Stripe.
// Card / Apple Pay / Google Pay / Cash App go through Square.

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
    event = getStripe().webhooks.constructEvent(Buffer.from(body), signature, webhookSecret);
  } catch (err) {
    console.error("[webhook/stripe] signature failed:", err);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata ?? {};

    const clerkUserId = meta.clerkUserId;
    if (!clerkUserId) {
      console.error("[webhook/stripe] missing clerkUserId", session.id);
      return NextResponse.json({ received: true });
    }

    // Re-derive items from canonical menu data
    const items = (meta.items ?? "")
      .split(",")
      .filter(Boolean)
      .flatMap((pair) => {
        const [id, qtyRaw] = pair.split(":");
        const canonical    = menuItems.find((m) => m.id === id);
        const quantity     = parseInt(qtyRaw, 10);
        if (!canonical || !Number.isFinite(quantity) || quantity < 1) return [];
        return [{
          menuItemId: canonical.id,
          name:       canonical.name,
          priceCents: canonical.price,
          quantity:   Math.min(quantity, 20),
        }];
      });

    const subtotal = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

    try {
      await createOrderFromWebhook({
        clerkUserId,
        email:               session.customer_details?.email ?? null,
        stripeSessionId:     session.id,
        stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        subtotalCents:       subtotal,
        totalCents:          session.amount_total ?? subtotal,
        specialInstructions:
          meta.specialInstructions && meta.specialInstructions !== "None"
            ? meta.specialInstructions
            : null,
        items,
      });
    } catch (err) {
      console.error("[webhook/stripe] failed to persist order", session.id, err);
      return NextResponse.json({ error: "Order persistence failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
