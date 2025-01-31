"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/misc/DateRangePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { Coupon } from "@/types/coupon";
import { getOrders } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { hash } from "@/utils/misc";
import { EyeIcon } from "@/components/misc/icons";
import { LoadingIcon, LoadingScreen } from "@/components/misc/Loading";
import { getAddressString } from "@/utils/address";
import { formattedDateTime, getDate, getTimestamp } from "@/utils/timestamp";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useIsMobile from "@/hooks/useIsMobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCouponActions } from "@/hooks/useCouponActions";
import { toast } from "sonner";
import { getCoupons } from "@/actions/coupons";
import { formatCurrency } from "@/utils/price";

type FilterOrder =
  | {
      by: "name";
      value: string;
    }
  | {
      by: "phone";
      value: string;
    }
  | {
      by: "date";
      value: DateRange | undefined;
    };

const itemsPerPage = 10;

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getOrders().then(orders => {
      setOrders(orders);
      setFilteredOrders(orders);
      setIsLoading(false);
    });
  }, []);

  const showDialog = (order: Order) => {
    setSelectedOrder(order);
  };

  const onDateRangeChange = (date: DateRange | undefined) => {
    setDateRange(date);
    filterOrders({ by: "date", value: date });
  };

  const onNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameFilter(name);
    filterOrders({ by: "name", value: name });
  };

  const onPhoneFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneFilter(phone);
    filterOrders({ by: "phone", value: phone });
  };

  const filterOrders = ({ by, value }: FilterOrder) => {
    let filtered = [...orders];
    const _name = by === "name" ? value : nameFilter;
    const _phone = by === "phone" ? value : phoneFilter;
    const _date = by === "date" ? value : dateRange;

    if (_name) {
      filtered = filtered.filter(order => order.name.toLowerCase().includes(_name.toLowerCase()));
    }

    if (_phone) {
      filtered = filtered.filter(order => order.phone.includes(_phone));
    }

    if (_date && _date.from && _date.to) {
      filtered = filtered.filter(
        order =>
          getDate(order.createdAt).getTime() >= _date.from!.getTime() &&
          getDate(order.createdAt).getTime() <= _date.to!.getTime()
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setNameFilter("");
    setPhoneFilter("");
    setDateRange(undefined);
    setFilteredOrders(orders);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndexOnCurrentPage = (currentPage - 1) * itemsPerPage;
  const endIndexOnCurrentPage = startIndexOnCurrentPage + itemsPerPage;
  const currentPageOrders = filteredOrders.slice(startIndexOnCurrentPage, endIndexOnCurrentPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <DateRangePicker date={dateRange} onChange={onDateRangeChange} />
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={onNameFilterChange}
              className="max-w-xs bg-background"
            />
            <Input
              placeholder="Filter by phone..."
              value={phoneFilter}
              onChange={onPhoneFilterChange}
              className="max-w-xs bg-background"
            />
            <Button variant="outline" onClick={clearFilters} className="rounded-md">
              Clear
            </Button>

            <div className="flex items-center justify-self-end">
              <span className="text-sm text-muted-foreground">Total Orders: {orders.length}</span>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto min-h-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageOrders.map(order => (
                  <TableRow
                    key={order.id}
                    className={`${
                      order.status === "payment-failed" ? "bg-destructive/10 hover:bg-destructive/20" : ""
                    }`}>
                    <TableCell>{formattedDateTime(order.createdAt)}</TableCell>

                    <TableCell>{order.name}</TableCell>

                    <TableCell>{order.phone}</TableCell>

                    <TableCell className="max-w-xs">{getAddressString(order.address)}</TableCell>

                    <TableCell>{formatCurrency(order.total)}</TableCell>

                    <TableCell>
                      <div
                        className={`flex flex-row gap-2 items-center ${
                          order.status === "payment-failed" ? "text-destructive" : ""
                        }`}>
                        {order.paymentMode} / {order.status}
                      </div>
                    </TableCell>

                    <TableCell className="flex flex-row gap-2">
                      <Button variant="outline" size="icon" onClick={() => showDialog(order)}>
                        <EyeIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
                    <PaginationPrevious className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                  </button>
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <button onClick={() => handlePageChange(i + 1)}>
                      <PaginationLink isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                    </button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
                    <PaginationNext className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <>
            <DialogContent aria-describedby="order-details" className="max-w-3xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Order Details for {selectedOrder.id}</DialogTitle>
              </DialogHeader>

              <div className="max-h-[80vh] overflow-auto">
                <pre className="bg-muted p-4 rounded-lg">
                  <code>{JSON.stringify(selectedOrder, null, 2)}</code>
                </pre>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}

function CouponManagement() {
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
    <div className="flex flex-col gap-4 container mx-auto py-10 mt-16 min-h-screen">
      <OrderManagement />
      <CouponManagement />
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
