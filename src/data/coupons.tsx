export const FEATURED_COUPON = {
  code: "LOOT4B4NDITS",
  name: "Buy 4 for ₹999",
  CartMessage: () => (
    <span>
      Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code <FeaturedText>{FEATURED_COUPON.code}</FeaturedText>
    </span>
  ),
  NoCouponAppliedMessage: () => (
    <span>
      Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code <FeaturedText>{FEATURED_COUPON.code}</FeaturedText>
    </span>
  ),
  CouponAppliedMessage: () => (
    <span>
      Want more discount? Get <FeaturedText>Any 4 for ₹999</FeaturedText>, use code{" "}
      <FeaturedText>{FEATURED_COUPON.code}</FeaturedText>
    </span>
  ),
};

export const STANDARD_COUPON = {
  code: "BEABANDIT",
  name: "Site-wide 5% off",
  CartMessage: () => (
    <span>
      Get <FeaturedText>5% off</FeaturedText> on all orders, use code{" "}
      <FeaturedText>{STANDARD_COUPON.code}</FeaturedText>
      <span className="ml-1 animate-pulse">🧡</span>
    </span>
  ),
};

const FeaturedText = ({ children }: { children: React.ReactNode }) => {
  return <span className="font-bold text-bandit-orange">{children}</span>;
};
