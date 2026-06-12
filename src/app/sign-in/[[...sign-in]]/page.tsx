import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = { title: "Sign In | Southie's Ja Foods" };

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] pt-[76px] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-14">
        <div className="text-center mb-8">
          <span className="kicker text-[var(--green)] mb-3 inline-flex">Welcome Back</span>
          <h1 className="font-display text-5xl text-[var(--ink)] leading-none">Sign In</h1>
        </div>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}
