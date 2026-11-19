"use client";

import { Check, Info, Loader2, X } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const dot = (className: string, children: React.ReactNode) => (
  <span className={`grid place-items-center size-full rounded-full ${className}`}>{children}</span>
);

/** Brand "capsule" toasts: a black pill at bottom-centre, colour only on the icon dot */
const Toaster = ({ style, ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    position="bottom-center"
    expand
    // sonner's mobile CSS pins the toaster to the left edge at 100% width; recentre it so the pill can shrink to fit
    className="toaster group !font-[inherit] max-[600px]:!left-4 max-[600px]:!right-4 max-[600px]:!w-auto"
    style={{ "--width": "420px", ...style } as React.CSSProperties}
    icons={{
      success: dot("bg-bandit-orange text-black", <Check className="size-4" strokeWidth={3} />),
      error: dot("bg-bandit-red text-white", <X className="size-4" strokeWidth={3} />),
      warning: dot("bg-amber-400 text-black font-bold text-sm", "!"),
      info: dot("bg-secondary text-foreground", <Info className="size-4" />),
      // sonner wraps this in an absolutely centred .sonner-loader, so it needs a fixed size rather than size-full
      loading: (
        <span className="grid place-items-center size-[30px] rounded-full bg-secondary text-foreground">
          <Loader2 className="size-4 animate-spin" />
        </span>
      ),
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "left-0 right-0 mx-auto !w-fit max-w-full flex items-center gap-2.5 rounded-full bg-black border border-border py-1.5 px-4 [&:has([data-icon])]:pl-1.5 [&:has([data-icon]):has([data-description])]:pl-3.5 text-sm text-foreground shadow-[0_16px_40px_-14px_#000]",
        icon: "!size-[30px] !m-0 shrink-0 overflow-hidden rounded-full",
        content: "min-w-0 py-1",
        title: "font-medium leading-snug",
        description: "text-[13px] text-muted-foreground leading-snug",
        actionButton:
          "!ml-1 shrink-0 self-center border-l border-border pl-3 text-[13px] font-medium text-bandit-orange hover:text-bandit-orange/80 focus-visible:outline-none focus-visible:underline",
        cancelButton: "!ml-1 shrink-0 self-center border-l border-border pl-3 text-[13px] text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
