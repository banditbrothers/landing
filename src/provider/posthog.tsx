"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { isProduction } from "@/utils/misc";

if (typeof window !== "undefined" && isProduction) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/bb-r", // reverse proxy, see next.config.ts rewrites
    ui_host: "https://us.posthog.com",
    capture_pageview: "history_change", // App Router navigations are client-side
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage",
    person_profiles: "always",
  });
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
