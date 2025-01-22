import { LoadingIcon } from "@/components/misc/loadingScreen";

import { Metadata } from "next";
import { Suspense } from "react";
import { designsObject } from "@/data/designs";

export async function generateMetadata({ params }: { params: Promise<{ designId: string }> }): Promise<Metadata> {
  // read route params
  const designId = (await params).designId;

  const design = designsObject[designId];

  // fetch data
  // const product = await fetch(`https://.../${id}`).then(res => res.json());

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: design.name,
    openGraph: { images: [design.image] },
    twitter: { images: [design.image] },
  };
}

export default function DesignPage() {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <div>Design Page</div>
    </Suspense>
  );
}
