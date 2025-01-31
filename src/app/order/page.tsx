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
import { DESIGNS_OBJ, DESIGNS, Design } from "@/data/designs";
import { MultiSelectDropdown } from "@/components/dropdowns/MultiSelectDropdown";

import { Order, OrderProduct, SelectedDesignsType } from "@/types/order";
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
import { useFavorites } from "@/components/stores/favorites";
import { CouponInput } from "@/components/inputs/Coupon";
import { getDiscountAmount, validateCouponInCart } from "@/utils/coupon";
import { FEATURED_COUPON } from "@/components/typography/coupons";
import { DangerBanner } from "@/components/misc/Banners";
import { validatePincode } from "@/lib/pincode";

const SHIPPING_COST = 50;
const MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING = 750;

const countries = Country.getAllCountries();

const orderFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Enter valid name"),
  couponCode: z.string(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Enter valid phone number",
  }),
  address: z.object({
    line1: z.string().min(2, "Enter valid address"),
    line2: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string().min(2, "Enter valid city"),
    zip: z.string().length(6, "Enter valid zip code"),
  }),
});

const getSubtotal = (products: SelectedDesignsType[]) => {
  if (products.length === 0) return 0;

  return products.reduce((total, product) => {
    const design = DESIGNS_OBJ[product.designId];
    return total + design.price * product.quantity;
  }, 0);
};

const getShippingCost = (products: SelectedDesignsType[], coupon: Coupon | null) => {
  if (products.length === 0) return 0;
  const subtotal = getSubtotal(products);
  const discount = getDiscountAmount(subtotal, coupon);
  const total = subtotal - discount;

  if (total >= MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING) return 0;
  return SHIPPING_COST;
};

const calculateTotal = (products: SelectedDesignsType[], coupon: Coupon | null) => {
  const subtotal = getSubtotal(products);
  const discount = getDiscountAmount(subtotal, coupon);
  const shippingCost = getShippingCost(products, coupon);

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
  const { favorites } = useFavorites();
  const searchParams = useSearchParams();
  const { orderLoading, createOrder } = useOrderActions();

  const watchCountry = useWatch({ control: form.control, name: "address.country" });

  const { cart, coupon, setCoupon, updateCartItem, removeCartItem, clearCart, clearCoupon } = useCart();

  const [favFirstDesigns, setFavFirstDesigns] = useState<Design[]>([]);
  const [countryStates, setCountryStates] = useState<IState[]>([]);

  const rzpRef = useRef<RazorpayPaymentGatewayRef>(null);
  const pincodeDebounceRef = useRef<NodeJS.Timeout>(undefined);

  const oldFieldsValues = useRef(form.getValues());
  const watchAllFields = form.watch();

  // Trigger form validation on auto-filled fields
  // https://github.com/orgs/react-hook-form/discussions/1882#discussioncomment-9447454
  useEffect(() => {
    for (const target of Object.keys(watchAllFields)) {
      const targetKey = target as keyof typeof watchAllFields;

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

  useEffect(() => {
    const favDesigns = DESIGNS.filter(design => favorites.includes(design.id));
    const otherDesigns = DESIGNS.filter(design => !favorites.includes(design.id));
    setFavFirstDesigns([...favDesigns, ...otherDesigns]);
  }, [favorites]);

  const paymentMode = (searchParams.get("mode") ?? "rzp") as "rzp" | "cash";
  const orderTotal = calculateTotal(cart, coupon);

  const handleDesignChange = (id: string, checked: boolean) => {
    if (checked) updateCartItem(id);
    else removeCartItem(id);
  };

  const onSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    const products: OrderProduct[] = cart.map(product => ({
      id: product.designId,
      name: DESIGNS_OBJ[product.designId].name,
      price: DESIGNS_OBJ[product.designId].price,
      image: DESIGNS_OBJ[product.designId].image,
      quantity: product.quantity,
    }));

    const order: Omit<Order, "id" | "status"> = {
      ...values,
      products,
      paymentMode,
      total: orderTotal,
      subtotal: getSubtotal(cart),
      discount: getDiscountAmount(subtotal, coupon),
      shipping: getShippingCost(cart, coupon),
      createdAt: getTimestamp(),
      couponCode: coupon?.code ?? null,
    };

    identifyUser(order.email, { name: order.name, phone: order.phone, email: order.email });

    const orderObj = await createOrder(order);

    if (orderObj.paymentMode === "rzp") rzpRef.current?.handlePayment(orderObj);
    else if (orderObj.paymentMode === "cash") {
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

  const handlePincodeValidation = async (pincode: string) => {
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    pincodeDebounceRef.current = setTimeout(async () => {
      const pincodeResponse = await validatePincode(pincode);
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

      form.resetField("address.zip", { keepDirty: true, keepError: false, keepTouched: true, defaultValue: pincode });
    }, 700);
  };

  const selectedDesignsIds = cart.map(product => product.designId);
  const formIsReady = form.formState.isValid && selectedDesignsIds.length > 0;

  const subtotal = getSubtotal(cart);
  const shippingCost = getShippingCost(cart, coupon);
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

      <div className="mx-auto py-10 px-2 max-w-lg mt-16">
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
                          Phone
                          <RequiredStar />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                            {...field}
                          />
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Select disabled onValueChange={field.onChange} defaultValue={field.value} {...field}>
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
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={v => {
                                field.onChange(v);
                                handlePincodeValidation(form.getValues().address.zip);
                              }}
                              defaultValue={field.value}
                              {...field}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State" />
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
                            Zip Code
                            <RequiredStar />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={100000}
                              max={999999}
                              onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                handlePincodeValidation(e.target.value);
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
                      Choose your Mischief
                      <RequiredStar />
                    </Label>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-primary/5 p-2 rounded-md">
                        <span>
                          {selectedDesignsIds.map(id => (
                            <Badge key={id}>{DESIGNS_OBJ[id].name}</Badge>
                          ))}
                        </span>

                        <MultiSelectDropdown
                          designs={favFirstDesigns}
                          selectedIds={selectedDesignsIds}
                          onChange={(id, checked) => handleDesignChange(id, checked)}
                        />
                      </div>

                      {selectedDesignsIds.map(id => {
                        return (
                          <CheckoutProductCard
                            key={id}
                            design={{ ...DESIGNS_OBJ[id], id }}
                            updateCartItemBy={updateCartItem}
                            removeCartItem={removeCartItem}
                            quantity={cart.find(design => design.designId === id)?.quantity ?? 1}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {selectedDesignsIds.length > 0 && (
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
                        {!coupon && (
                          <span className="text-xs text-muted-foreground">
                            <FEATURED_COUPON.NoCouponAppliedMessage />
                          </span>
                        )}
                        {coupon &&
                          coupon.code !== FEATURED_COUPON.code &&
                          getDiscountAmount(subtotal, coupon) < 200 && (
                            <span className="text-xs text-muted-foreground">
                              <FEATURED_COUPON.CouponAppliedMessage />
                            </span>
                          )}
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between items-center text-sm">
                        <span className="flex flex-col gap-1">
                          Subtotal
                          <span className="text-xs text-muted-foreground">
                            {totalItems} {totalItems > 1 ? "items" : "item"}
                          </span>
                        </span>
                        <span>₹{subtotal}</span>
                      </div>

                      {coupon && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex flex-col gap-1">
                            Discount
                            <span className="text-xs text-muted-foreground">Applied {coupon.code}</span>
                          </span>
                          <span>- ₹{getDiscountAmount(subtotal, coupon)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm">
                        <span className="flex flex-col gap-1">
                          Shipping
                          <span className="text-xs text-muted-foreground">
                            Get Free Shipping on orders above ₹{MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING}
                          </span>
                        </span>

                        <span className="flex items-center gap-1 capitalize">
                          {isShippingFree ? (
                            <>
                              <span className="text-muted-foreground line-through">₹{SHIPPING_COST}</span>
                              FREE
                            </>
                          ) : (
                            <span>₹{shippingCost}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span>
                          <span className="text-lg font-medium">Total Amount</span>
                          <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
                        </span>
                        <span className="text-2xl font-bold self-start">₹{orderTotal}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {!!couponError && <DangerBanner message={couponError} />}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!formIsReady || orderLoading.create || orderLoading.update || !!couponError}>
                      {formIsReady ? `Pay ₹${orderTotal}` : "Pay Now"}
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

function Badge(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mr-1 mb-1">
      {props.children}
    </span>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderPageContent />
    </Suspense>
  );
}
