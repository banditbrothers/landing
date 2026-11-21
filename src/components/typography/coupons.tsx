import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const BULK_BUY_COUPON = {
  code: "LOOT4B4NDITS",
  name: "Buy 4 for ₹999",
  CartMessage: () => (
    <span className="italic">
      Psst... Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code{" "}
      <CouponText className="italic" code={BULK_BUY_COUPON.code} />
    </span>
  ),
  NoCouponAppliedMessage: () => (
    <span>
      Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code <CouponText code={BULK_BUY_COUPON.code} />
    </span>
  ),
};

const STANDARD_COUPON = {
  code: "BEABANDIT",
  name: "Site-wide 5% off",
  CartMessageElement: () => (
    <CouponCardContainer className="justify-between gap-3 rounded-xl px-3.5 py-3">
      <span className="min-w-0">
        {/* Literal caps: Calera's lowercase set has filled counters */}
        <span className="block font-calera text-base leading-tight">
          PSST, <FeaturedText>BANDIT.</FeaturedText>
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5">5% off everything</span>
      </span>
      <CouponText
        className="flex items-center gap-1.5 border border-dashed border-bandit-orange rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-wider whitespace-nowrap"
        code={STANDARD_COUPON.code}>
        <Copy className="w-3.5 h-3.5" />
      </CouponText>
    </CouponCardContainer>
  ),
};

const LIMITED_TIME_COUPON = {
  code: "VALENTINESLOOT",
  name: "Buy 2 for ₹449",
  expiresAt: new Date("2025-02-17T00:00:00+05:30"),
  CartMessageElement: () => (
    <CouponCardContainer className="bg-valentine-pink/5 border-valentine-pink/30">
      <CouponCardContentWrapper>
        <span className="flex flex-col gap-1">
          <span className="text-valentine-pink font-semibold text-sm">Valentine&apos;s Day Sale</span>
          <span>
            Get <FeaturedText className="text-valentine-pink">Any 2 for ₹449</FeaturedText>, use code{" "}
            <CouponText className="text-valentine-pink" code={LIMITED_TIME_COUPON.code} />
            <span className="ml-1 animate-pulse">💖</span>
          </span>
        </span>
      </CouponCardContentWrapper>
    </CouponCardContainer>
  ),
};

export const RUNNING_COUPON = LIMITED_TIME_COUPON.expiresAt > new Date() ? LIMITED_TIME_COUPON : STANDARD_COUPON;

const CouponCardContainer = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex items-center bg-card rounded-lg px-3 py-2.5",
        className
      )}>
      {children}
    </div>
  );
};

const CouponCardContentWrapper = ({ children, className }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("leading-normal text-xs text-muted-foreground", className)}>{children}</span>;
};

const FeaturedText = ({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("text-bandit-orange", className)} {...rest}>
      {children}
    </span>
  );
};

type CouponTextProps = React.HTMLAttributes<HTMLButtonElement> & {
  code: string;
};

const CouponText = ({ code, children, ...rest }: CouponTextProps) => {
  const { copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(code);
    toast.success(`${code} copied`, { description: "Paste it at checkout." });
  };

  return (
    <FeaturedText className="font-semibold">
      <button type="button" onClick={handleCopy}>
        <span {...rest}>
          {code}
          {children}
        </span>
      </button>
    </FeaturedText>
  );
};
