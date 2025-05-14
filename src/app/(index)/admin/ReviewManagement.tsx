import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

import { ReviewStatus } from "@/types/review";

import { getReviewsAdmin, updateReview } from "@/actions/reviews";
import { Review } from "@/types/review";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/misc/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon, EyeIcon, XMarkIcon } from "@/Icons/icons";
import {
  Pagination,
  PaginationPrevious,
  PaginationItem,
  PaginationContent,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

export function ReviewManagement() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getReviewsAdmin().then(reviews => {
      setReviews(reviews);
      setIsLoading(false);
    });
  }, []);

  const handleStatusChange = async (reviewId: string, status: ReviewStatus) => {
    try {
      await updateReview(reviewId, { status });
      setReviews(prev => prev.map(review => (review.id === reviewId ? { ...review, status } : review)));
      toast.success(`Review ${status} successfully`);
    } catch (e) {
      toast.error("Failed to update review status", { description: (e as Error).message });
    }
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) return <LoadingScreen />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageReviews.map(review => (
                <TableRow key={review.id}>
                  <TableCell>{new Date(review.createdAt * 1000).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{review.name}</span>
                      <span className="text-sm text-muted-foreground">{review.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{review.rating}/5</TableCell>
                  <TableCell>{review.title}</TableCell>
                  <TableCell className="max-w-xs">{review.comment}</TableCell>
                  <TableCell>
                    {review.images.map((image, index) => (
                      <Link key={index} href={image} target="_blank">
                        <div className="flex flex-row gap-2 items-center">
                          <Button variant="link" size="icon">
                            Image {index + 1}
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {review.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {review.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600"
                            onClick={() => handleStatusChange(review.id, "approved")}>
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600"
                            onClick={() => handleStatusChange(review.id, "rejected")}>
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        className=""
                        onClick={() => setSelectedReview(review)}>
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </div>
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
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                  <PaginationPrevious className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                </button>
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <button onClick={() => setCurrentPage(i + 1)}>
                    <PaginationLink isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                  </button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
                  <PaginationNext className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
      <Dialog open={selectedReview !== null} onOpenChange={() => setSelectedReview(null)}>
        {selectedReview && (
          <>
            <DialogContent aria-describedby="order-details" className="max-w-3xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Review Details for {selectedReview.id}</DialogTitle>
              </DialogHeader>

              <div className="max-h-[80vh] overflow-auto">
                <pre className="bg-muted p-4 rounded-lg">
                  <code>{JSON.stringify(selectedReview, null, 2)}</code>
                </pre>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Card>
  );
}
