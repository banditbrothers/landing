import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    <CouponCardContainer>
      <CouponCardContentWrapper>
        <span>
          Get <FeaturedText>5% off</FeaturedText> on all orders, use code <CouponText code={STANDARD_COUPON.code} />
          <span className="ml-1 animate-pulse">🧡</span>
        </span>
      </CouponCardContentWrapper>
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
          <span className="text-valentine-pink font-semibold text-sm">Valentine's Day Sale</span>
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
        "flex items-center justify-center bg-primary/5 rounded-lg p-3 border border-primary/10",
        className
      )}>
      {children}
    </div>
  );
};

const CouponCardContentWrapper = ({ children, className }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("text-center leading-normal text-xs text-muted-foreground", className)}>{children}</span>;
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

const CouponText = ({ code, ...rest }: CouponTextProps) => {
  const { copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(code);
    toast.success("Coupon code copied to clipboard");
  };

  return (
    <FeaturedText className="font-semibold">
      <button type="button" onClick={handleCopy}>
        <span {...rest}>{code}</span>
      </button>
    </FeaturedText>
  );
};
