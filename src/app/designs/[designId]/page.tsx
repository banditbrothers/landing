import { ProductPageContents } from "@/components/product-page";
import { designs, designsObject } from "@/data/designs";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ designId: string }> }): Promise<Metadata> {
  const designId = (await params).designId;
  const design = designsObject[designId];

  return {
    title: design.name,
    openGraph: { images: [design.image] },
    twitter: { images: [design.image] },
  };
}

export default function DesignPage({ params }: { params: Promise<{ designId: string }> }) {
  const resolvedParams = React.use(params);
  const design = designs.find(d => d.id === resolvedParams.designId);

  if (!design) notFound();

  return (
    <>
      <ProductPageContents design={design} />
    </>
  );
}
