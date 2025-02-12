import { getReviews } from "@/actions/reviews";

export const revalidate = 7200; // 2 * 60 * 60 = 2 hours

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const lastReviewCreatedAtParam = url.searchParams.get("lastReviewCreatedAt");

  const lastReviewCreatedAt = lastReviewCreatedAtParam ? Number(lastReviewCreatedAtParam) : undefined;

  try {
    const reviews = await getReviews(limit, lastReviewCreatedAt);
    return new Response(JSON.stringify(reviews), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`API error: ${error.message}`, {
      status: 400,
    });
  }
}
