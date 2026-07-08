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

  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const session = await getStripe().checkout.sessions.retrieve(session_id);

    if (
      session.payment_status !== "paid" ||
      session.metadata?.clerkUserId !== userId
    ) {
      redirect("/menu");
    }
  } catch {
    redirect("/menu");
  }

  return <SuccessContent />;
}
