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
  const baseUrl = `https://graph.instagram.com/me/media?fields=${fields.join(",")}&access_token=${
    process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN
  }`;

  const url = `${baseUrl}&limit=${limit}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
};
