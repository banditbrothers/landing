import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Home / ... / current page. Items with an href are links; the last item is the current page */
export const Breadcrumb = ({
  items,
  className,
}: {
  items: { label: React.ReactNode; href?: string }[];
  className?: string;
}) => (
  <nav className={cn("text-[13px] text-muted-foreground flex flex-wrap gap-2 pt-4", className)} aria-label="Breadcrumb">
    {[{ label: "Home", href: "/" }, ...items].map(({ label, href }, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="opacity-50">/</span>}
        {href ? (
          <Link href={href} className="hover:text-foreground">
            {label}
          </Link>
        ) : (
          <span className="text-foreground">{label}</span>
        )}
      </Fragment>
    ))}
  </nav>
);
