import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

import { ReviewStatus } from "@/types/review";

import { getReviewsAdmin, updateReview } from "@/actions/reviews";
import { Review } from "@/types/review";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/misc/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon, EyeIcon, XMarkIcon } from "@/Icons/icons";
import { formattedDateTimeLong } from "@/utils/timestamp";
import { useAdminLoad, usePaged, AdminPagination } from "./adminHooks";

const REVIEW_STATUS_STYLE: Record<ReviewStatus, string> = {
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export function ReviewManagement() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const isLoading = useAdminLoad(getReviewsAdmin, setReviews, "reviews");
  const {
    page: currentPage,
    setPage: setCurrentPage,
    pages: totalPages,
    pageItems: currentPageReviews,
  } = usePaged(reviews);

  const handleStatusChange = async (reviewId: string, status: ReviewStatus) => {
    try {
      await updateReview(reviewId, { status });
      setReviews(prev => prev.map(review => (review.id === reviewId ? { ...review, status } : review)));
      toast.success(`Review ${status} successfully`);
    } catch (e) {
      toast.error("Failed to update review status", { description: (e as Error).message });
    }
  };

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
                  <TableCell>{formattedDateTimeLong(review.createdAt)}</TableCell>
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
                    <span className={`px-2 py-1 rounded-full text-xs ${REVIEW_STATUS_STYLE[review.status]}`}>
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
          <AdminPagination page={currentPage} pages={totalPages} onChange={setCurrentPage} />
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
