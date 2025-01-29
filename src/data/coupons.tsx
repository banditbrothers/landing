export const FEATURED_COUPON = {
  code: "LOOT4B4NDITS",
  name: "Buy 4 for ₹999",
  CartMessage: () => (
    <span>
      Get <span className="font-bold text-bandit-orange">Any 4 for ₹999</span>, use code{" "}
      <span className="font-bold text-bandit-orange">{FEATURED_COUPON.code}</span>
    </span>
  ),
  NoCouponAppliedMessage: () => (
    <span>
      Get <span className="font-bold text-bandit-orange">Flat ₹200 off</span> on orders above ₹999, use code{" "}
      <span className="font-bold text-bandit-orange">{FEATURED_COUPON.code}</span>
    </span>
  ),
  CouponAppliedMessage: () => (
    <span>
      Want more discount? Get <span className="font-bold text-bandit-orange">Any 4 for ₹999</span>, use code{" "}
      <span className="font-bold text-bandit-orange">{FEATURED_COUPON.code}</span>
    </span>
  ),
};

export const STANDARD_COUPON = {
  code: "STANDARD",
  name: "Site-wide 5% off",
  CartMessage: () => (
    <span>
      Get 5% off on all orders, use code <span className="font-bold text-bandit-orange">{STANDARD_COUPON.code}</span>
      <span className="ml-1 animate-pulse">🧡</span>
    </span>
  ),
};
