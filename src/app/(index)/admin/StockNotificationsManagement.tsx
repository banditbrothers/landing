"use client";

import { useEffect, useState } from "react";
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
import { getDate } from "@/utils/timestamp";

export const StockNotificationsManagement = () => {
  const [requests, setRequests] = useState<StockNotification[]>([]);
  const [variants, setVariants] = useState<Record<string, ProductVariant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    Promise.all([getStockNotifications(), getVariantsAdmin()])
      .then(([requests, variants]) => {
        setRequests(requests);
        setVariants(Object.fromEntries(variants.map(v => [v.id, v])));
      })
      .catch(error => {
        console.error("Error loading stock requests:", error);
        toast.error("Failed to load stock requests");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkNotified = async (id: string) => {
    try {
      await updateStockNotificationStatus(id, "notified");
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: "notified" } : r)));
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

  // Pending requests per variant + size, most requested first
  const pendingCounts = Object.entries(
    pending.reduce<Record<string, number>>((acc, r) => {
      const key = `${r.variantId}|${r.size}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

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

      {pendingCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingCounts.map(([key, count]) => {
            const [variantId, size] = key.split("|");
            return (
              <Badge key={key} variant="secondary">
                {variantLabel(variantId)} ({getSizeLabel(size)}): {count} waiting
              </Badge>
            );
          })}
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
                  <TableCell>{new Date(getDate(request.createdAt)).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{stock ?? "Not tracked"}</TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <Button size="sm" variant="outline" onClick={() => handleMarkNotified(request.id)}>
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
