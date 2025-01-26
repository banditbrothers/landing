import { ProductPageContents } from "@/components/pages/designs";
import { DESIGNS_OBJ } from "@/data/designs";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ designId: string }> }): Promise<Metadata> {
  const designId = (await params).designId;
  const design = DESIGNS_OBJ[designId];

  if (design) {
    return {
      title: design.name + " | " + "by Bandit Brothers",
      openGraph: { images: [design.image] },
      twitter: { images: [design.image] },
    };
  }
  return {};
}

export default function DesignPage({ params }: { params: Promise<{ designId: string }> }) {
  const resolvedParams = React.use(params);

  return (
    <>
      <ProductPageContents designId={resolvedParams.designId} />
    </>
  );
}
