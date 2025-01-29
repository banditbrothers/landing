import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const FEATURED_COUPON = {
  code: "LOOT4B4NDITS",
  name: "Buy 4 for ₹999",
  CartMessage: () => (
    <span>
      Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code <CouponText>{FEATURED_COUPON.code}</CouponText>
    </span>
  ),
  NoCouponAppliedMessage: () => (
    <span>
      Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code <CouponText>{FEATURED_COUPON.code}</CouponText>
    </span>
  ),
  CouponAppliedMessage: () => (
    <span>
      Want more discount? Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code{" "}
      <CouponText>{FEATURED_COUPON.code}</CouponText>
    </span>
  ),
};

export const STANDARD_COUPON = {
  code: "BEABANDIT",
  name: "Site-wide 5% off",
  CartMessage: () => (
    <span>
      Get <FeaturedText>5% off</FeaturedText> on all orders, use code <CouponText>{STANDARD_COUPON.code}</CouponText>
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

const CouponText = ({ children }: { children: React.ReactNode }) => {
  const { copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(children as string);
    toast.success("Copied to clipboard");
  };

  return (
    <FeaturedText className="font-semibold">
      <button type="button" onClick={handleCopy}>
        {children}
      </button>
    </FeaturedText>
  );
};
