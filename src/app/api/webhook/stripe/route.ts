import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { menuItems } from "@/lib/menu-data";
import { createOrderFromWebhook } from "@/db";
import { awardAndDeductPoints, getLoyaltyAccount } from "@/db/loyalty";
import { calcPointsEarned } from "@/lib/loyalty-config";
import type Stripe from "stripe";

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
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta    = session.metadata ?? {};

      const clerkUserId = meta.clerkUserId;
      if (!clerkUserId) {
        console.error("Webhook: session missing clerkUserId", session.id);
        break;
      }

      // ── Re-derive line items from canonical menu data ──────────────────────
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

      const subtotal = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

      // ── Persist order ──────────────────────────────────────────────────────
      let orderInserted = false;
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
        orderInserted = true;
      } catch (err) {
        console.error("Webhook: failed to persist order", session.id, err);
        return NextResponse.json({ error: "Order persistence failed." }, { status: 500 });
      }

      // ── Award loyalty points ───────────────────────────────────────────────
      if (orderInserted) {
        try {
          const amountPaid      = session.amount_total ?? 0;
          const pointsRedeemed  = Math.max(0, parseInt(meta.pointsRedeemed ?? "0", 10));
          // Lifetime earned determines tier multiplier for this order
          const existing        = await getLoyaltyAccount(clerkUserId).catch(() => null);
          const lifetimeEarned  = existing?.points_earned_total ?? 0;
          const pointsEarned    = calcPointsEarned(amountPaid, lifetimeEarned);

          const orderSummary = items
            .map((i) => `${i.quantity}× ${i.name}`)
            .join(", ")
            .slice(0, 200);

          await awardAndDeductPoints({
            clerkUserId,
            pointsEarned,
            pointsRedeemed,
            stripeSessionId:  session.id,
            orderDescription: `Order: ${orderSummary}`,
          });
        } catch (err) {
          // Points failure must NOT fail the webhook — order is already recorded
          console.error("Webhook: loyalty points error", session.id, err);
        }
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
