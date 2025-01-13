"use client";

import { z } from "zod";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State, IState } from "country-state-city";
import { Suspense, useEffect, useState } from "react";
import { designsObject, designs } from "@/data/products";
import { DropdownMenuCheckboxes } from "@/components/orders/multiSelectDropdown";
import { Badge } from "@/components/orders/badge";
import Image from "next/image";
import PaymentDrawer from "@/components/orders/paymentDrawer";
import { createOrder, updateOrder } from "@/actions/firestore";
import { Coupon, Order, SelectedDesignsType } from "@/types/order";
import { getTimestamp } from "@/utils/misc";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/loadingScreen";
import { validateCoupon } from "@/actions/validation";
import { DEFAULT_ORDER_VALUES } from "@/constants/order";
import { toast } from "sonner";

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
  products: z.array(
    z.object({
      designId: z.string(),
      quantity: z.number().gte(1, "Enter valid quantity"),
    })
  ),
});

const SHIPPING_COST = 100; // ₹100 for shipping

const calculateTotal = (products: SelectedDesignsType[]) => {
  const subtotal = products.reduce((total, product) => {
    const design = designsObject[product.designId];
    return total + design.price * product.quantity;
  }, 0);

  return subtotal + SHIPPING_COST;
};

const showErrorToast = (message: string) => {
  toast.error(message, { position: "top-right" });
};

const showSuccessToast = (message: string) => {
  toast.success(message);
};

function OrderPageContent() {
  const [states, setStates] = useState<IState[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<Order | null>(null);

  const searchParams = useSearchParams();
  const paramDesignId = searchParams.get("design");
  if (paramDesignId) DEFAULT_ORDER_VALUES.products = [{ designId: paramDesignId, quantity: 1 }];

  const form = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: DEFAULT_ORDER_VALUES,
    mode: "onTouched",
  });

  const watchCountry = useWatch({
    control: form.control,
    name: "address.country",
  });

  const watchProducts = useWatch({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    if (watchCountry) {
      const countryStates = State.getStatesOfCountry(watchCountry);
      setStates(countryStates);
    }
  }, [watchCountry]);

  useEffect(() => {
    const total = calculateTotal(watchProducts);
    setOrderTotal(total);
  }, [watchProducts]);

  const handleDesignChange = (id: string, checked: boolean, onChange: (designs: SelectedDesignsType[]) => void) => {
    let newDesignIds = [...selectedDesignsIds];

    if (checked) newDesignIds.push(id);
    else newDesignIds = newDesignIds.filter(_id => _id !== id);

    const designsFormContent = newDesignIds.map(id => {
      const qty = form.getValues("products").find(design => design.designId === id)?.quantity ?? 1;
      return { designId: id, quantity: qty };
    });
    onChange(designsFormContent);
  };

  const onSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    const order: Partial<Order> = {
      ...values,
      amount: orderTotal,
      couponCode: coupon?.code ?? null,
      createdAt: getTimestamp(),
      payment: { status: "initiated", updatedAt: getTimestamp() },
    };

    const orderObj = await createOrder(order);
    setPendingPaymentOrder(orderObj);
  };

  const handleValidateCoupon = async () => {
    const code = form.getValues("couponCode");
    if (code.length > 0) {
      const { isValid, coupon } = await validateCoupon(code);
      if (isValid) setCoupon(coupon);
      else {
        showErrorToast("Invalid Coupon");
        form.resetField("couponCode");
      }
    }
  };

  const onPaymentComplete = async () => {
    await updateOrder(pendingPaymentOrder!.id, { payment: { status: "approval-pending", updatedAt: getTimestamp() } });
    setPendingPaymentOrder(null);
    showSuccessToast("Order Placed");
    form.reset();
  };

  const onPaymentCancel = async () => {
    await updateOrder(pendingPaymentOrder!.id, { payment: { status: "cancelled", updatedAt: getTimestamp() } });
    setPendingPaymentOrder(null);
  };

  const selectedDesignsIds = watchProducts.map(product => product.designId);
  const formIsReady = form.formState.isValid && selectedDesignsIds.length > 0;

  return (
    <div className="mx-auto py-10 px-2 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Begin the Brotherhood</CardTitle>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                          placeholder="email@example.com"
                          {...field}
                        />
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                          placeholder="John Doe"
                          {...field}
                        />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                          placeholder="+919876543210"
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
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input
                          onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                          placeholder="Apartment, suite, etc."
                          {...field}
                        />
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
                        <Input
                          onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                          placeholder=""
                          {...field}
                        />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value} {...field}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value} {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map(state => (
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
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                            placeholder="Mumbai"
                            {...field}
                          />
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
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input
                            onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                            placeholder="400001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="products"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose your Mischief</FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex justify-between items-center bg-primary/5 p-2 rounded-md">
                            <span>
                              {selectedDesignsIds.map(id => (
                                <Badge key={id}>{designsObject[id].name}</Badge>
                              ))}
                            </span>

                            <DropdownMenuCheckboxes
                              designs={designs}
                              selectedIds={selectedDesignsIds}
                              onChange={(id, checked) => handleDesignChange(id, checked, field.onChange)}
                            />
                          </div>

                          {selectedDesignsIds.map((id, index) => {
                            return (
                              <div key={id} className="flex items-center gap-4 mt-4 p-4 border rounded-lg relative">
                                <Image
                                  src={designsObject[id].image}
                                  width={80}
                                  height={80}
                                  alt={designsObject[id].name}
                                  className="w-20 h-20 object-cover rounded-md"
                                />

                                <div className="flex-1">
                                  <h3 className="font-medium">{designsObject[id].name}</h3>
                                  <p className="text-sm text-muted-foreground">₹{designsObject[id].price}</p>
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.quantity`}
                                  render={({ field, formState }) => (
                                    <Input
                                      {...field}
                                      onChange={e => {
                                        const intQty = parseInt(e.target.value);
                                        field.onChange(!isNaN(intQty) ? intQty : 0);
                                      }}
                                      type="number"
                                      onKeyDown={e => (e.key === "Enter" ? e.preventDefault() : null)}
                                      className={`max-w-20 self-end ${
                                        formState.errors.products?.[index]?.quantity ? "border-destructive" : ""
                                      }`}
                                    />
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDesignChange(id, false, field.onChange)}
                                  className="absolute top-0 right-0">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {selectedDesignsIds.length > 0 && (
                  <div className="flex flex-col gap-2 py-4 mt-4 border-t">
                    <div className="flex gap-2 mb-4">
                      <FormField
                        control={form.control}
                        name="couponCode"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Enter coupon code"
                                onKeyDown={e => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleValidateCoupon();
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="button" onClick={handleValidateCoupon} variant="secondary">
                        Apply
                      </Button>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal</span>
                      <span>₹{orderTotal - SHIPPING_COST}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Shipping</span>
                      <span>₹{SHIPPING_COST}</span>
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

                <Button type="submit" className="w-full" disabled={!formIsReady}>
                  {formIsReady ? `Pay ₹${orderTotal}` : "Pay Now"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {pendingPaymentOrder && (
        <PaymentDrawer
          open={!!pendingPaymentOrder}
          onComplete={onPaymentComplete}
          onCancel={onPaymentCancel}
          amount={orderTotal}
          orderDetails={pendingPaymentOrder}
        />
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderPageContent />
    </Suspense>
  );
}
