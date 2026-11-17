"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Control, FieldPath, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State } from "country-state-city";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  LockIcon,
  MessageCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InternationalOrderSuccessDialog } from "@/components/dialogs/InternationalOrderSuccessDialog";

import { CartItem } from "@/types/order";
import { Coupon } from "@/types/coupon";
import { useRouter } from "next/navigation";
import { LoadingIcon, LoadingScreen } from "@/components/misc/Loading";
import { DEFAULT_ORDER_VALUES, REFERRAL_SOURCES } from "@/constants/order";

import { getWhatsappNeedHelpWithOrderLink } from "@/utils/whatsappMessageLinks";
import { RazorpayPaymentGateway, RazorpayPaymentGatewayRef } from "@/components/payments/RazorpayGateway";
import { cancelOrder, createOrder, OrderInput } from "@/actions/orders";
import { getCartAnalyticsItems, identifyUser, track } from "@/utils/analytics";
import { trackMetaInitiateCheckout, trackMetaAddPaymentInfo, trackMetaPurchase } from "@/utils/metaPixel";
import {
  exceedsStock,
  getProductVariantName,
  getProductVariantPrice,
  getSizeLabel,
  getSizeStock,
} from "@/utils/product";
import { getProductVariantUrl } from "@/utils/share";
import { useCart } from "@/components/stores/cart";
import { CouponInput } from "@/components/inputs/Coupon";
import { QuantityStepper } from "@/components/misc/QuantityStepper";
import { getDiscountAmount, validateCouponInCart } from "@/utils/coupon";
import { DangerBanner } from "@/components/misc/Banners";
import { validatePincode } from "@/lib/pincode";
import { validateCoupon } from "@/actions/coupons";
import { formatCurrency } from "@/utils/price";

import { ProductVariant } from "@/types/product";
import { useVariants } from "@/hooks/useVariants";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING, SHIPPING_COST } from "@/data/products";
import { getCartSubtotal, getFreeShippingAmount, getOrderTotal, getShippingCost } from "@/utils/cart";

const BANDIT_EMAIL = "wearebanditbrothers@gmail.com";

const countries = Country.getAllCountries();
const indianStates = State.getStatesOfCountry("IN");

const orderFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Enter valid name"),
  couponCode: z.string(),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]{7,20}$/, {
    message: "Enter a valid phone number",
  }),
  referralSource: z.string().min(1, "Please select how you heard about us"),
  address: z.object({
    line1: z.string().min(2, "Enter valid address"),
    line2: z.string(),
    country: z.string().min(1, "Please select a country"),
    state: z.string().min(1, "Please select a state/province"),
    city: z.string().min(2, "Enter valid city"),
    zip: z.string().min(3, "Enter valid postal code").max(10, "Enter valid postal code"),
  }),
});
type OrderFormValues = z.infer<typeof orderFormSchema>;
const contactSchema = orderFormSchema.pick({ email: true, name: true, phone: true });

const getPaymentMode = (coupon: Coupon | null, isInternational: boolean) => {
  if (isInternational) return "manual";
  if (!coupon) return "rzp";
  return coupon.cashAndFreeShipping ? "cash" : "rzp";
};

// "+358-18" -> "358"
const getDialCode = (countryCode?: string) =>
  Country.getCountryByCode(countryCode ?? "")
    ?.phonecode.replace(/^\+/, "")
    .split("-")[0];

// Customers type the number without the country code now that it's shown as a prefix; store it with one
const withDialCode = (phone: string, dialCode?: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+") || !dialCode) return cleaned;
  const digits = cleaned.replace(/^0+/, "");
  return digits.startsWith(dialCode) && digits.length > 10 ? `+${digits}` : `+${dialCode}${digits}`;
};

const money = (n: number) => formatCurrency(n, Number.isInteger(n) ? 0 : 2);

function OrderPageContent() {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: DEFAULT_ORDER_VALUES,
    mode: "onChange", // also validates browser-autofilled fields
  });

  const router = useRouter();
  const { data: variants, isReady } = useVariants();

  const [orderLoading, setOrderLoading] = useState(false);
  // Full-screen overlay text; null = hidden. Shown under the Razorpay modal too, so closing it doesn't flash the form
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [pincodePlace, setPincodePlace] = useState<string | null>(null);

  const values = useWatch({ control: form.control });
  const watchCountry = values.address?.country;
  const watchReferralSource = values.referralSource;

  const { cart, coupon, setCoupon, updateCartItem, removeCartItem, clearCart, clearCoupon } = useCart();

  const [showInternationalOrderDialog, setShowInternationalOrderDialog] = useState(false);

  const rzpRef = useRef<RazorpayPaymentGatewayRef>(null);
  const pincodeDebounceRef = useRef<NodeJS.Timeout>(undefined);

  const countryStates = watchCountry ? State.getStatesOfCountry(watchCountry) : [];

  const selectedCountry = watchCountry ?? "";
  const isInternational = !!selectedCountry && selectedCountry !== "IN";
  const paymentMode = getPaymentMode(coupon, isInternational);
  const orderTotal = getOrderTotal(cart, variants, coupon);
  // Items whose variant is no longer listed are hidden and priced at 0, so they're never counted or ordered
  const orderableCart = cart.filter(item => variants.some(v => v.id === item.variantId));
  const hasStockIssue = cart.some(item => {
    const variant = variants.find(v => v.id === item.variantId);
    return !!variant && exceedsStock(variant, item.size, item.quantity);
  });

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
    const numItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    trackMetaInitiateCheckout({ contentIds, value: total, numItems });
    track("checkout_started", {
      value: total,
      currency: "INR",
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

    // Track AddPaymentInfo when payment is initiated
    const contentIds = cart.map(item => item.variantId);
    track("order_placed", {
      order_id: orderObj.id,
      payment_mode: orderObj.paymentMode,
      value: orderObj.total,
      currency: "INR",
      coupon_code: coupon?.code,
      referral_source: order.referralSource,
      country: order.address.country,
      items: getCartAnalyticsItems(orderableCart, variants),
    });
    trackMetaAddPaymentInfo({
      contentIds,
      value: orderTotal,
    });

    if (isInternationalOrder) {
      setShowInternationalOrderDialog(true);
    } else if (orderObj.paymentMode === "rzp") {
      setOverlayMessage("Taking you to payment...");
      if (!rzpRef.current?.handlePayment(orderObj)) setOverlayMessage(null);
    } else if (orderObj.paymentMode === "cash") {
      // Track purchase for cash orders
      track("order_completed", { order_id: orderObj.id, payment_mode: "cash", revenue: orderObj.total, currency: "INR" });
      trackMetaPurchase({
        contentIds,
        value: orderTotal,
        numItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        orderId: orderObj.id,
      });

      confirmAndGoToOrder(orderObj.id);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    // Track purchase completion
    const contentIds = cart.map(item => item.variantId);
    track("order_completed", { order_id: orderId, payment_mode: "rzp", revenue: orderTotal, currency: "INR" });
    trackMetaPurchase({
      contentIds,
      value: orderTotal,
      numItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      orderId,
    });

    confirmAndGoToOrder(orderId);
  };

  // Hold on a "confirming" screen for a beat so the jump to the order page isn't abrupt
  const confirmAndGoToOrder = (orderId: string) => {
    const href = `/order/${orderId}`;
    setOverlayMessage("Confirming your order...");
    router.prefetch(href);
    setTimeout(() => {
      toast.success("Order's in", { description: "We'll get it packed and on its way." });
      finalizeOrder(href);
    }, 3000);
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

  // autofill: typing the pincode fills in state + city; picking a state only checks it against the pincode
  const handlePostalCodeValidation = async (postalCode: string, countryCode: string, autofill: boolean) => {
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    if (autofill) setPincodePlace(null);
    pincodeDebounceRef.current = setTimeout(async () => {
      if (countryCode === "IN") {
        const pincodeResponse = await validatePincode(postalCode).catch(() => null);
        if (!pincodeResponse) return; // lookup API down: don't block checkout
        if (!pincodeResponse.isValid) {
          form.setError("address.zip", { message: "Invalid Pincode", type: "validate" });
          return;
        }

        const { state: pinStateName, city } = pincodeResponse.data;
        const pinState = indianStates.find(s => s.name.toLowerCase() === pinStateName.toLowerCase());

        if (autofill && pinState) {
          form.setValue("address.state", pinState.isoCode, { shouldValidate: true });
          if (!form.getValues().address.city) form.setValue("address.city", city, { shouldValidate: true });
          setPincodePlace(`${city}, ${pinState.name}`);
        } else {
          const selectedState = State.getStateByCodeAndCountry(form.getValues().address.state, countryCode);
          if (selectedState && pinStateName.toLowerCase() !== selectedState.name.toLowerCase()) {
            form.setError("address.zip", { message: `Not a ${selectedState.name} pincode`, type: "validate" });
            return;
          }
        }
      } else {
        // For international addresses, do basic validation
        if (!postalCode || postalCode.length < 3) {
          form.setError("address.zip", { message: "Invalid postal code", type: "validate" });
          return;
        }
      }

      form.resetField("address.zip", {
        keepDirty: true,
        keepError: false,
        keepTouched: true,
        defaultValue: postalCode,
      });
    }, 700);
  };

  const selectedVariantIds = cart.map(product => product.variantId);

  const formIsReady = form.formState.isValid && selectedVariantIds.length > 0 && variants?.length > 0;

  const subtotal = getCartSubtotal(cart, variants);
  const shippingCost = getShippingCost(cart, variants, coupon);
  const discountAmount = getDiscountAmount(cart, variants, coupon);
  const isShippingFree = shippingCost === 0;

  const totalItems = orderableCart.reduce((acc, item) => acc + item.quantity, 0);
  const itemsLabel = `${totalItems} ${totalItems === 1 ? "item" : "items"}`;

  const { message: couponError } = validateCouponInCart(coupon, cart, variants);

  const contactDone = contactSchema.safeParse(values).success;
  const addressDone = orderFormSchema.shape.address.safeParse(values.address).success && !form.formState.errors.address;
  const referralDone = !!watchReferralSource;

  const payDisabled = !formIsReady || !watchReferralSource || orderLoading || hasStockIssue || !!couponError;
  const missingReason =
    orderableCart.length === 0
      ? "Your bag is empty"
      : hasStockIssue
        ? "Fix the quantities in your bag"
        : couponError
          ? "Remove or fix the coupon"
          : !contactDone
            ? "Fill in your details (01)"
            : !addressDone
              ? "Add your delivery address (02)"
              : !referralDone
                ? "Tell us how you found us (03)"
                : "Fill in the required fields";

  const dialCode = getDialCode(selectedCountry);
  const countryFlag = Country.getCountryByCode(selectedCountry)?.flag;
  const afterDiscount = subtotal - discountAmount;
  const freeShippingAmount = getFreeShippingAmount(cart, variants, coupon);
  const freeShippingLeft =
    MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null ? null : MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING - freeShippingAmount;

  if (cart.length > 0 && !isReady) return <LoadingScreen />;

  const payButton = (
    <Button
      type="submit"
      className="w-full h-14 rounded-full bg-bandit-orange text-black text-base font-bold hover:bg-bandit-orange/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
      disabled={payDisabled}>
      {paymentMode === "manual" ? (
        "Place order · pay later"
      ) : (
        <>
          Pay {money(orderTotal)}
          {paymentMode === "cash" && " in Cash"}
          {!orderLoading && <ArrowRightIcon className="w-5 h-5" />}
        </>
      )}
      {orderLoading && <LoadingIcon />}
    </Button>
  );

  return (
    <>
      {overlayMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm"
        >
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
        email={BANDIT_EMAIL}
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
            <Kicker>Checkout · {itemsLabel}</Kicker>
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
              {/* ============ FORM ============ */}
              <div className="space-y-8 min-w-0 order-2 lg:order-1">
                <Step n="01" title="Who's this?" done={contactDone}>
                  <div className="p-4 md:p-5 grid sm:grid-cols-2 gap-4">
                    <TextField
                      control={form.control}
                      name="email"
                      label="Email"
                      autoComplete="email"
                      type="email"
                      placeholder="you@email.com"
                      className="sm:col-span-2"
                    />
                    <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-normal">
                            Phone
                            <RequiredStar />
                          </FormLabel>
                          <div className="flex items-center h-12 rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-bandit-orange focus-within:border-bandit-orange">
                            {dialCode && (
                              <span className="pl-3.5 pr-2.5 text-sm text-muted-foreground border-r border-border whitespace-nowrap">
                                {countryFlag} +{dialCode}
                              </span>
                            )}
                            <FormControl>
                              <Input
                                autoComplete="tel-national"
                                type="tel"
                                placeholder={selectedCountry === "IN" ? "98765 43210" : "Phone number"}
                                className="h-full border-0 shadow-none focus-visible:ring-0 md:text-base"
                                onKeyDown={preventEnter}
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <p className="text-xs text-muted-foreground">We&apos;ll send order updates on WhatsApp.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Step>

                <Step n="02" title="Where to?" done={addressDone}>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel className="text-muted-foreground font-normal">
                            Country
                            <RequiredStar />
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={value => {
                                field.onChange(value);
                                setPincodePlace(null);
                                form.setValue("address.state", "", { shouldValidate: true });
                                form.setValue("address.zip", "", { shouldValidate: true });
                              }}
                              defaultValue={field.value}
                              {...field}>
                              <SelectTrigger className={fieldClassName}>
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map(country => (
                                  <SelectItem key={country.isoCode} value={country.isoCode}>
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <TextField
                      control={form.control}
                      name="address.zip"
                      label={selectedCountry === "IN" ? "Pincode" : "Postal code"}
                      autoComplete="postal-code"
                      inputMode={selectedCountry === "IN" ? "numeric" : undefined}
                      placeholder={selectedCountry === "IN" ? "6 digits" : "Postal code"}
                      className="col-span-2 sm:col-span-1"
                      onTextChange={v => handlePostalCodeValidation(v, selectedCountry, true)}
                      hint={
                        selectedCountry !== "IN" ? null : pincodePlace ? (
                          <span className="text-green-500">✓ {pincodePlace}</span>
                        ) : (
                          "We'll fill in your city and state."
                        )
                      }
                    />

                    <TextField
                      control={form.control}
                      name="address.line1"
                      label="House / flat, street"
                      autoComplete="address-line1"
                      className="col-span-2"
                    />
                    <TextField
                      control={form.control}
                      name="address.line2"
                      label="Landmark, area"
                      required={false}
                      autoComplete="address-line2"
                      className="col-span-2"
                    />
                    <TextField control={form.control} name="address.city" label="City" autoComplete="address-level2" />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-normal">
                            State
                            <RequiredStar />
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={v => {
                                form.setValue("address.state", v, { shouldValidate: true });
                                handlePostalCodeValidation(form.getValues().address.zip, selectedCountry, false);
                              }}
                              defaultValue={field.value}
                              {...field}>
                              <SelectTrigger className={fieldClassName}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryStates.map(state => (
                                  <SelectItem key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isInternational && (
                    <div className="mx-4 md:mx-5 mb-4 md:mb-5 p-4 rounded-2xl border border-dashed border-bandit-orange/60 bg-bandit-orange/10 text-sm text-muted-foreground leading-relaxed">
                      <p className="font-calera uppercase text-2xl text-foreground mb-1">Shipping abroad? Sorted.</p>
                      <p>International orders are priced by hand so you never overpay on shipping or customs.</p>
                      <ol className="list-decimal pl-5 mt-2 space-y-0.5">
                        <li>Place the order now, no payment yet.</li>
                        <li>
                          Within <strong className="text-foreground">24 hours</strong> you get an email from{" "}
                          <strong className="text-foreground">{BANDIT_EMAIL}</strong> with exact shipping and duties.
                        </li>
                        <li>Pay through the secure link. Delivery takes 7–14 business days.</li>
                      </ol>
                    </div>
                  )}
                </Step>

                <Step n="03" title="One last thing" done={referralDone}>
                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem className="p-4 md:p-5">
                        <FormLabel className="text-muted-foreground font-normal">
                          How did you find us?
                          <RequiredStar />
                        </FormLabel>
                        <div className="flex flex-wrap gap-2 pt-1" role="radiogroup">
                          {REFERRAL_SOURCES.map(source => {
                            const on = field.value === source.id;
                            return (
                              <button
                                key={source.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => field.onChange(source.id)}
                                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                                  on
                                    ? "bg-bandit-orange border-bandit-orange text-black font-semibold"
                                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                }`}>
                                {source.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Helps us spend less on ads and more on designs 🧡
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>
              </div>

              {/* ============ RECEIPT ============ */}
              <aside className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 self-start w-full space-y-4">
                <div className="hidden lg:block">
                  <Kicker>Your mischief</Kicker>
                </div>
                <div className="rounded-[22px] border border-border bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSummaryOpen(o => !o)}
                    aria-expanded={summaryOpen}
                    className="lg:hidden w-full flex items-center justify-between px-5 py-4 text-sm">
                    <span className="flex items-center gap-1.5 text-bandit-orange">
                      Your mischief · {itemsLabel}
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
                    </span>
                    <span className="font-calera text-2xl leading-none">{money(orderTotal)}</span>
                  </button>

                  <div className={`${summaryOpen ? "block" : "hidden"} lg:block px-5 pb-5 lg:pt-5`}>
                    {orderableCart.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Your bag is empty.{" "}
                        <Link href="/shop" className="text-bandit-orange hover:underline">
                          Go loot →
                        </Link>
                      </p>
                    ) : (
                      <div className="divide-y divide-border">
                        {orderableCart.map(item => (
                          <ReceiptItem
                            key={`${item.variantId}-${item.size}`}
                            variant={variants.find(v => v.id === item.variantId)!}
                            item={item}
                            updateCartItem={updateCartItem}
                            removeCartItem={removeCartItem}
                          />
                        ))}
                      </div>
                    )}

                    {!isInternational && freeShippingLeft !== null && orderableCart.length > 0 && (
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground mb-2">
                          {isShippingFree ? (
                            <>
                              🎉 <span className="text-bandit-orange font-medium">Free shipping</span> unlocked
                            </>
                          ) : (
                            <>
                              Add <span className="text-bandit-orange font-medium">{money(freeShippingLeft)}</span> more
                              for free shipping
                            </>
                          )}
                        </p>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-bandit-orange transition-all"
                            style={{
                              width: `${isShippingFree ? 100 : Math.min(100, (freeShippingAmount / MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING!) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {orderableCart.length > 0 && (
                      <div className="mt-4">
                        {coupon ? (
                          <CouponInput
                            coupon={coupon}
                            cart={cart}
                            variants={variants}
                            onCouponApplied={setCoupon}
                            onCouponRemoved={clearCoupon}
                            onCouponError={toast.error}
                          />
                        ) : (
                          <details className="group">
                            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 w-fit">
                              Have a coupon code?
                            </summary>
                            <div className="mt-3">
                              <CouponInput
                                coupon={coupon}
                                cart={cart}
                                variants={variants}
                                onCouponApplied={setCoupon}
                                onCouponRemoved={clearCoupon}
                                onCouponError={toast.error}
                              />
                            </div>
                          </details>
                        )}
                      </div>
                    )}

                    <div className="border-t border-dashed border-border mt-4 pt-3">
                      <Row label={`Subtotal · ${itemsLabel}`}>{money(subtotal)}</Row>
                      {coupon && discountAmount > 0 && (
                        <Row label="Discount">
                          <span className="text-bandit-orange">−{money(discountAmount)}</span>
                        </Row>
                      )}
                      {isInternational ? (
                        <Row label="Shipping + duties">
                          <span className="text-muted-foreground">Quoted by email</span>
                        </Row>
                      ) : (
                        <Row label="Shipping">
                          {isShippingFree ? (
                            <>
                              <span className="text-muted-foreground line-through mr-1.5">
                                {formatCurrency(SHIPPING_COST)}
                              </span>
                              <span className="text-bandit-orange font-semibold">FREE</span>
                            </>
                          ) : (
                            formatCurrency(shippingCost)
                          )}
                        </Row>
                      )}
                    </div>

                    <div className="border-t border-dashed border-border mt-3 pt-4 flex justify-between items-baseline gap-4">
                      <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
                        {isInternational ? "Items total" : "Total"}
                      </span>
                      <span className="font-calera text-5xl leading-none">
                        {money(isInternational ? afterDiscount : orderTotal)}
                      </span>
                    </div>
                    {!isInternational && (
                      <p className="text-xs text-muted-foreground text-right mt-1">Incl. of all taxes</p>
                    )}

                    {!!couponError && (
                      <div className="mt-4">
                        <DangerBanner message={couponError} />
                      </div>
                    )}

                    <div className="hidden lg:block mt-5">
                      {payButton}
                      {payDisabled && !orderLoading && (
                        <p className="text-xs text-muted-foreground text-center mt-2">{missingReason}</p>
                      )}
                    </div>

                    {!isInternational && (
                      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
                        <LockIcon className="w-3.5 h-3.5" /> Secured by Razorpay · UPI, cards, netbanking
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-2xl border border-border p-3.5">
                    <p className="text-sm text-foreground font-medium">Dispatch in 8–14 days</p>
                    Tracking lands in your inbox.
                  </div>
                  <div className="rounded-2xl border border-border p-3.5">
                    <p className="text-sm text-foreground font-medium">All sales final</p>
                    Double-check sizes before paying.
                  </div>
                </div>
              </aside>
            </div>

            {/* Phone: the pay button stays under the thumb */}
            <div className="lg:hidden sticky bottom-0 z-10 -mx-4 px-4 pt-6 pb-4 mt-6 bg-gradient-to-t from-background via-background to-transparent">
              {payButton}
              {payDisabled && !orderLoading && (
                <p className="text-xs text-muted-foreground text-center mt-2">{missingReason}</p>
              )}
            </div>
            <div className="h-10 lg:h-20" />
          </form>
        </Form>
      </div>
    </>
  );
}

const fieldClassName =
  "h-12 rounded-xl bg-background md:text-base focus-visible:ring-bandit-orange focus:ring-bandit-orange";

const preventEnter = (e: React.KeyboardEvent) => e.key === "Enter" && e.preventDefault();

const RequiredStar = () => <span className="text-bandit-orange ml-1">*</span>;

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3">{children}</p>
);

const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex justify-between items-center gap-4 py-1.5 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span>{children}</span>
  </div>
);

const Step = ({ n, title, done, children }: { n: string; title: string; done: boolean; children: React.ReactNode }) => (
  <section>
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-calera text-4xl leading-[0.8] text-bandit-orange">{n}</span>
      <h2 className="font-calera uppercase text-2xl md:text-3xl leading-[0.9]">{title}</h2>
      {done && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-500">
          <CheckIcon className="w-3.5 h-3.5" /> done
        </span>
      )}
    </div>
    <div className="rounded-[22px] border border-border bg-card">{children}</div>
  </section>
);

type TextFieldProps = {
  control: Control<OrderFormValues>;
  name: FieldPath<OrderFormValues>;
  label: string;
  required?: boolean;
  className?: string;
  hint?: React.ReactNode;
  onTextChange?: (value: string) => void;
} & Omit<React.ComponentProps<"input">, "name" | "className">;

const TextField = ({
  control,
  name,
  label,
  required = true,
  className,
  hint,
  onTextChange,
  ...inputProps
}: TextFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-muted-foreground font-normal">
          {label}
          {required ? <RequiredStar /> : <span className="opacity-60 ml-1">(optional)</span>}
        </FormLabel>
        <FormControl>
          <Input
            className={fieldClassName}
            onKeyDown={preventEnter}
            {...inputProps}
            {...field}
            value={field.value as string}
            onChange={e => {
              field.onChange(e);
              onTextChange?.(e.target.value);
            }}
          />
        </FormControl>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const ReceiptItem = ({
  variant,
  item,
  updateCartItem,
  removeCartItem,
}: {
  variant: ProductVariant;
  item: CartItem;
  updateCartItem: (variantId: string, quantity: number, size?: string) => void;
  removeCartItem: (variantId: string, size?: string) => void;
}) => {
  const name = getProductVariantName(variant, { includeProductName: true });
  const price = getProductVariantPrice(variant);
  const stock = getSizeStock(variant, item.size);

  return (
    <div className="flex gap-3 py-3 first:pt-0">
      <Link href={getProductVariantUrl(variant)} className="shrink-0">
        <Image
          width={68}
          height={68}
          src={variant.images.mockup[0]}
          alt={name}
          className="w-[68px] h-[68px] rounded-[14px] object-cover bg-secondary"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3">
          <p className="text-sm font-medium leading-snug">{name}</p>
          <span className="text-sm font-medium">{formatCurrency(price * item.quantity)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {getSizeLabel(item.size)} · {formatCurrency(price)}
        </p>
        {stock !== undefined && item.quantity > stock && (
          <p className="text-destructive text-xs font-medium mt-1">
            {stock === 0 ? "Out of stock, please remove it" : `Only ${stock} left, please reduce the quantity`}
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <QuantityStepper
            quantity={item.quantity}
            max={stock}
            increment={() => updateCartItem(variant.id, 1, item.size)}
            decrement={() => updateCartItem(variant.id, -1, item.size)}
          />
          <button
            type="button"
            onClick={() => removeCartItem(variant.id, item.size)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <XIcon className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderPageContent />
    </Suspense>
  );
}
