import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { getSquare } from "@/lib/square";
import SuccessContent from "./SuccessContent";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; orderId?: string }>;
}) {
  const { session_id, orderId } = await searchParams;

  if (!session_id && !orderId) redirect("/menu");

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let verified = false;

  if (session_id) {
    // ── Stripe PayPal flow ──────────────────────────────────────────────────
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      verified =
        session.payment_status === "paid" &&
        session.metadata?.clerkUserId === userId;
    } catch {
      // Stripe API error — treat as unverified
    }
  } else if (orderId) {
    // ── Square flow ─────────────────────────────────────────────────────────
    try {
      const response = await getSquare().orders.get({ orderId });
      const order = response.order;
      verified =
        order?.state === "COMPLETED" &&
        order?.metadata?.clerk_user_id === userId;
    } catch {
      // Square API error — treat as unverified
    }
  }

  if (!verified) redirect("/menu");

  return <SuccessContent />;
}
