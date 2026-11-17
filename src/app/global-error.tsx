"use client";

import "./globals.css";
import { useEffect } from "react";
import posthog from "posthog-js";

// Last resort: the root layout itself crashed, so no navbar, fonts or providers. Keep it self-contained.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
    posthog.captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Bandit Brothers</p>
          <h1 className="text-4xl font-bold">
            We tripped <span className="text-bandit-orange">the alarm.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">Something went wrong on our end. Reload, or come back in a bit.</p>
          {/* Plain <a>, not Link: a full reload is what recovers from a root layout crash. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="mt-8 inline-flex items-center h-12 px-6 rounded-xl bg-bandit-orange text-black font-semibold">
            Back to home
          </a>
          {error.digest && <p className="mt-8 text-xs text-muted-foreground font-mono">Ref: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
