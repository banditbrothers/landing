"use client";

import Fuse, { IFuseOptions } from "fuse.js";
import { Suspense, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchProductCard } from "../cards/SearchProductCard";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import VisuallyHidden from "../ui/visually-hidden";
import { SearchIcon, XMarkIcon } from "../../Icons/icons";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LoadingIcon } from "../misc/Loading";
import { Design, Product, ProductVariant } from "@/types/product";
import { useVariants } from "@/hooks/useVariants";
import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";

const options: IFuseOptions<ProductVariant> = {
  includeScore: true,
  threshold: 0.1,
  distance: 200, // 0.1 * 200 = 20 characters will be considered to find a match
  location: 0,
  keys: ["name", "tags", "colors", "category", "productId"],
};

type SearchVariant = ProductVariant & { product: Omit<Product, "id">; design: Omit<Design, "id"> };

function SearchDialogContent() {
  const { data: variants } = useVariants();

  const { value: query, setParam, removeParam } = useParamBasedFeatures<string>("q", { replaceRoute: true });
  const [formattedVariants, setFormattedVariants] = useState<SearchVariant[]>([] as SearchVariant[]);

  useEffect(() => {
    const _formatted = variants.map(v => {
      const product = PRODUCTS_OBJ[v.productId];
      const design = DESIGNS_OBJ[v.designId];

      return { ...v, product, design };
    });
    setFormattedVariants(_formatted);

    return () => {};
  }, [variants]);

  const handleOpenChange = (open: boolean) => {
    if (!open) removeParam();
  };

  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setParam(e.target.value), 300);
  };

  const FuseVariants = new Fuse(formattedVariants, options);
  const filteredVariants =
    query === "" ? formattedVariants : FuseVariants.search(query ?? "").map(result => result.item);

  return (
    <Dialog open={query !== null} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-full sm:max-w-2xl px-4 py-2">
        <DialogHeader className="p-0 m-0">
          <VisuallyHidden>
            <DialogTitle>Search Products</DialogTitle>
          </VisuallyHidden>
          <div className="">
            <span className="flex items-center justify-between gap-2">
              <span className="flex flex-1 items-center justify-start gap-2">
                <SearchIcon className="w-4 h-4" />
                <Input
                  placeholder="Search Your Mischief"
                  onChange={handleInputChange}
                  className="w-full border-none p-0 focus-visible:ring-0"
                />
              </span>
              <Button variant="ghost" size="icon" onClick={removeParam}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </span>
            <Separator className="my-2" />
          </div>
        </DialogHeader>

        <div className="space-y-4 mb-3">
          {query !== null && (
            <div className="max-h-[50vh] overflow-y-auto">
              {query.length > 0 && filteredVariants.length === 0 && (
                <p className="text-muted-foreground text-center text-lg font-semibold italic ">
                  No Loot Found, Fellow Bandit!!
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredVariants.map(variant => (
                  <SearchProductCard key={variant.id} variant={variant} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchDialog() {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <SearchDialogContent />
    </Suspense>
  );
}
