import { cn } from "@/lib/utils";

/** Small all-caps label above a heading */
export const Kicker = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={cn("text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3", className)}>{children}</p>
);
