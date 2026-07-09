import { NextRequest, NextResponse } from "next/server";
import { WebhooksHelper } from "square";
import { getSquare, getLocationId } from "@/lib/square";
import { menuItems } from "@/lib/menu-data";
import { createOrderFromWebhook } from "@/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";

  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (signatureKey) {
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/square`;
    const isValid = await WebhooksHelper.verifySignature({
      requestBody:     rawBody,
      signatureHeader: signature,
      signatureKey,
      notificationUrl,
    });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (event.type === "payment.completed") {
    const data    = event.data as Record<string, unknown>;
    const obj     = data?.object as Record<string, unknown>;
    const payment = obj?.payment as Record<string, unknown>;

    if (!payment) return NextResponse.json({ received: true });

    const squareOrderId = payment.order_id             as string | undefined;
    const paymentId     = payment.id                   as string | undefined;
    const buyerEmail    = payment.buyer_email_address  as string | null ?? null;
    const amountMoney   = payment.amount_money         as { amount?: number } | undefined;
    const totalCents    = Number(amountMoney?.amount ?? 0);

    if (!squareOrderId || !paymentId) return NextResponse.json({ received: true });

    try {
      // Retrieve order for line items + metadata
      const orderResponse = await getSquare().orders.get({ orderId: squareOrderId });
      const order = orderResponse.order;
      if (!order) return NextResponse.json({ received: true });

      const meta        = order.metadata ?? {};
      const clerkUserId = meta.clerk_user_id;
      const specialInstructions =
        meta.special_instructions && meta.special_instructions !== "None"
          ? meta.special_instructions
          : null;

      if (!clerkUserId) {
        console.error("[webhook/square] order missing clerk_user_id", squareOrderId);
        return NextResponse.json({ received: true });
      }

      // Re-derive prices from canonical menu data
      const items = (order.lineItems ?? []).flatMap((li) => {
        const canonical = menuItems.find((m) => m.name === li.name);
        const quantity  = parseInt(li.quantity ?? "1", 10);
        if (!canonical || !Number.isFinite(quantity) || quantity < 1) return [];
        return [{
          menuItemId: canonical.id,
          name:       canonical.name,
          priceCents: canonical.price,
          quantity:   Math.min(quantity, 20),
        }];
      });

      const subtotal = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

      await createOrderFromWebhook({
        clerkUserId,
        email:               buyerEmail,
        stripeSessionId:     `sq_${squareOrderId}`,
        stripePaymentIntent: paymentId,
        subtotalCents:       subtotal,
        totalCents:          totalCents || subtotal,
        specialInstructions,
        items,
      });

      // ── Award Square Loyalty points via Customer ID ───────────────────────
      // Square loyalty accounts are linked to customers, not emails directly.
      // We find/create the Square Customer, then accumulate on their loyalty account.
      if (buyerEmail) {
        accumulateLoyaltyPoints(buyerEmail, squareOrderId).catch((err) =>
          console.error("[webhook/square] loyalty error", squareOrderId, err)
        );
      }
    } catch (err) {
      console.error("[webhook/square] error processing payment", squareOrderId, err);
      return NextResponse.json({ error: "Processing failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function accumulateLoyaltyPoints(email: string, orderId: string): Promise<void> {
  const square   = getSquare();
  const location = getLocationId();

  // Find Square Customer by email
  const customerSearch = await square.customers.search({
    query: { filter: { emailAddress: { exact: email } } },
  });
  const customerId = customerSearch.customers?.[0]?.id;
  if (!customerId) return; // customer not in Square yet — loyalty not linked

  // Find loyalty account by customer ID
  const loyaltySearch = await square.loyalty.accounts.search({
    query: { customerIds: [customerId] },
  });
  const loyaltyAccountId = loyaltySearch.loyaltyAccounts?.[0]?.id;
  if (!loyaltyAccountId) return; // not enrolled in loyalty

  await square.loyalty.accounts.accumulatePoints({
    accountId:        loyaltyAccountId,
    accumulatePoints: { orderId },
    idempotencyKey:   `acc_${orderId}`,
    locationId:       location,
  });
}
