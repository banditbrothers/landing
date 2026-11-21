"use server";
// Server action so the access token stays on the server (it's only read here, never in a client bundle).
// Facebook Graph API with a System User token (expiry: never). Needs INSTAGRAM_USER_ID (the IG business account id) + INSTAGRAM_ACCESS_TOKEN.
import { GRAPH_API_URL } from "@/constants/meta";
import { SECONDS_PER_HOUR } from "@/utils/timestamp";

const fields = [
  "id",
  "caption",
  "media_url",
  "media_type",
  "timestamp",
  "permalink",
  "comments_count",
  "like_count",
  "thumbnail_url",
];

export const getInstagramFeed = async (limit = 6) => {
  const url = `${GRAPH_API_URL}/${process.env.INSTAGRAM_USER_ID}/media?fields=${fields.join(",")}&limit=${limit}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;
  const response = await fetch(url, { next: { revalidate: SECONDS_PER_HOUR } }); // one Graph API call per hour, shared by all visitors
  // Only the posts: the response's paging links contain the access token
  const { data } = await response.json();
  return { data: Array.isArray(data) ? data : [] };
};
