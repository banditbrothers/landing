"use client";

import Fuse, { IFuseOptions } from "fuse.js";
import { Suspense, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Design, DESIGNS } from "@/data/designs";
import { SearchProductCard } from "../cards/SearchProductCard";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import VisuallyHidden from "../ui/visually-hidden";
import { SearchIcon, XMarkIcon } from "../misc/icons";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LoadingIcon } from "../misc/Loading";

const options: IFuseOptions<Design> = {
  includeScore: true,
  threshold: 0.1,
  distance: 200, // 0.1 * 200 = 20 characters will be considered to find a match
  location: 0,
  keys: ["name", "tags", "colors", "category"],
};

const FuseDesigns = new Fuse(DESIGNS, options);

function SearchDialogContent() {
  const { value: query, setParam, removeParam } = useParamBasedFeatures<string>("q", { replaceRoute: true });

  const handleOpenChange = (open: boolean) => {
    if (!open) removeParam();
  };

  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setParam(e.target.value), 300);
  };

  const filteredDesigns = query === "" ? DESIGNS : FuseDesigns.search(query ?? "").map(result => result.item);

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
              {query.length > 0 && filteredDesigns.length === 0 && (
                <p className="text-muted-foreground text-center text-lg font-semibold italic ">
                  No Loot Found, Fellow Bandit!!
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredDesigns.map(design => (
                  <SearchProductCard key={design.id} design={design} />
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
