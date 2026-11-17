"use client";

import { getInstagramFeed } from "@/lib/instagram";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleIcon } from "lucide-react";
import { HeartIconSolid, InstagramIcon } from "@/Icons/icons";
import { Reveal, SectionHead } from "@/components/misc/Reveal";

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

const IG_URL = "https://www.instagram.com/be.a.banditbrother/";

export const InstagramFeedSection = () => {
  const [feed, setFeed] = useState<InstagramPost[]>([]);

  useEffect(() => {
    getInstagramFeed()
      .then(res => setFeed(res?.data ?? []))
      .catch(() => setFeed([]));
  }, []);

  // if (!feed.length) return null;

  return (
    <section id="instagram-feed" className="max-w-screen-2xl mx-auto px-4 md:px-8">
      <SectionHead
        kicker="Follow the gang"
        title={
          <span className="max-md:text-[0.85em]">
            @be.a.
            <wbr />
            <span className="text-bandit-orange">bandit</span>brother
          </span>
        }>
        <Link
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-sm hover:border-bandit-orange w-fit">
          <Image src={InstagramIcon} alt="" width={18} height={18} />
          Follow on Instagram
        </Link>
      </SectionHead>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {feed.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.06}>
            <Link
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[3/4] group overflow-hidden rounded-2xl bg-card">
              <Skeleton className="absolute inset-0 rounded-none" />
              <Image
                fill
                src={post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url}
                alt={post.caption ?? "Instagram post"}
                sizes="(min-width: 1024px) 16vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white font-semibold">
                <span className="flex items-center gap-1">
                  <HeartIconSolid className="w-4 h-4 text-bandit-orange" /> {post.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircleIcon className="w-4 h-4 fill-bandit-orange stroke-transparent" />
                  {post.comments_count}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
