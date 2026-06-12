import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = { title: "Create Account | Southie's Ja Foods" };

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] pt-[76px] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-14">
        <div className="text-center mb-8">
          <span className="kicker text-[var(--green)] mb-3 inline-flex">Join the Family</span>
          <h1 className="font-display text-5xl text-[var(--ink)] leading-none">Create Account</h1>
        </div>
        <SignUp appearance={clerkAppearance} />
      </div>
    </div>
  );
}
