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
  CouponAppliedMessage: () => (
    <span>
      Want more discount? Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code{" "}
      <CouponText code={BULK_BUY_COUPON.code} />
    </span>
  ),
};

export const STANDARD_COUPON = {
  code: "BEABANDIT",
  name: "Site-wide 5% off",
  CartMessage: () => (
    <span>
      Get <FeaturedText>5% off</FeaturedText> on all orders, use code <CouponText code={STANDARD_COUPON.code} />
      <span className="ml-1 animate-pulse">🧡</span>
    </span>
  ),
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
