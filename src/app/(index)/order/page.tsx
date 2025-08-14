"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State, IState } from "country-state-city";
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InternationalOrderSuccessDialog } from "@/components/dialogs/InternationalOrderSuccessDialog";

import { Order, CartItem } from "@/types/order";
import { Coupon } from "@/types/coupon";
import { getTimestamp } from "@/utils/timestamp";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingIcon, LoadingScreen } from "@/components/misc/Loading";
import { DEFAULT_ORDER_VALUES } from "@/constants/order";
import { Separator } from "@/components/ui/separator";

import { getWhatsappNeedHelpWithOrderLink } from "@/utils/whatsappMessageLinks";
import { useOrderActions } from "@/hooks/useOrderActions";
import { RazorpayPaymentGateway, RazorpayPaymentGatewayRef } from "@/components/payments/RazorpayGateway";
import { updateOrder } from "@/actions/orders";
import { identifyUser } from "@/utils/analytics";
import { Label } from "@/components/ui/label";
import { CheckoutProductCard } from "@/components/cards/CheckoutProductCard";
import { useCart } from "@/components/stores/cart";
import { CouponInput } from "@/components/inputs/Coupon";
import { getDiscountAmount, validateCouponInCart } from "@/utils/coupon";
import { DangerBanner } from "@/components/misc/Banners";
import { validatePincode } from "@/lib/pincode";
import { formatCurrency } from "@/utils/price";

import { getProductVariantPrice } from "@/utils/product";
import { OrderedVariant, ProductVariant } from "@/types/product";
import { useVariants } from "@/hooks/useVariants";

const SHIPPING_COST = 100;
const BANDIT_EMAIL = "wearebanditbrothers@gmail.com";

// `null` means free shipping is not applicable
const MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING: number | null = null;

const countries = Country.getAllCountries();

const orderFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Enter valid name"),
  couponCode: z.string(),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]{7,20}$/, {
    message: "Enter valid phone number with country code",
  }),
  address: z.object({
    line1: z.string().min(2, "Enter valid address"),
    line2: z.string(),
    country: z.string().min(1, "Please select a country"),
    state: z.string().min(1, "Please select a state/province"),
    city: z.string().min(2, "Enter valid city"),
    zip: z.string().min(3, "Enter valid postal code").max(10, "Enter valid postal code"),
  }),
});

const getSubtotal = (cart: CartItem[], variants: ProductVariant[]) => {
  if (cart.length === 0) return 0;

  return cart.reduce((total, item) => {
    const variant = variants.find(v => v.id === item.variantId)!;
    return total + getProductVariantPrice(variant) * item.quantity;
  }, 0);
};

const getShippingCost = (cart: CartItem[], coupon: Coupon | null, variants: ProductVariant[]) => {
  if (cart.length === 0) return 0;

  if (MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null) return SHIPPING_COST;

  const subtotal = getSubtotal(cart, variants);
  const discount = getDiscountAmount(subtotal, coupon);
  const total = subtotal - discount;

  if (total >= MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING) return 0;
  return SHIPPING_COST;
};

const calculateTotal = (cart: CartItem[], coupon: Coupon | null, variants: ProductVariant[]) => {
  const subtotal = getSubtotal(cart, variants);
  const discount = getDiscountAmount(subtotal, coupon);
  const shippingCost = getShippingCost(cart, coupon, variants);

  const total = subtotal - discount + shippingCost;

  if (total < 0) return 0;
  return total;
};

function OrderPageContent() {
  const form = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: DEFAULT_ORDER_VALUES,
    mode: "onTouched",
  });

  const router = useRouter();
  const { data: variants } = useVariants();

  const searchParams = useSearchParams();
  const { orderLoading, createOrder } = useOrderActions();

  const watchCountry = useWatch({ control: form.control, name: "address.country" });

  const { cart, coupon, setCoupon, updateCartItem, removeCartItem, clearCart, clearCoupon } = useCart();

  const [countryStates, setCountryStates] = useState<IState[]>([]);
  const [showInternationalOrderDialog, setShowInternationalOrderDialog] = useState(false);

  const rzpRef = useRef<RazorpayPaymentGatewayRef>(null);
  const pincodeDebounceRef = useRef<NodeJS.Timeout>(undefined);

  const oldFieldsValues = useRef(form.getValues());
  const watchAllFields = form.watch();

  // Trigger form validation on auto-filled fields
  // https://github.com/orgs/react-hook-form/discussions/1882#discussioncomment-9447454
  useEffect(() => {
    for (const target of Object.keys(watchAllFields)) {
      const targetKey = target as keyof typeof watchAllFields;

      if (targetKey === "phone") {
        if (watchAllFields[targetKey]) {
          // let phone = watchAllFields[targetKey];
          // Remove common international prefixes and country codes
          // const prefixes = ["+91", "+1", "+44", "+61", "+86", "+33", "+49", "+81", "+55", "0"];
          // for (const prefix of prefixes) {
          //   if (phone.startsWith(prefix)) {
          //     phone = phone.slice(prefix.length);
          //     form.setValue("phone", phone);
          //     break;
          //   }
          // }
        }
      }

      if (targetKey === "address") {
        const oldAddress = oldFieldsValues?.current?.[targetKey];
        const newAddress = watchAllFields[targetKey];

        if (oldAddress && newAddress) {
          for (const addressField of Object.keys(newAddress)) {
            const addressFieldKey = addressField as keyof typeof newAddress;
            if (newAddress[addressFieldKey] !== oldAddress[addressFieldKey]) {
              form.trigger(`${targetKey}.${addressFieldKey}`);
            }
          }
        }
      } else {
        if (watchAllFields[targetKey] !== oldFieldsValues?.current?.[targetKey]) {
          form.trigger(targetKey);
        }
      }
    }

    oldFieldsValues.current = watchAllFields;
  }, [watchAllFields, form]);

  useEffect(() => {
    if (watchCountry) {
      const countryStates = State.getStatesOfCountry(watchCountry);
      setCountryStates(countryStates);
    }
  }, [watchCountry]);

  const paymentMode = (searchParams.get("mode") ?? "rzp") as "rzp" | "cash" | "manual";
  const selectedCountry = form.watch("address.country");
  const isInternational = selectedCountry && selectedCountry !== "IN";
  const orderTotal = calculateTotal(cart, coupon, variants);

  const onSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    const orderedVariants: OrderedVariant[] = cart.map(product => ({
      variantId: product.variantId,
      size: product.size,
      quantity: product.quantity,
    }));

    const isInternationalOrder = values.address.country !== "IN";

    const order: Omit<Order, "id" | "status"> = {
      ...values,
      variants: orderedVariants,
      paymentMode: isInternationalOrder ? "manual" : paymentMode,
      total: orderTotal,
      isInternational: isInternationalOrder,
      subtotal: getSubtotal(cart, variants),
      discount: getDiscountAmount(subtotal, coupon),
      shipping: getShippingCost(cart, coupon, variants),
      createdAt: getTimestamp(),
      couponCode: coupon?.code ?? null,
    };

    identifyUser(order.email, { name: order.name, email: order.email });

    const orderObj = await createOrder(order);

    if (isInternationalOrder) {
      setShowInternationalOrderDialog(true);
    } else if (orderObj.paymentMode === "rzp") {
      rzpRef.current?.handlePayment(orderObj);
    } else if (orderObj.paymentMode === "cash") {
      toast.success("Order Placed in Cash 🎉");
      finalizeOrder();
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success("Order Placed 🎉");
    finalizeOrder();
  };

  const finalizeOrder = () => {
    clearCart();
    clearCoupon();
    router.replace("/");
  };

  const handlePaymentCancel = async (orderId: string) => {
    await updateOrder(orderId, { status: "cancelled" });
  };

  const handlePaymentFailed = () => {
    toast.error("Payment Failed");
  };

  const handleCouponApplied = (coupon: Coupon) => {
    setCoupon(coupon);
  };

  const handleCouponRemoved = () => {
    clearCoupon();
  };

  const handleCouponError = (error: string) => {
    toast.error(error);
  };

  const handleInternationalOrderDialogClose = () => {
    setShowInternationalOrderDialog(false);
    finalizeOrder();
  };

  const handlePostalCodeValidation = async (postalCode: string, countryCode: string) => {
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    pincodeDebounceRef.current = setTimeout(async () => {
      // For Indian addresses, use the existing pincode validation
      if (countryCode === "IN") {
        const pincodeResponse = await validatePincode(postalCode);
        if (!pincodeResponse.isValid) {
          form.setError("address.zip", { message: "Invalid Pincode", type: "validate" });
          return;
        }

        const selectedStateCode = form.getValues().address.state;
        const selectedCountryCode = form.getValues().address.country;

        const selectedState = State.getStateByCodeAndCountry(selectedStateCode, selectedCountryCode);

        if (pincodeResponse.data.state.toLowerCase() !== selectedState!.name.toLowerCase()) {
          form.setError("address.zip", { message: `Not a ${selectedState!.name} pincode`, type: "validate" });
          return;
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

  const subtotal = getSubtotal(cart, variants);
  const shippingCost = getShippingCost(cart, coupon, variants);
  const isShippingFree = shippingCost === 0;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const { message: couponError } = validateCouponInCart(coupon, subtotal);

  return (
    <>
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

      <div className="mx-auto py-10 px-2 max-w-lg mt-16 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex gap-10 justify-between items-center">
              <span>Begin the Brotherhood</span>
              <Button
                variant="link"
                className="px-0"
                onClick={() =>
                  window.open(getWhatsappNeedHelpWithOrderLink(form.getValues()), "_blank", "noreferrer noopener")
                }>
                Need Help?
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Input onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Input onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone (with country code)
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            type="tel"
                            onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={value => {
                              field.onChange(value);
                              form.setValue("address.state", "", {
                                shouldValidate: true,
                              });
                              form.setValue("address.zip", "", {
                                shouldValidate: true,
                              });
                            }}
                            defaultValue={field.value}
                            {...field}>
                            <SelectTrigger>
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

                  <FormField
                    control={form.control}
                    name="address.line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address Line 1
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Input onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          State/Province
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={v => {
                              form.setValue("address.state", v, {
                                shouldValidate: true,
                              });
                              handlePostalCodeValidation(form.getValues().address.zip, selectedCountry);
                            }}
                            defaultValue={field.value}
                            {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select State/Province" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            City
                            <RequiredStar />
                          </FormLabel>
                          <FormControl>
                            <Input onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Postal Code
                            <RequiredStar />
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={selectedCountry === "IN" ? "123456" : "Postal Code"}
                              onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                handlePostalCodeValidation(e.target.value, selectedCountry);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label>
                      Your Mischief
                      <RequiredStar />
                    </Label>

                    <div className="flex flex-col gap-2">
                      {cart.map(item => {
                        const variant = variants.find(v => v.id === item.variantId);

                        return (
                          <CheckoutProductCard
                            key={`${item.variantId}-${item.size}`}
                            variant={variant!}
                            updateCartItemBy={updateCartItem}
                            removeCartItem={removeCartItem}
                            quantity={item.quantity}
                            size={item.size}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {selectedVariantIds.length > 0 && (
                    <>
                      {isInternational ? (
                        <div className="flex flex-col gap-4">
                          <Separator className="mb-2" />

                          {/* International Order Notice */}
                          <div className="p-4 bg-accent/50 border border-border rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-6 h-6 text-bandit-orange"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  International Order - Manual Processing
                                </h3>
                                <p className="text-muted-foreground text-sm mb-3">
                                  Due to varying international shipping costs and customs regulations, we will handle
                                  your order manually to provide the most accurate pricing.
                                </p>
                                <div className="text-muted-foreground text-sm space-y-1">
                                  <p>
                                    • You will receive an email from{" "}
                                    <strong className="text-foreground">{BANDIT_EMAIL}</strong> with the exact cost
                                    breakdown within <strong className="text-foreground">24 hours</strong>
                                  </p>
                                  <p>
                                    • The email will include shipping costs, any applicable customs duties, and a secure
                                    payment link
                                  </p>
                                  <p>• Delivery typically takes 7-14 business days</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cart Summary for International */}
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-3">Your Order Summary</h4>
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="flex flex-col gap-1">
                                Cart Total
                                <span className="text-xs text-muted-foreground">
                                  {totalItems} {totalItems > 1 ? "items" : "item"}
                                </span>
                              </span>
                              <span className="font-medium">{formatCurrency(subtotal, 2)}</span>
                            </div>

                            {coupon && (
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span className="flex flex-col gap-1">
                                  Discount
                                  <span className="text-xs text-muted-foreground">
                                    Applied <span className="text-bandit-orange">{coupon.code}</span>
                                  </span>
                                </span>
                                <span className="font-medium">
                                  - {formatCurrency(getDiscountAmount(subtotal, coupon), 2)}
                                </span>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                              *Shipping costs and customs duties will be calculated and included in your email quote
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Separator className="mb-4" />

                          <div className="flex flex-col gap-2">
                            <CouponInput
                              coupon={coupon}
                              cartValue={subtotal}
                              onCouponApplied={handleCouponApplied}
                              onCouponRemoved={handleCouponRemoved}
                              onCouponError={handleCouponError}
                            />
                          </div>

                          <Separator className="my-4" />

                          <div className="flex justify-between items-center text-sm">
                            <span className="flex flex-col gap-1">
                              Subtotal
                              <span className="text-xs text-muted-foreground">
                                {totalItems} {totalItems > 1 ? "items" : "item"}
                              </span>
                            </span>
                            <span>{formatCurrency(subtotal, 2)}</span>
                          </div>

                          {coupon && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex flex-col gap-1">
                                Discount
                                <span className="text-xs text-muted-foreground">
                                  Applied <span className="text-bandit-orange">{coupon.code}</span>
                                </span>
                              </span>
                              <span>- {formatCurrency(getDiscountAmount(subtotal, coupon), 2)}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-sm">
                            <span className="flex flex-col gap-1">
                              Shipping
                              <span className="text-xs text-muted-foreground">
                                {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING !== null &&
                                  `Get Free Shipping on orders above ${formatCurrency(
                                    MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
                                  )}`}
                              </span>
                            </span>

                            <span className="flex items-center gap-1 capitalize">
                              {isShippingFree ? (
                                <>
                                  <span className="text-muted-foreground line-through">
                                    {formatCurrency(SHIPPING_COST)}
                                  </span>
                                  FREE
                                </>
                              ) : (
                                <span>{formatCurrency(shippingCost)}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span>
                              <span className="text-lg font-medium">Total Amount</span>
                              <p className="text-sm text-muted-foreground">Inclusive of all</p>
                            </span>
                            <span className="text-2xl font-bold self-start">{formatCurrency(orderTotal, 2)}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-col gap-2">
                    {!isInternational && !!couponError && <DangerBanner message={couponError} />}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        !formIsReady ||
                        orderLoading.create ||
                        orderLoading.update ||
                        (!isInternational && !!couponError)
                      }>
                      {isInternational
                        ? "Submit International Order"
                        : formIsReady
                        ? `Pay ${formatCurrency(orderTotal, 2)}`
                        : "Pay Now"}
                      {(orderLoading.create || orderLoading.update) && <LoadingIcon />}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

const RequiredStar = () => {
  return <span className="text-destructive ml-1">*</span>;
};

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderPageContent />
    </Suspense>
  );
}
