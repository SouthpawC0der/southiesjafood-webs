import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { menuItems } from "@/lib/menu-data";
import { getLoyaltyAccount, reservePoints, releaseReservedPoints } from "@/db/loyalty";
import {
  MIN_REDEEM, REDEEM_UNIT, MAX_REDEEM_PCT, pointsToCents,
} from "@/lib/loyalty-config";

type CartItemPayload = { id: string; quantity: number };

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_CART_ITEMS        = 30;
const DELIVERY_MIN_CENTS    = 1000;
const DELIVERY_FEE_CENTS    = 300;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(`checkout:${ip}`, "checkout");
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to checkout." }, { status: 401 });
  }
  const user  = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawItems: CartItemPayload[] = Array.isArray(body.items) ? body.items : [];
  const specialInstructions = String(body.specialInstructions ?? "").slice(0, 500);
  const rawOrderType        = String(body.orderType ?? "pickup");
  const orderType: "pickup" | "delivery" =
    rawOrderType === "delivery" ? "delivery" : "pickup";

  // ── Order date (validated in Eastern Time) ────────────────────────────────
  const orderDate = String(body.orderDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) {
    return NextResponse.json({ error: "Please select an order date." }, { status: 400 });
  }
  // Use noon ET (T12:00:00-05:00 / -04:00) so the date is unambiguous regardless
  // of DST. Append a fixed noon local time and parse as ET to stay consistent
  // with the client-side getMinDate() which also uses America/New_York.
  const selectedDateMs = Date.parse(`${orderDate}T12:00:00`);
  const todayEtStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const todayMs    = Date.parse(`${todayEtStr}T00:00:00`);
  const maxMs      = todayMs + 60 * 24 * 60 * 60 * 1000;
  if (isNaN(selectedDateMs) || selectedDateMs < todayMs || selectedDateMs > maxMs) {
    return NextResponse.json({ error: "Invalid order date." }, { status: 400 });
  }

  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (rawItems.length > MAX_CART_ITEMS) {
    return NextResponse.json({ error: "Too many items in cart." }, { status: 400 });
  }

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const toAbsolute  = (img: string) => img.startsWith("http") ? img : `${appUrl}${img}`;

  // ── Server-side price validation ──────────────────────────────────────────
  let validatedItems: ReturnType<typeof buildLineItem>[];
  try {
    validatedItems = rawItems.map((item) => {
      const canonical = menuItems.find((m) => m.id === item.id);
      if (!canonical) throw new Error("invalid-item");
      const quantity = Math.min(Math.max(1, Math.floor(item.quantity)), MAX_QUANTITY_PER_ITEM);
      return buildLineItem(canonical, quantity, toAbsolute);
    });
  } catch (err) {
    const isKnown = err instanceof Error && err.message === "invalid-item";
    return NextResponse.json(
      { error: isKnown ? "Your cart contains an invalid item." : "Checkout failed. Please try again." },
      { status: 400 }
    );
  }

  const subtotal = validatedItems.reduce(
    (sum, i) => sum + i.price_data.unit_amount * i.quantity, 0
  );

  // ── Delivery fee ──────────────────────────────────────────────────────────
  if (orderType === "delivery" && subtotal < DELIVERY_MIN_CENTS) {
    return NextResponse.json(
      { error: "Delivery requires a $10.00 minimum order." }, { status: 400 }
    );
  }
  const addDelivery = orderType === "delivery" && subtotal >= DELIVERY_MIN_CENTS;
  const lineItems = addDelivery
    ? [...validatedItems, {
        price_data: {
          currency:     "usd",
          product_data: { name: "Delivery Fee", images: [] as string[] },
          unit_amount:  DELIVERY_FEE_CENTS,
        },
        quantity: 1,
      }]
    : validatedItems;

  // ── Points redemption (atomic reserve prevents TOCTOU race) ──────────────
  const rawPointsToRedeem = Math.floor(Number(body.pointsToRedeem ?? 0));
  let pointsToRedeem   = 0;
  let pointsPreDeducted = false;
  let couponId: string | undefined;

  if (rawPointsToRedeem >= MIN_REDEEM) {
    const rounded    = Math.floor(rawPointsToRedeem / REDEEM_UNIT) * REDEEM_UNIT;
    let account      = null;
    try { account = await getLoyaltyAccount(userId); } catch { /* DB not set up */ }

    const balance    = account?.points_balance ?? 0;
    const maxAllowed = Math.floor((subtotal * MAX_REDEEM_PCT) / REDEEM_UNIT) * REDEEM_UNIT;
    const clamped    = Math.min(rounded, balance, maxAllowed);

    if (clamped >= MIN_REDEEM) {
      // Atomically deduct from balance — prevents concurrent checkouts using the same points
      const reserved = await reservePoints(userId, clamped).catch(() => false);
      if (!reserved) {
        return NextResponse.json(
          { error: "Insufficient points balance. Please refresh and try again." },
          { status: 400 }
        );
      }
      pointsToRedeem    = clamped;
      pointsPreDeducted = true;
    }
  }

  // ── Compact item summary for webhook ──────────────────────────────────────
  const itemSummary = rawItems
    .map((i) => `${i.id}:${Math.min(Math.max(1, Math.floor(i.quantity)), MAX_QUANTITY_PER_ITEM)}`)
    .join(",");

  // ── Create Stripe coupon + session (clean up on failure) ──────────────────
  try {
    if (pointsToRedeem > 0) {
      const discountCents = pointsToCents(pointsToRedeem);
      const coupon = await getStripe().coupons.create({
        amount_off:      discountCents,
        currency:        "usd",
        duration:        "once",
        max_redemptions: 1,
        name:            `${pointsToRedeem} pts reward`,
      });
      couponId = coupon.id;
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "paypal", "cashapp"],
      line_items:           lineItems,
      mode:                 "payment",
      customer_email:       email,
      success_url:          `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           `${appUrl}/checkout`,
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      metadata: {
        clerkUserId: userId,
        items: itemSummary,
        specialInstructions: specialInstructions || "None",
        orderType,
        orderDate,
        pointsRedeemed:    String(pointsToRedeem),
        pointsPreDeducted: pointsPreDeducted ? "true" : "false",
      },
      payment_intent_data: {
        description: `Southie's Ja Foods — ${orderType === "delivery" ? "Delivery" : "To-Go"} Order`,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    // Clean up on failure: delete orphaned coupon and restore pre-deducted points
    if (couponId) {
      await getStripe().coupons.del(couponId).catch((e) =>
        console.error("[checkout] failed to delete orphaned coupon", couponId, e)
      );
    }
    if (pointsPreDeducted && pointsToRedeem > 0) {
      await releaseReservedPoints(userId, pointsToRedeem).catch((e) =>
        console.error("[checkout] failed to restore reserved points", e)
      );
    }
    console.error("[checkout] session error:", err);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 400 }
    );
  }
}

function buildLineItem(
  canonical: { name: string; description: string; image: string; price: number },
  quantity: number,
  toAbsolute: (img: string) => string
) {
  return {
    price_data: {
      currency:     "usd",
      product_data: {
        name:        canonical.name,
        description: canonical.description.slice(0, 200),
        images:      [toAbsolute(canonical.image)],
      },
      unit_amount: canonical.price,
    },
    quantity,
  };
}
