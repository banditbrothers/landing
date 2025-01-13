"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/admin/dateRange";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/order";
import { getOrders, updateOrder } from "@/actions/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDate, getTimestamp, hash } from "@/utils/misc";
import { EyeIcon } from "@/components/icons";
import LoadingScreen from "@/components/loadingScreen";
import { CheckIcon, X } from "lucide-react";

type FilterOrder =
  | {
      by: "email";
      value: string;
    }
  | {
      by: "date";
      value: DateRange | undefined;
    };

function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const onEmailFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mail = e.target.value;
    setEmailFilter(mail);
    filterOrders({ by: "email", value: mail });
  };

  const filterOrders = ({ by, value }: FilterOrder) => {
    let filtered = [...orders];
    const _email = by === "email" ? value : emailFilter;
    const _date = by === "date" ? value : dateRange;

    if (_email) {
      filtered = filtered.filter(order => order.email.toLowerCase().includes(_email.toLowerCase()));
    }

    if (_date && _date.from && _date.to) {
      filtered = filtered.filter(
        order => order.createdAt >= _date.from!.getTime() && order.createdAt <= _date.to!.getTime()
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setEmailFilter("");
    setDateRange(undefined);
    setFilteredOrders(orders);
  };

  const handlePaymentStatusChange = async (orderId: string, status: OrderStatus) => {
    const change = { payment: { status, updatedAt: getTimestamp() } };
    await updateOrder(orderId, change);
    const newOrder = orders.find(order => order.id === orderId);

    if (newOrder) {
      newOrder.payment = change.payment;
      setFilteredOrders(prev => [...prev.filter(order => order.id !== orderId), newOrder]);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <DateRangePicker date={dateRange} onChange={onDateRangeChange} />
            <Input
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={onEmailFilterChange}
              className="max-w-sm bg-background"
            />
            <Button onClick={clearFilters} className="rounded-md">
              Clear
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-primary/10">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{getDate(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-2 items-center">
                        {order.payment.status}
                        {["approval-pending", "initiated"].includes(order.payment.status) && (
                          <div className="flex flex-row gap-2">
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => handlePaymentStatusChange(order.id, "paid")}>
                              <CheckIcon />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePaymentStatusChange(order.id, "admin-cancelled")}>
                              <X />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" onClick={() => showDialog(order)}>
                        <EyeIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent aria-describedby="order-details" className="max-w-3xl max-h-[80vh]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
              </DialogHeader>

              <div className="max-h-[80vh] overflow-auto">
                <pre className="bg-muted p-4 rounded-lg">
                  <code>{JSON.stringify(selectedOrder, null, 2)}</code>
                </pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProtectedAdminPage() {
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

  return isAdmin ? (
    <AdminPage />
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
