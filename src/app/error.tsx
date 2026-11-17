"use client";

import { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { CONTACT, displayTitle } from "@/components/layouts/InfoPageLayout";

// Catches render errors below the root layout, so the navbar and footer stay up.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    posthog.captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-24">
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Error 500 · Something broke</p>
      <h1 className={`${displayTitle} text-[17vw] md:text-[clamp(4.5rem,10vw,9rem)]`}>
        We tripped
        <br />
        <span className="text-bandit-orange">the alarm.</span>
      </h1>
      <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
        Something went wrong on our end. Give it another go; if it keeps happening, tell us on WhatsApp and we&apos;ll
        sort it out.
      </p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <button
          onClick={reset}
          className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110">
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl border border-border font-semibold transition-colors hover:border-foreground">
          Back to home
        </Link>
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center h-12 md:h-14 px-6 rounded-xl border border-border font-semibold transition-colors hover:border-foreground">
          WhatsApp us
        </a>
      </div>
      {error.digest && <p className="mt-10 text-xs text-muted-foreground font-mono">Ref: {error.digest}</p>}
    </div>
  );
}
