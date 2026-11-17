"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminLogin, checkAdminSession } from "@/actions/admin";
import useIsMobile from "@/hooks/useIsMobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OrderManagement } from "./OrderManagement";
import { CouponManagement } from "./CouponManagement";
import { ReviewManagement } from "./ReviewManagement";
import { ProductManagement } from "./ProductsManagement";
import { StockNotificationsManagement } from "./StockNotificationsManagement";

export default function ProtectedAdminPage() {
  const isMobile = useIsMobile();

  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminSession()
      .then(setIsAdmin)
      .finally(() => setIsLoading(false));
  }, []);

  // Keep the team's own browsing out of analytics (persists for this browser)
  useEffect(() => {
    if (isAdmin) posthog.opt_out_capturing();
  }, [isAdmin]);

  useEffect(() => {
    if (error) setTimeout(() => setError(""), 3000);
  }, [error]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (await adminLogin(password)) return setIsAdmin(true);
    setError("Invalid password");
    setPassword("");
  };

  if (isLoading) return null;

  if (isMobile)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Please use a desktop browser to access this page.
      </div>
    );

  return isAdmin ? (
    <div className="flex flex-col gap-4 container mx-auto py-10 mt-20 min-h-screen">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stock-requests">Stock Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="coupons">
          <CouponManagement />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewManagement />
        </TabsContent>
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        <TabsContent value="stock-requests">
          <StockNotificationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={onSubmit}>
        <div className="flex flex-row gap-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            className={`${error ? "border-destructive" : ""}`}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
}
