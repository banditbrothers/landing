import { useEffect } from "react";

import { useCouponActions } from "@/hooks/useCouponActions";
import { Coupon } from "@/types/coupon";
import { useState } from "react";
import { getCoupons } from "@/actions/coupons";
import { toast } from "sonner";
import { getDate, getTimestamp } from "@/utils/timestamp";
import { Button } from "@/components/ui/button";
import { LoadingIcon, LoadingScreen } from "@/components/misc/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CouponManagement() {
  const { addCoupon, couponLoading, updateCoupon } = useCouponActions();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCoupons().then(coupons => {
      setCoupons(coupons);
      setIsLoading(false);
    });
  }, []);

  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const couponCode = e.currentTarget.couponCode.value;
    const couponName = e.currentTarget.couponName.value;
    const couponDescription = e.currentTarget.couponDescription.value;
    const couponType = e.currentTarget.couponType.value;
    const couponDiscount = e.currentTarget.couponDiscount.value;
    const couponMinAmount = e.currentTarget.couponMinAmount.value;

    const expiresAtStr = e.currentTarget.couponExpires.value;
    let expiresAt: Date | null = new Date(expiresAtStr);

    if (expiresAt.getTime() < Date.now()) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    if (expiresAt.toString() === "Invalid Date") {
      expiresAt = null;
    }

    if (!couponCode || !couponName || !couponDescription || !couponType || !couponDiscount || !couponMinAmount) {
      toast.error("Please fill all fields");
      return;
    }

    const coupon: Omit<Coupon, "id"> = {
      code: couponCode.toUpperCase(),
      name: couponName,
      description: couponDescription,
      discountType: couponType as "fixed" | "percentage",
      discount: Number(couponDiscount),
      minOrderAmount: Number(couponMinAmount),
      expiresAt: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null,
      createdAt: getTimestamp(),
      isActive: true,
    };

    const newCoupon = await addCoupon(coupon);
    setCoupons(prev => [newCoupon, ...prev]);
    setShowDialog(false);
  };

  const handleCouponActiveChange = async (couponId: string, checked: boolean) => {
    try {
      await updateCoupon(couponId, { isActive: checked });
      setCoupons(prev => prev.map(c => (c.id === couponId ? { ...c, isActive: checked } : c)));
    } catch (error: unknown) {
      toast.error("Failed to update coupon status", { description: (error as Error).message });
    }
  };

  const onOpenDialog = () => {
    setShowDialog(true);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Coupons Management</CardTitle>
            <Button onClick={() => onOpenDialog()}>Add Coupon</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.id}</TableCell>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discountType === "fixed"
                        ? `₹${coupon.discount} off on orders above ₹${coupon.minOrderAmount}`
                        : `${coupon.discount}% off on orders above ₹${coupon.minOrderAmount}`}
                    </TableCell>
                    <TableCell>{coupon.expiresAt ? getDate(coupon.expiresAt).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <Switch
                        id={`coupon-${coupon.id}-active`}
                        checked={coupon.isActive}
                        disabled={couponLoading.updating}
                        onCheckedChange={checked => handleCouponActiveChange(coupon.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleAddCoupon}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input id="couponCode" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="couponName" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="couponDescription" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select name="couponType" defaultValue="fixed">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent id="couponType">
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                Discount
              </Label>
              <Input id="couponDiscount" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minAmount" className="text-right">
                Min Amount
              </Label>
              <Input id="couponMinAmount" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expires" className="text-right">
                Expires At
              </Label>
              <Input id="couponExpires" type="date" className="col-span-3" />
            </div>
            <DialogFooter className="mt-2">
              <div className="flex flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button disabled={couponLoading.adding} type="submit">
                  {couponLoading.adding ? <LoadingIcon /> : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
