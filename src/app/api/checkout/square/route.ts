import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSquare, getLocationId } from "@/lib/square";
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

  // ── Server-side price validation ──────────────────────────────────────────
  type LineItem = {
    name: string;
    quantity: string;
    basePriceMoney: { amount: bigint; currency: "USD" };
    note?: string;
  };

  const lineItems: LineItem[] = [];
  for (const item of rawItems) {
    const canonical = menuItems.find((m) => m.id === item.id);
    if (!canonical) {
      return NextResponse.json({ error: "Your cart contains an invalid item." }, { status: 400 });
    }
    const quantity = Math.min(Math.max(1, Math.floor(item.quantity)), MAX_QUANTITY_PER_ITEM);
    lineItems.push({
      name:     canonical.name,
      quantity: String(quantity),
      basePriceMoney: {
        amount:   BigInt(canonical.price),
        currency: "USD",
      },
      note: canonical.description.slice(0, 100),
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const response = await getSquare().checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId: getLocationId(),
        lineItems,
        // Store order context so the webhook can record it correctly
        metadata: {
          clerk_user_id:        userId,
          order_date:           orderDate,
          special_instructions: (specialInstructions || "None").slice(0, 255),
        },
        ...(email ? { fulfillments: [] } : {}),
        referenceId: userId.slice(0, 40),
        ...(specialInstructions ? { note: `Note: ${specialInstructions.slice(0, 500)}` } : {}),
      },
      checkoutOptions: {
        redirectUrl:            `${appUrl}/checkout/success`,
        askForShippingAddress:  false,
        merchantSupportEmail:   "eats@southiesjafood.com",
        acceptedPaymentMethods: {
          applePay:   true,
          googlePay:  true,
          cashAppPay: true,
        },
      },
      ...(email ? { prePopulatedData: { buyerEmail: email } } : {}),
    });

    const url = response.paymentLink?.url;
    if (!url) throw new Error("No payment link URL returned from Square.");

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("[checkout/square]", err);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 400 });
  }
}
