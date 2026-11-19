export const Sticker = ({
  tone = "orange",
  children,
}: {
  tone?: "orange" | "light" | "ghost";
  children: React.ReactNode;
}) => (
  <span
    className={`inline-block text-[11px] font-bold tracking-[0.1em] uppercase px-2 py-1 rounded shadow-[0_2px_0_rgba(0,0,0,.35)] ${
      tone === "orange"
        ? "bg-bandit-orange text-black -rotate-3"
        : tone === "light"
          ? "bg-foreground text-background rotate-2"
          : "bg-secondary text-foreground shadow-none"
    }`}>
    {children}
  </span>
);

// Muted, not drained: the print should still be recognisable behind the stamp
export const SOLD_OUT_IMAGE = "grayscale-[.45] brightness-[.8]";

// Literal caps: Calera's lowercase set has filled counters, so O and D lose their holes
export const SoldOutLabel = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block font-calera whitespace-nowrap text-bandit-red border-[3px] border-bandit-red rounded-lg px-3 md:px-4 pt-1.5 -rotate-12 ${className}`}>
    SOLD OUT
  </span>
);

/** Stamp centred over a product image */
export const SoldOutStamp = ({ className = "text-2xl md:text-4xl" }: { className?: string }) => (
  <span className="absolute inset-0 z-[1] grid place-items-center pointer-events-none">
    <SoldOutLabel className={className} />
  </span>
);
