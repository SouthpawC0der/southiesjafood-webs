"use client";

import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function ProfileSettings() {
  return (
    <UserProfile
      routing="hash"
      appearance={clerkAppearance}
    />
  );
}
