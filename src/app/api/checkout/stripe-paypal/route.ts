import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { menuItems } from "@/lib/menu-data";

type CartItemPayload = { id: string; quantity: number };

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_CART_ITEMS        = 30;

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

  // ── Order date (Eastern Time) ─────────────────────────────────────────────
  const orderDate = String(body.orderDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) {
    return NextResponse.json({ error: "Please select an order date." }, { status: 400 });
  }
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

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const toAbsolute = (img: string) => img.startsWith("http") ? img : `${appUrl}${img}`;

  // ── Server-side price validation ──────────────────────────────────────────
  const validatedItems = [];
  const itemSummary: string[] = [];

  for (const item of rawItems) {
    const canonical = menuItems.find((m) => m.id === item.id);
    if (!canonical) {
      return NextResponse.json({ error: "Your cart contains an invalid item." }, { status: 400 });
    }
    const quantity = Math.min(Math.max(1, Math.floor(item.quantity)), MAX_QUANTITY_PER_ITEM);
    validatedItems.push({
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
    });
    itemSummary.push(`${canonical.id}:${quantity}`);
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["paypal"],
      line_items:           validatedItems,
      mode:                 "payment",
      customer_email:       email,
      success_url:          `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           `${appUrl}/checkout`,
      metadata: {
        clerkUserId:         userId,
        items:               itemSummary.join(","),
        specialInstructions: specialInstructions || "None",
        orderDate,
        paymentMethod:       "paypal",
      },
      payment_intent_data: {
        description: "Southie's Ja Foods — To-Go Order (PayPal)",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[checkout/stripe-paypal]", err);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 400 });
  }
}
