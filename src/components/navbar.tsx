"use client";

import { useState, useEffect, Suspense, useSyncExternalStore } from "react";
import { m } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { scrollTo } from "@/utils/misc";

import { Button } from "./ui/button";
import { ShoppingBagIcon, SearchIcon } from "../Icons/icons";
import { openCart, useCart, useCartHydrated } from "@/components/stores/cart";
import { LoadingIcon } from "./misc/Loading";
import { openSearch } from "@/components/dialogs/SearchDialog";
import { ACTIVE_PRODUCTS } from "@/data/products";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { ProductVariant } from "@/types/product";
import { getCartItemCount, getFreeShippingProgress } from "@/utils/cart";
import { formatCurrency } from "@/utils/price";
import { routes } from "@/utils/routes";
import { getProductPluralName } from "@/utils/product";
import { VARIANTS_QUERY_KEY } from "@/hooks/useVariants";

// Keep in sync with the h-16 / h-10 rows below; pages read --nav-h for sticky offsets
const ROW_1 = 64;
const ROW_2 = 40;

const LINKS = [
  { href: "/shop", label: "Shop all" },
  ...ACTIVE_PRODUCTS.map(p => ({ href: routes.product(p.id), label: getProductPluralName(p) })),
  { href: "/reviews", label: "Reviews" },
];

export default function NavBar() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isRowHidden, setIsRowHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 10);
      // Category row tucks away while scrolling down, comes back on any scroll up
      if (Math.abs(y - lastY) > 4) setIsRowHidden(y > 120 && y > lastY);
      lastY = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePath = pathname === "/";
  const isCheckout = pathname === "/checkout";
  const showActions = !["/admin", "/terms", "/privacy"].includes(pathname);
  const showRow2 = showActions && !isCheckout;
  const isRow2Visible = showRow2 && !isRowHidden;

  useEffect(() => {
    document.documentElement.style.setProperty("--nav-h", `${ROW_1 + (isRow2Visible ? ROW_2 : 0)}px`);
  }, [isRow2Visible]);

  const isSolid = !isHomePath || isScrolled;

  return (
    <>
      <m.header
        className={`fixed top-0 inset-x-0 right-scroll-bar-position z-50 transition-colors duration-300 border-b ${
          isSolid ? "bg-background border-border" : "bg-transparent border-transparent"
        }`}
        initial={{ y: isHomePath ? -100 : 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={e => {
              if (isHomePath) {
                e.preventDefault();
                scrollTo("hero");
              }
            }}>
            <span className="text-[22px] sm:text-2xl md:text-3xl text-bandit-orange font-calera whitespace-nowrap">
              BANDIT BROTHERS
            </span>
          </Link>
          {showActions && (
            <div className="flex gap-1.5 md:gap-2">
              {!isCheckout && (
                <Suspense fallback={<LoadingIcon />}>
                  <SearchButton />
                </Suspense>
              )}
              <CartButton />
            </div>
          )}
        </div>

        {showRow2 && (
          <div
            className={`overflow-hidden transition-[height] duration-300 ${isRow2Visible ? "h-10" : "h-0"} ${
              isSolid ? "border-t border-border" : ""
            }`}>
            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-10 flex items-center justify-between gap-6">
              <nav
                aria-label="Shop"
                className="flex gap-5 md:gap-6 h-full items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {LINKS.map(({ href, label }) => {
                  // "/shop" itself would prefix-match every category
                  const isActive = pathname === href || (href !== "/shop" && pathname.startsWith(`${href}/`));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`relative shrink-0 py-1 text-xs font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-colors hover:text-bandit-orange ${
                        isActive
                          ? "text-bandit-orange after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-sm after:bg-bandit-orange after:-rotate-[1.5deg]"
                          : "text-foreground"
                      }`}>
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <FreeShippingMeter />
            </div>
          </div>
        )}
      </m.header>
      {/* Pages pad for row 1 only; this covers row 2. The home hero sits under the transparent bar instead. */}
      {showRow2 && !isHomePath && <div className="h-10" aria-hidden />}
    </>
  );
}

// The navbar lives in the root layout, outside the (index) ServerVariantsProvider. Calling useVariants() here would
// create the variants query first, with no server data, and the (index) pages would lose their server-rendered
// catalog. So this only reads whatever the cache already holds.
const useCachedVariants = () => {
  const queryClient = useQueryClient();
  return useSyncExternalStore(
    // Variants events only, and deferred: the cache notifies synchronously, even while another component renders
    // (a new useQuery observer mounting), and an immediate onChange would re-render this mid-render
    onChange =>
      queryClient.getQueryCache().subscribe(e => {
        if (e.query.queryKey[0] === VARIANTS_QUERY_KEY[0]) queueMicrotask(onChange);
      }),
    () => queryClient.getQueryData<ProductVariant[]>(VARIANTS_QUERY_KEY),
    () => undefined
  );
};

const FreeShippingMeter = () => {
  const cart = useCart(state => state.cart);
  const coupon = useCart(state => state.coupon);
  const variants = useCachedVariants();
  const cartHydrated = useCartHydrated();

  if (MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null) return null;

  const className =
    "hidden lg:flex items-center gap-2 shrink-0 text-xs tracking-[0.08em] uppercase text-muted-foreground";

  if (!cartHydrated || !cart.length || !variants?.length) {
    return (
      <span className={className}>
        <b className="font-medium text-bandit-orange">Free shipping</b> over{" "}
        {formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}
      </span>
    );
  }

  const { left, pct, unlocked } = getFreeShippingProgress(cart, variants, coupon)!;

  return (
    <span className={className}>
      {!unlocked ? (
        <>
          {formatCurrency(left)} away from <b className="font-medium text-bandit-orange">free shipping</b>
        </>
      ) : (
        <b className="font-medium text-bandit-orange">Free shipping unlocked</b>
      )}
      <span className="w-24 h-1 rounded-full bg-secondary overflow-hidden">
        <span className="block h-full bg-bandit-orange transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
};

const CartButton = () => {
  const cartItems = useCart(state => state.cart);
  // The server can't see the cart (localStorage), so count 0 until it loads instead of mismatching the server HTML
  const cartHydrated = useCartHydrated();

  const totalCartItems = cartHydrated ? getCartItemCount(cartItems) : 0;
  return (
    <Button
      variant="outline"
      className="px-3 gap-1.5"
      onClick={openCart}
      aria-label={cartHydrated ? `Open cart, ${totalCartItems} items` : "Open cart"}>
      <ShoppingBagIcon className="w-4 h-4" />
      {totalCartItems > 0 && (
        <span className="animate-in fade-in zoom-in-50 duration-300 text-[11px] font-bold leading-none bg-bandit-orange text-black px-1.5 py-0.5 rounded -rotate-6 shadow-[0_2px_0_rgba(0,0,0,.35)]">
          {totalCartItems}
        </span>
      )}
    </Button>
  );
};

const SearchButton = () => {
  return (
    <Button variant="outline" className="px-3" onClick={openSearch} aria-label="Search">
      <SearchIcon className="w-4 h-4" />
    </Button>
  );
};
