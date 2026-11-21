"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, HeartIcon, PackageCheckIcon, StarIcon } from "lucide-react";
import { ShopCard } from "@/components/cards/ShopCard";
import { useFavorites } from "../stores/favorites";
import { LoadingIcon } from "../misc/Loading";
import { LoadMoreTrigger } from "../misc/LoadMoreTrigger";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DesignColor, ProductVariant } from "@/types/product";
import { DESIGN_COLOR_OBJ, DESIGN_COLORS, DESIGNS, DESIGNS_OBJ } from "@/data/designs";
import { PRODUCTS_OBJ } from "@/data/products";
import {
  familyOf,
  getSizeLabel,
  groupByFamily,
  isListed,
  isSizeInStock,
  isVariantOutOfStock,
  sortOutOfStockLast,
} from "@/utils/product";

const SORT_OPTIONS = [
  { value: "newest-arrivals", label: "Newest" },
  { value: "oldest-arrivals", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 16;

// Only offer colours some design's swatch actually uses
const SWATCH_COLORS = DESIGN_COLORS.filter(c => DESIGNS.some(d => d.swatch.includes(c.id)));

const designName = (v: ProductVariant) => DESIGNS_OBJ[v.designId].name;
const sizesOf = (v: ProductVariant) => PRODUCTS_OBJ[v.productId]?.sizes ?? [];

const sorters: Record<SortOption, (a: ProductVariant, b: ProductVariant) => number> = {
  "newest-arrivals": (a, b) => b.createdAt - a.createdAt,
  "oldest-arrivals": (a, b) => a.createdAt - b.createdAt,
  "name-asc": (a, b) => designName(a).localeCompare(designName(b)),
  "name-desc": (a, b) => designName(b).localeCompare(designName(a)),
};

// Spreads props so it can be a PopoverTrigger (asChild)
const Pill = ({ on, ...props }: { on: boolean } & React.ComponentProps<"button">) => (
  <button
    type="button"
    aria-pressed={on}
    {...props}
    className={`shrink-0 inline-flex items-center justify-center gap-2 h-9 px-3 sm:px-4 rounded-full border text-sm whitespace-nowrap transition-colors ${
      on
        ? "bg-foreground text-background border-foreground font-semibold"
        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/60"
    }`}
  />
);

const ProductGridLayoutContent = ({ productVariants }: { productVariants: ProductVariant[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isFavorite } = useFavorites();

  const selectedColors = (searchParams.get("colors")?.split(",") ?? []).filter(
    c => c in DESIGN_COLOR_OBJ
  ) as DesignColor[];
  const bestOnly = searchParams.has("best-sellers");
  const favOnly = searchParams.has("favorites");
  const inStockOnly = searchParams.has("in-stock");
  // Only worth filtering when the grid's products come in more than one size
  const sizes = [...new Set(productVariants.flatMap(sizesOf))];
  // Filter `sizes` (not the param) so the label keeps the product's size order, not click order
  const sizeParam = searchParams.get("size")?.split(",") ?? [];
  const selectedSizes = sizes.length > 1 ? sizes.filter(s => sizeParam.includes(s)) : [];
  const sortParam = searchParams.get("sort") as SortOption | null;
  const sortBy: SortOption = sortParam && sortParam in sorters ? sortParam : "newest-arrivals";

  // Reset paging whenever the filters change
  const [paging, setPaging] = useState({ key: "", shown: PAGE_SIZE });
  const filterKey = searchParams.toString();
  const shown = paging.key === filterKey ? paging.shown : PAGE_SIZE;

  const setParams = (params: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setParam = (key: string, value: string | null) => setParams({ [key]: value });
  const toggle = (key: string, on: boolean) => setParam(key, on ? null : "true");
  const toggleColor = (c: DesignColor) =>
    setParam(
      "colors",
      (selectedColors.includes(c) ? selectedColors.filter(x => x !== c) : [...selectedColors, c]).join(",")
    );
  // Picking a size means "show me what I can buy in my size", so sold-out items go too
  const toggleSize = (size: string) =>
    selectedSizes.includes(size)
      ? setParam("size", selectedSizes.filter(x => x !== size).join(","))
      : setParams({
          size: [...selectedSizes, size].join(","),
          ...(!selectedSizes.length && { "in-stock": "true" }),
        });
  const clearAll = () => router.replace(sortParam ? `${pathname}?sort=${sortParam}` : pathname, { scroll: false });

  const filtered = productVariants
    .filter(isListed)
    .filter(v => !bestOnly || v.isBestSeller)
    .filter(v => !favOnly || isFavorite(v.id))
    .filter(v => !selectedSizes.length || selectedSizes.some(s => sizesOf(v).includes(s)))
    .filter(
      v =>
        !inStockOnly || (selectedSizes.length ? selectedSizes.some(s => isSizeInStock(v, s)) : !isVariantOutOfStock(v))
    )
    .filter(v => !selectedColors.length || selectedColors.some(c => DESIGNS_OBJ[v.designId].swatch.includes(c)))
    .sort(sorters[sortBy]);

  // One card per colour family unless the shopper is filtering by colour (then the matching shade is what they want)
  const families = groupByFamily(filtered);
  const folded = selectedColors.length
    ? filtered
    : sortOutOfStockLast(filtered).filter(
        (v, i, xs) => xs.findIndex(x => familyOf(x.designId) === familyOf(v.designId)) === i
      );
  const results = sortOutOfStockLast(folded.sort(sorters[sortBy]));

  const activeCount = selectedColors.length + +bestOnly + +favOnly + +inStockOnly + selectedSizes.length;

  return (
    <>
      {/* Sticky toolbar under the fixed navbar */}
      <div className="sticky top-[var(--nav-h)] transition-[top] duration-300 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/90 backdrop-blur-md after:absolute after:inset-x-4 md:after:inset-x-8 after:bottom-0 after:h-px after:bg-border">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden basis-full lg:basis-auto lg:flex-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sizes.length > 1 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Pill on={selectedSizes.length > 0}>
                    {selectedSizes.length === 0
                      ? "Size"
                      : selectedSizes.length > 2
                        ? `Size · ${selectedSizes.length}`
                        : `Size: ${selectedSizes.map(getSizeLabel).join(", ")}`}
                    <ChevronDownIcon className="w-4 h-4 opacity-50" />
                  </Pill>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-3">
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${Math.min(sizes.length, 4)}, minmax(0, 1fr))` }}>
                    {sizes.map(size => (
                      <Pill key={size} on={selectedSizes.includes(size)} onClick={() => toggleSize(size)}>
                        {getSizeLabel(size)}
                      </Pill>
                    ))}
                  </div>
                  {selectedSizes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setParam("size", null)}
                      className="block ml-auto mt-3 text-sm text-bandit-orange">
                      Clear
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <Pill on={bestOnly} onClick={() => toggle("best-sellers", bestOnly)}>
              <StarIcon className="w-3.5 h-3.5" /> Most wanted
            </Pill>
            <Pill on={favOnly} onClick={() => toggle("favorites", favOnly)}>
              <HeartIcon className="w-3.5 h-3.5" /> Favourites
            </Pill>
            <Pill on={inStockOnly} onClick={() => toggle("in-stock", inStockOnly)}>
              <PackageCheckIcon className="w-3.5 h-3.5" /> Hide sold out
            </Pill>
          </div>

          <span className="hidden lg:block w-px h-6 bg-border shrink-0" />

          <div className="flex gap-2.5 items-center flex-1 lg:flex-none min-w-0 overflow-x-auto overflow-y-hidden p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SWATCH_COLORS.map(({ id, name, hex }) => {
              const on = selectedColors.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  title={name}
                  aria-label={`${name}${on ? " (selected)" : ""}`}
                  aria-pressed={on}
                  onClick={() => toggleColor(id)}
                  style={{ background: hex }}
                  className={`shrink-0 w-[26px] h-[26px] rounded-full transition ${
                    on
                      ? "ring-2 ring-bandit-orange ring-offset-2 ring-offset-background"
                      : "ring-1 ring-inset ring-white/15"
                  }`}
                />
              );
            })}
          </div>

          <Select value={sortBy} onValueChange={v => setParam("sort", v === "newest-arrivals" ? null : v)}>
            <SelectTrigger
              aria-label="Sort"
              className="shrink-0 w-auto h-9 gap-2 rounded-full border-border px-4 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-5 pb-1 text-sm text-muted-foreground">
        <span>
          {results.length} design{results.length === 1 ? "" : "s"}
          {activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? "s" : ""}`}
        </span>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll} className="text-bandit-orange">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-2.5 gap-y-7 md:gap-x-5 md:gap-y-9 pt-4 pb-10">
        {results.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="font-calera uppercase text-5xl mb-2">No loot here</p>
            <p className="text-muted-foreground">Nothing matches those filters. Loosen up a little.</p>
          </div>
        ) : (
          results
            .slice(0, shown)
            .map((v, i) => (
              <ShopCard
                key={v.id}
                variant={v}
                priority={i < 4}
                family={selectedColors.length ? undefined : families.get(familyOf(v.designId))}
              />
            ))
        )}
      </div>

      {results.length > shown && (
        <LoadMoreTrigger key={shown} onReach={() => setPaging({ key: filterKey, shown: shown + PAGE_SIZE })} />
      )}
    </>
  );
};

export const ProductGridLayout = ({ productVariants }: { productVariants: ProductVariant[] }) => (
  <Suspense fallback={<LoadingIcon />}>
    <ProductGridLayoutContent productVariants={productVariants} />
  </Suspense>
);
