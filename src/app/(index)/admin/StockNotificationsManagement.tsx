"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingIcon } from "@/components/misc/Loading";
import { getStockNotifications, updateStockNotificationStatus } from "@/actions/stockNotifications";
import { getVariantsAdmin } from "@/actions/products";
import { StockNotification } from "@/types/stockNotification";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, getSizeLabel } from "@/utils/product";
import { PRODUCTS_OBJ } from "@/data/products";
import { formattedDateTimeLong } from "@/utils/timestamp";
import { useAdminLoad } from "./adminHooks";

export const StockNotificationsManagement = () => {
  const [requests, setRequests] = useState<StockNotification[]>([]);
  const [variants, setVariants] = useState<Record<string, ProductVariant>>({});
  const [showAll, setShowAll] = useState(false);

  const isLoading = useAdminLoad(
    () => Promise.all([getStockNotifications(), getVariantsAdmin()]),
    ([requests, variants]) => {
      setRequests(requests);
      setVariants(Object.fromEntries(variants.map(v => [v.id, v])));
    },
    "stock requests"
  );

  const handleMarkNotified = async (ids: string[], item: string) => {
    const who = ids.length > 1 ? `all ${ids.length} customers` : "this customer";
    if (
      !confirm(
        `Mark ${item} as notified?\n\nOnly do this after you've told ${who} it's back in stock. They'll be moved out of the pending list.`
      )
    )
      return;
    try {
      await updateStockNotificationStatus(ids, "notified");
      setRequests(prev => prev.map(r => (ids.includes(r.id) ? { ...r, status: "notified" } : r)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingIcon />
      </div>
    );
  }

  const pending = requests.filter(r => r.status === "pending");
  const visible = showAll ? requests : pending;

  // Pending requests grouped by variant + size, most requested first
  const restockQueue = Object.values(
    pending.reduce<Record<string, { variantId: string; size: string; ids: string[] }>>((acc, r) => {
      const key = `${r.variantId}|${r.size}`;
      (acc[key] ??= { variantId: r.variantId, size: r.size, ids: [] }).ids.push(r.id);
      return acc;
    }, {})
  ).sort((a, b) => b.ids.length - a.ids.length);

  const variantLabel = (variantId: string) => {
    const variant = variants[variantId];
    return variant ? getProductVariantName(variant, { includeProductName: true }) : variantId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Back-in-Stock Requests</h2>
          <p className="text-muted-foreground">Customers waiting for a design/size to be restocked</p>
        </div>
        <Button variant="outline" onClick={() => setShowAll(v => !v)}>
          {showAll ? "Show pending only" : "Show all"}
        </Button>
      </div>

      {restockQueue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Restock queue</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>Design</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Waiting</TableHead>
                  <TableHead className="text-right">In stock</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {restockQueue.map(({ variantId, size, ids }) => {
                  const variant = variants[variantId];
                  const stock = variant?.stock?.[size];
                  return (
                    <TableRow key={`${variantId}|${size}`}>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {variant?.images.mockup[0] && (
                            <Image
                              src={variant.images.mockup[0]}
                              alt={variantLabel(variantId)}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{variant ? getProductVariantName(variant) : variantId}</div>
                        <div className="text-sm text-muted-foreground">
                          {variant ? PRODUCTS_OBJ[variant.productId]?.name : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSizeLabel(size)}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-2xl font-bold tabular-nums">{ids.length}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${stock === 0 ? "text-destructive font-semibold" : ""}`}>
                        {stock ?? "–"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkNotified(ids, `${variantLabel(variantId)} (${getSizeLabel(size)})`)}>
                          <Check className="w-4 h-4 mr-1" /> Mark all notified
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <h3 className="text-lg font-semibold pt-4">All requests</h3>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No {showAll ? "" : "pending "}requests
                </TableCell>
              </TableRow>
            )}
            {visible.map(request => {
              const variant = variants[request.variantId];
              const stock = variant?.stock?.[request.size];
              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {variant?.images.mockup[0] && (
                        <Image
                          src={variant.images.mockup[0]}
                          alt={variantLabel(request.variantId)}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{variantLabel(request.variantId)}</TableCell>
                  <TableCell>{getSizeLabel(request.size)}</TableCell>
                  <TableCell>{request.email ?? "–"}</TableCell>
                  <TableCell>{request.phone ?? "–"}</TableCell>
                  <TableCell>{formattedDateTimeLong(request.createdAt)}</TableCell>
                  <TableCell>{stock ?? "Not tracked"}</TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleMarkNotified(
                            [request.id],
                            `${variantLabel(request.variantId)} (${getSizeLabel(request.size)})`
                          )
                        }>
                        <Check className="w-4 h-4 mr-1" /> Mark notified
                      </Button>
                    ) : (
                      <Badge variant="outline">Notified</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
