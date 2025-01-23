import { ProductPageContents } from "@/components/pages/designs";
import { DESIGNS, DESIGNS_OBJ } from "@/data/designs";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ designId: string }> }): Promise<Metadata> {
  const designId = (await params).designId;
  const design = DESIGNS_OBJ[designId];

  return {
    title: design.name + " | " + "by Bandit Brothers",
    openGraph: { images: [design.image] },
    twitter: { images: [design.image] },
  };
}

export default function DesignPage({ params }: { params: Promise<{ designId: string }> }) {
  const resolvedParams = React.use(params);
  const design = DESIGNS.find(d => d.id === resolvedParams.designId);

  if (!design) notFound();

  return (
    <>
      <ProductPageContents design={design} />
    </>
  );
}
