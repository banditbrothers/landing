import { cn } from "@/lib/utils";

/** Small all-caps label above a heading. `relative z-10` keeps it selectable above the heading's tall line box. */
export const Kicker = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={cn("relative z-10 text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3", className)}>
    {children}
  </p>
);
