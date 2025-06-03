"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/misc/Loading";
import { getOrder } from "@/actions/orders";
import { Order } from "@/types/order";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency } from "@/utils/price";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formattedDateTimeLong } from "@/utils/timestamp";
import { Separator } from "@/components/ui/separator";
import { getWhatsappNeedHelpLink } from "@/utils/whatsappMessageLinks";
import { redactEmail, redactPhone, redactName } from "@/utils/redact";
import Link from "next/link";
import { getProductVariantUrl } from "@/utils/share";
import { useVariants } from "@/hooks/useVariants";
import { getProductVariantName, getProductVariantPrice } from "@/utils/product";

type OrderPageProps = { params: Promise<{ orderId: string }> };

export default function OrderPage({ params }: OrderPageProps) {
  const { data: variants } = useVariants();

  const [order, setOrder] = useState<Order | null>(null);
  const { copy, isCopied } = useCopyToClipboard();

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = (await params).orderId;
      const order = await getOrder(orderId);
      setOrder(order);
    };
    fetchOrder();
  }, [params]);

  if (!order) return <LoadingScreen />;

  return (
    <div className="container mx-auto py-8 px-4 mt-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
            <div>
              <CardTitle className="flex flex-col md:flex-row gap-0 md:gap-2 items-start md:items-center text-xl">
                <span className="font-medium">Order ID</span>
                <span>
                  <span className="font-bold">{order.id}</span>
                  <Button className="ml-2" variant="ghost" size="icon" onClick={() => copy(order.id)}>
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                  </Button>
                </span>
              </CardTitle>
              <CardDescription>Placed on {formattedDateTimeLong(order.createdAt)}</CardDescription>
            </div>
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium capitalize">
              {order.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-2 md:p-6">
          {/* Customer Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bandit Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {redactName(order.name)}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {redactEmail(order.email)}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {redactPhone(order.phone)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.variants.map((orderVariant, index) => {
                  const variant = variants.find(v => v.id === orderVariant.variantId)!;

                  const name = getProductVariantName(variant, { includeProductName: true });
                  const price = getProductVariantPrice(variant);
                  const quantity = orderVariant.quantity;

                  return (
                    <div key={variant.id}>
                      <div className="flex items-start gap-4 py-2">
                        <Link href={getProductVariantUrl(variant)} target="_blank">
                          <Image
                            width={100}
                            height={100}
                            className="rounded"
                            alt={name}
                            src={variant.images.mockup[0]}
                          />
                        </Link>
                        <div className="flex-1">
                          <h4 className="font-medium">{name}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(price * quantity, 2)}</p>
                        </div>
                      </div>
                      {index < order.variants.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Payment Method */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMode === "rzp" ? `${order.rzp.paymentMethod} / Razorpay` : "Cash"}
                  </span>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal, 2)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        Discount
                        <span className="text-xs bg-muted text-green-600 px-2 py-0.5 rounded-full">
                          {order.couponCode}
                        </span>
                      </span>
                      <span>-{formatCurrency(order.discount, 2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(order.total, 2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            className="w-full py-8"
            onClick={() => window.open(getWhatsappNeedHelpLink(order.id), "_blank")}>
            Need Help? Contact Us On WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
