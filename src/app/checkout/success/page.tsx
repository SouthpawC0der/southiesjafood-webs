import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import SuccessContent from "./SuccessContent";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/menu");

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Verify the session belongs to this user before showing the success page.
  // redirect() is intentionally outside try so NEXT_REDIRECT is never swallowed.
  let verified = false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(session_id);
    verified =
      session.payment_status === "paid" &&
      session.metadata?.clerkUserId === userId;
  } catch {
    // Stripe API error — treat as unverified
  }

  if (!verified) redirect("/menu");

  return <SuccessContent />;
}
