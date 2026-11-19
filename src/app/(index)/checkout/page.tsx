"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InternationalOrderSuccessDialog } from "@/components/dialogs/InternationalOrderSuccessDialog";
import { LoadingIcon, LoadingScreen } from "@/components/misc/Loading";
import { RazorpayPaymentGateway, RazorpayPaymentGatewayRef } from "@/components/payments/RazorpayGateway";
import { Kicker } from "@/components/typography/Kicker";
import { useCart, useCartHydrated } from "@/components/stores/cart";
import { useVariants } from "@/hooks/useVariants";
import { cancelOrder, createOrder } from "@/actions/orders";
import { validateCoupon } from "@/actions/coupons";
import { DEFAULT_ORDER_VALUES } from "@/constants/order";
import { CONTACT } from "@/lib/site";
import { OrderInput } from "@/schemas";
import { getCartAnalyticsItems, identifyUser, track, trackPurchase } from "@/utils/analytics";
import { trackMetaAddPaymentInfo, trackMetaInitiateCheckout } from "@/utils/metaPixel";
import { getWhatsappNeedHelpWithOrderLink } from "@/utils/whatsappMessageLinks";
import { cartHasStockIssue, getCartItemCount, getOrderTotal, getPaymentMode } from "@/utils/cart";
import { validateCouponInCart } from "@/utils/coupon";
import { getDialCode, withDialCode } from "@/utils/address";
import { CURRENCY, formatCurrency } from "@/utils/price";

import { contactSchema, orderFormSchema, OrderFormValues } from "./_components/form";
import { ContactStep } from "./_components/ContactStep";
import { AddressStep } from "./_components/AddressStep";
import { ReferralStep } from "./_components/ReferralStep";
import { formatItemCount, getOrderableCart, OrderSummary } from "./_components/OrderSummary";
import { routes } from "@/utils/routes";

// Hold on a "confirming" screen for a beat so the jump to the order page isn't abrupt
const CONFIRM_SCREEN_MS = 3000;

/** First thing still blocking the pay button, in the order the customer meets it */
const getMissingReason = (s: {
  isEmpty: boolean;
  hasStockIssue: boolean;
  couponError: boolean;
  contactDone: boolean;
  addressDone: boolean;
  referralDone: boolean;
}) => {
  if (s.isEmpty) return "Your bag is empty";
  if (s.hasStockIssue) return "Fix the quantities in your bag";
  if (s.couponError) return "Remove or fix the coupon";
  if (!s.contactDone) return "Fill in your details (01)";
  if (!s.addressDone) return "Add your delivery address (02)";
  if (!s.referralDone) return "Tell us how you found us (03)";
  return "Fill in the required fields";
};

function OrderPageContent() {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: DEFAULT_ORDER_VALUES,
    mode: "onChange", // also validates browser-autofilled fields
  });

  const router = useRouter();
  const { data: variants, isReady } = useVariants();
  const { cart, coupon, setCoupon, clearCart, clearCoupon } = useCart();
  const cartHydrated = useCartHydrated();

  const [orderLoading, setOrderLoading] = useState(false);
  // Full-screen overlay text; null = hidden. Shown under the Razorpay modal too, so closing it doesn't flash the form
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const [showInternationalOrderDialog, setShowInternationalOrderDialog] = useState(false);
  const rzpRef = useRef<RazorpayPaymentGatewayRef>(null);

  const values = useWatch({ control: form.control });
  const selectedCountry = values.address?.country ?? "";
  const isInternational = !!selectedCountry && selectedCountry !== "IN";
  const paymentMode = getPaymentMode(coupon, isInternational);
  const orderTotal = getOrderTotal(cart, variants, coupon);
  const orderableCart = getOrderableCart(cart, variants);
  const hasStockIssue = cartHasStockIssue(cart, variants);
  const { message: couponError } = validateCouponInCart(coupon, cart, variants);

  // The coupon is saved with the cart, so it may have expired or been switched off since it was applied
  useEffect(() => {
    if (!coupon) return;
    validateCoupon(coupon.code)
      .then(({ error, coupon: fresh }) => {
        if (fresh) return setCoupon(fresh);
        clearCoupon();
        if (error) toast.error(`${coupon.code}: ${error}`);
      })
      .catch(() => {}); // offline: createOrder re-checks the coupon anyway
    // Keyed on the code, not mount: the cart store loads from localStorage after the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon?.code]);

  // Track InitiateCheckout once, as soon as the cart (localStorage) and catalog are both loaded
  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (checkoutTrackedRef.current || variants.length === 0 || cart.length === 0) return;
    checkoutTrackedRef.current = true;
    const contentIds = cart.map(item => item.variantId);
    const total = getOrderTotal(cart, variants, coupon);
    const numItems = getCartItemCount(cart);

    trackMetaInitiateCheckout({ contentIds, value: total, numItems });
    track("checkout_started", {
      value: total,
      currency: CURRENCY,
      num_items: numItems,
      coupon_code: coupon?.code,
      items: getCartAnalyticsItems(cart, variants),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length, variants.length]);

  const onSubmit = async (values: OrderFormValues) => {
    const order: OrderInput = {
      name: values.name,
      email: values.email,
      phone: withDialCode(values.phone, getDialCode(values.address.country)),
      referralSource: values.referralSource,
      address: values.address,
      couponCode: coupon?.code ?? null,
      variants: orderableCart.map(({ variantId, size, quantity }) => ({ variantId, size, quantity })),
    };
    const isInternationalOrder = values.address.country !== "IN";

    identifyUser(order.email, { name: order.name, email: order.email, phone: order.phone });

    setOrderLoading(true);
    const orderObj = await createOrder(order).finally(() => setOrderLoading(false));
    if ("error" in orderObj) {
      toast.error(orderObj.error);
      return;
    }

    track("order_placed", {
      order_id: orderObj.id,
      payment_mode: orderObj.paymentMode,
      value: orderObj.total,
      currency: CURRENCY,
      coupon_code: coupon?.code,
      referral_source: order.referralSource,
      country: order.address.country,
      items: getCartAnalyticsItems(orderableCart, variants),
    });
    trackMetaAddPaymentInfo({ contentIds: cart.map(item => item.variantId), value: orderTotal });

    if (isInternationalOrder) {
      setShowInternationalOrderDialog(true);
    } else if (orderObj.paymentMode === "rzp") {
      setOverlayMessage("Taking you to payment...");
      if (!rzpRef.current?.handlePayment(orderObj)) setOverlayMessage(null);
    } else if (orderObj.paymentMode === "cash") {
      trackPurchase({ orderId: orderObj.id, paymentMode: "cash", value: orderObj.total, cart });
      confirmAndGoToOrder(orderObj.id);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    trackPurchase({ orderId, paymentMode: "rzp", value: orderTotal, cart });
    confirmAndGoToOrder(orderId);
  };

  const confirmAndGoToOrder = (orderId: string) => {
    const href = routes.order(orderId);
    setOverlayMessage("Confirming your order...");
    router.prefetch(href);
    setTimeout(() => {
      toast.success("Order's in", { description: "We'll get it packed and on its way." });
      finalizeOrder(href);
    }, CONFIRM_SCREEN_MS);
  };

  const finalizeOrder = (href = "/") => {
    clearCart();
    clearCoupon();
    router.replace(href);
  };

  const handlePaymentCancel = async (orderId: string) => {
    setOverlayMessage(null);
    track("payment_cancelled", { order_id: orderId, value: orderTotal });
    await cancelOrder(orderId);
  };

  const handlePaymentFailed = () => {
    track("payment_failed", { value: orderTotal });
    toast.error("Payment didn't go through", { description: "Try again, or pick another payment method." });
  };

  const handleInternationalOrderDialogClose = () => {
    setShowInternationalOrderDialog(false);
    finalizeOrder();
  };

  const contactDone = contactSchema.safeParse(values).success;
  const addressDone = orderFormSchema.shape.address.safeParse(values.address).success && !form.formState.errors.address;
  const referralDone = !!values.referralSource;

  const formIsReady = form.formState.isValid && cart.length > 0 && variants.length > 0;
  const payDisabled = !formIsReady || !referralDone || orderLoading || hasStockIssue || !!couponError;
  const missingReason = getMissingReason({
    isEmpty: orderableCart.length === 0,
    hasStockIssue,
    couponError: !!couponError,
    contactDone,
    addressDone,
    referralDone,
  });

  if (!cartHydrated || (cart.length > 0 && !isReady)) return <LoadingScreen />;

  const payButton = (
    <>
      <Button
        type="submit"
        className="w-full h-14 rounded-full bg-bandit-orange text-black text-base font-bold hover:bg-bandit-orange/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
        disabled={payDisabled}>
        {paymentMode === "manual" ? (
          "Place order · pay later"
        ) : (
          <>
            Pay {formatCurrency(orderTotal)}
            {paymentMode === "cash" && " in Cash"}
            {!orderLoading && <ArrowRightIcon className="w-5 h-5" />}
          </>
        )}
        {orderLoading && <LoadingIcon />}
      </Button>
      {payDisabled && !orderLoading && (
        <p className="text-xs text-muted-foreground text-center mt-2">{missingReason}</p>
      )}
    </>
  );

  return (
    <>
      {overlayMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm">
          <LoadingIcon />
          <p className="text-lg font-semibold">{overlayMessage}</p>
          <p className="text-sm text-muted-foreground">Hang tight, don&apos;t close this page.</p>
        </div>
      )}

      {paymentMode === "rzp" && (
        <RazorpayPaymentGateway
          ref={rzpRef}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onFailed={handlePaymentFailed}
        />
      )}

      <InternationalOrderSuccessDialog
        open={showInternationalOrderDialog}
        onOpenChange={setShowInternationalOrderDialog}
        onContinueShopping={handleInternationalOrderDialogClose}
        email={CONTACT.email}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 pt-20 md:pt-24 min-h-screen">
        <Link
          href="/shop"
          onClick={e => {
            // Fall back to /shop when checkout was opened directly (no history to go back to)
            if (window.history.length > 1) {
              e.preventDefault();
              router.back();
            }
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Keep looting
        </Link>

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pt-6 md:pt-10 pb-6 md:pb-10">
          <div>
            <Kicker>Checkout · {formatItemCount(getCartItemCount(orderableCart))}</Kicker>
            <h1 className="font-calera uppercase leading-[0.88] text-[12.5vw] md:text-[clamp(4rem,8vw,7.5rem)]">
              Begin the <span className="text-bandit-orange">Brotherhood</span>.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md mt-4">
              Three quick bits and your mischief is on its way. Dispatched within 8–14 days.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              window.open(getWhatsappNeedHelpWithOrderLink(form.getValues()), "_blank", "noreferrer noopener")
            }
            className="self-start lg:self-end inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
            <MessageCircleIcon className="w-4 h-4 text-bandit-orange" />
            Stuck? WhatsApp us
          </button>
        </header>

        <Form {...form}>
          <form onSubmit={e => form.handleSubmit(onSubmit)(e)}>
            <div className="grid lg:grid-cols-[1.45fr_1fr] gap-6 lg:gap-10 border-t border-border pt-6 lg:pt-10">
              <div className="space-y-8 min-w-0 order-2 lg:order-1">
                <ContactStep done={contactDone} />
                <AddressStep done={addressDone} />
                <ReferralStep done={referralDone} />
              </div>

              <OrderSummary isInternational={isInternational} payButton={payButton} />
            </div>

            {/* Phone: the pay button stays under the thumb */}
            <div className="lg:hidden sticky bottom-0 z-10 -mx-4 px-4 pt-6 pb-4 mt-6 bg-gradient-to-t from-background via-background to-transparent">
              {payButton}
            </div>
            <div className="h-10 lg:h-20" />
          </form>
        </Form>
      </div>
    </>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderPageContent />
    </Suspense>
  );
}
