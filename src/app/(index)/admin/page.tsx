"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hash } from "@/utils/misc";
import useIsMobile from "@/hooks/useIsMobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OrderManagement } from "./OrderManagement";
import { CouponManagement } from "./CouponManagement";
import { ReviewManagement } from "./ReviewManagement";
import { ProductManagement } from "./ProductsManagement";

export default function ProtectedAdminPage() {
  const isMobile = useIsMobile();

  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    const storedHash = localStorage.getItem("ADMIN_PASSWORD_HASH");
    if (storedHash) checkAdmin(storedHash);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (error) setTimeout(() => setError(""), 3000);
  }, [error]);

  const checkAdmin = async (hashedPassword: string) => {
    const adminHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH;

    if (hashedPassword === adminHash) {
      localStorage.setItem("ADMIN_PASSWORD_HASH", adminHash);
      setIsAdmin(true);
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hashedPassword = hash(password).toString();
    checkAdmin(hashedPassword);
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
