import { cn } from "@/lib/utils";

/** Rounded card surface used by checkout and the order pages */
export const Panel = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-[22px] border border-border bg-card", className)}>{children}</div>
);

/** Label on the left, value on the right (receipt lines) */
export const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex justify-between items-center gap-4 py-1.5 text-sm">
    <span className="text-muted-foreground flex items-center gap-2">{label}</span>
    <span>{children}</span>
  </div>
);
