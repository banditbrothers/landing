"use client";

import { getInstagramFeed } from "@/lib/instagram";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleIcon } from "lucide-react";
import { HeartIconSolid, InstagramIcon } from "@/Icons/icons";
type InstagramPost = {
  id: string;
  caption: string;
  media_url: string;
  media_type: string;
  timestamp: string;
  permalink: string;
  comments_count: number;
  like_count: number;
  thumbnail_url: string;
};

export const InstagramFeedSection = () => {
  const [feed, setFeed] = useState<InstagramPost[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      const feed = await getInstagramFeed();
      setFeed(feed.data);
    };
    fetchFeed();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto container">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-bold text-primary">Follow Our Journey</h2>
        <Link href="https://www.instagram.com/be.a.banditbrother/" target="_blank" rel="noopener noreferrer">
          <span className="flex items-center gap-2 mt-2">
            <Image src={InstagramIcon} alt="Instagram" width={20} height={20} />
            <p className="text-bandit-orange">be.a.banditbrother</p>
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-[2px] max-w-5xl mx-auto px-4">
        {feed.map((post: InstagramPost) => (
          <Link
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[3/4] group overflow-hidden bg-primary">
            <Image
              fill
              src={post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url}
              alt={post.caption ?? "Instagram post"}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-4 text-black font-semibold">
                  <span className="flex items-center gap-1">
                    <HeartIconSolid className="w-4 h-4 text-bandit-orange" /> {post.like_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircleIcon className="w-4 h-4 fill-bandit-orange stroke-transparent" />
                    {post.comments_count}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
