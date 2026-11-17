"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HeartIcon, PackageCheckIcon, StarIcon } from "lucide-react";
import { ShopCard, Sticker, Swatch } from "../cards/ShopCard";
import { useFavorites } from "../stores/favorites";
import { LoadingIcon } from "../misc/Loading";
import { LoadMoreTrigger } from "../misc/LoadMoreTrigger";
import { FitTitle } from "../typography/FitTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DesignColor, ProductVariant } from "@/types/product";
import { DESIGN_COLOR_OBJ, DESIGN_COLORS, DESIGNS, DESIGNS_OBJ } from "@/data/products";
import { getProductVariantName, isVariantOutOfStock, sortOutOfStockLast } from "@/utils/product";
import { getProductVariantUrl } from "@/utils/share";

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

// Colour variants of one design share a `family` key
export const familyOf = (designId: string) => DESIGNS_OBJ[designId]?.family ?? designId;

export const isListed = (v: ProductVariant) => v.isAvailable !== false && v.images.mockup.length > 0;

/** Colour-family key -> its variants, in input order */
export const groupByFamily = (variants: ProductVariant[]) => {
  const map = new Map<string, ProductVariant[]>();
  variants.forEach(v => map.set(familyOf(v.designId), [...(map.get(familyOf(v.designId)) ?? []), v]));
  return map;
};

const designName = (v: ProductVariant) => DESIGNS_OBJ[v.designId].name;

const sorters: Record<SortOption, (a: ProductVariant, b: ProductVariant) => number> = {
  "newest-arrivals": (a, b) => b.createdAt - a.createdAt,
  "oldest-arrivals": (a, b) => a.createdAt - b.createdAt,
  "name-asc": (a, b) => designName(a).localeCompare(designName(b)),
  "name-desc": (a, b) => designName(b).localeCompare(designName(a)),
};

const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={`shrink-0 inline-flex items-center gap-2 h-9 px-3 sm:px-4 rounded-full [&>svg]:hidden sm:[&>svg]:block border text-sm whitespace-nowrap transition-colors ${
      on
        ? "bg-foreground text-background border-foreground font-semibold"
        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/60"
    }`}>
    {children}
  </button>
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
  const sortParam = searchParams.get("sort") as SortOption | null;
  const sortBy: SortOption = sortParam && sortParam in sorters ? sortParam : "newest-arrivals";

  // Reset paging whenever the filters change
  const [paging, setPaging] = useState({ key: "", shown: PAGE_SIZE });
  const filterKey = searchParams.toString();
  const shown = paging.key === filterKey ? paging.shown : PAGE_SIZE;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (key: string, on: boolean) => setParam(key, on ? null : "true");
  const toggleColor = (c: DesignColor) =>
    setParam(
      "colors",
      (selectedColors.includes(c) ? selectedColors.filter(x => x !== c) : [...selectedColors, c]).join(",")
    );
  const clearAll = () => router.replace(sortParam ? `${pathname}?sort=${sortParam}` : pathname, { scroll: false });

  const filtered = productVariants
    .filter(isListed)
    .filter(v => !bestOnly || v.isBestSeller)
    .filter(v => !favOnly || isFavorite(v.id))
    .filter(v => !inStockOnly || !isVariantOutOfStock(v))
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

  const activeCount = selectedColors.length + +bestOnly + +favOnly + +inStockOnly;

  // Editorial tile for the biggest colour family, only on the unfiltered first page.
  // "Hide sold out" doesn't count: families come from `filtered`, so the tile just drops the sold-out shades.
  const biggest = [...families.values()].sort((a, b) => b.length - a.length)[0] ?? [];
  const familyMembers = biggest.length >= 4 ? biggest : [];
  const showEditorial = activeCount === +inStockOnly && familyMembers.length > 0 && results.length > 6;

  const cards = results
    .slice(0, shown)
    .map((v, i) => (
      <ShopCard
        key={v.id}
        variant={v}
        priority={i < 4}
        family={selectedColors.length ? undefined : families.get(familyOf(v.designId))}
      />
    ));
  if (showEditorial) cards.splice(6, 0, <FamilyEditorial key="editorial" members={familyMembers} />);

  return (
    <>
      {/* Sticky toolbar under the fixed navbar */}
      <div className="sticky top-[var(--nav-h)] transition-[top] duration-300 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5">
          <div className="flex gap-2 overflow-x-auto basis-full md:basis-auto md:flex-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

          <span className="hidden md:block w-px h-6 bg-border shrink-0" />

          <div className="flex gap-2.5 items-center flex-1 md:flex-none min-w-0 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          cards
        )}
      </div>

      {results.length > shown && (
        <LoadMoreTrigger key={shown} onReach={() => setPaging({ key: filterKey, shown: shown + PAGE_SIZE })} />
      )}
    </>
  );
};

const FamilyEditorial = ({ members }: { members: ProductVariant[] }) => {
  const title = getProductVariantName(members[0]).split(" - ")[0];
  // Same rule as ShopCard: swatches/colour copy only when each member looks different
  const distinctColours = new Set(members.map(v => DESIGNS_OBJ[v.designId].swatch.join())).size === members.length;
  return (
    <Link
      href={getProductVariantUrl(members[0])}
      className="col-span-2 grid md:grid-cols-2 rounded-2xl overflow-hidden bg-card min-h-[340px] group">
      <div className="p-5 md:p-7 flex flex-col justify-between gap-4 order-2 md:order-1">
        <div>
          <Sticker>
            {members.length} {distinctColours ? "colourways" : "options"}
          </Sticker>
        </div>
        <div>
          <FitTitle as="h3" text={title} max="4rem" className="font-calera uppercase leading-[0.9]" />
          <p className="text-sm text-muted-foreground mt-2.5">
            {distinctColours
              ? `One design, ${members.length} shades. Pick the one that matches your ride.`
              : `One series, ${members.length} designs. Pick the one that's yours.`}
          </p>
        </div>
        {distinctColours ? (
          <div className="flex gap-1.5 flex-wrap">
            {members.map(v => (
              <Swatch key={v.id} colors={DESIGNS_OBJ[v.designId].swatch} className="w-[22px] h-[22px] rounded-md" />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{members.length} options</span>
        )}
      </div>
      <div className="grid grid-cols-2 grid-rows-2 order-1 md:order-2">
        {members.slice(0, 4).map(v => (
          <div key={v.id} className="relative aspect-square md:aspect-auto overflow-hidden">
            <Skeleton className="absolute inset-0 rounded-none" />
            <Image
              fill
              src={v.images.mockup[0]}
              alt=""
              sizes="(min-width: 768px) 15vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </Link>
  );
};

export const ProductGridLayout = ({ productVariants }: { productVariants: ProductVariant[] }) => (
  <Suspense fallback={<LoadingIcon />}>
    <ProductGridLayoutContent productVariants={productVariants} />
  </Suspense>
);
