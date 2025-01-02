"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { isProduction } from "@/utils/misc";

if (typeof window !== "undefined" && isProduction) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "always",
  });
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
