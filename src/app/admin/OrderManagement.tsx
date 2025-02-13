import { useEffect } from "react";

import { Order } from "@/types/order";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { getOrders } from "@/actions/orders";
import { formattedDateTimeLong, getDate } from "@/utils/timestamp";
import { LoadingScreen } from "@/components/misc/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/misc/DateRangePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/price";
import { getAddressString } from "@/utils/address";
import {
  Pagination,
  PaginationPrevious,
  PaginationItem,
  PaginationContent,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EyeIcon } from "@/components/misc/icons";
import { SignatureIcon } from "lucide-react";
import { getWhatsappOrderReviewLink } from "@/utils/whatsappMessageLinks";

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

export function OrderManagement() {
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
                    <TableCell>{formattedDateTimeLong(order.createdAt)}</TableCell>

                    <TableCell>{order.name}</TableCell>

                    <TableCell>{order.phone}</TableCell>

                    <TableCell className="max-w-xs">{getAddressString(order.address)}</TableCell>

                    <TableCell>{formatCurrency(order.total, 2)}</TableCell>

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

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!!order.reviewId}
                        onClick={() => {
                          const link = getWhatsappOrderReviewLink(order);
                          window.open(link, "_blank");
                        }}>
                        <SignatureIcon className={`w-4 h-4 ${order.reviewId ? "text-[#00ff00]" : ""}`} />
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
