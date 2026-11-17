"use client";

import Fuse, { IFuseOptions } from "fuse.js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import VisuallyHidden from "../ui/visually-hidden";
import { SearchIcon, XMarkIcon } from "../../Icons/icons";
import { LoadingIcon } from "../misc/Loading";
import { SOLD_OUT_IMAGE, Sticker } from "../cards/ShopCard";
import { isListed } from "../layouts/ProductGridLayout";
import { ProductVariant } from "@/types/product";
import { useVariants } from "@/hooks/useVariants";
import { ACTIVE_PRODUCTS, DESIGN_CATEGORIES, DESIGN_COLOR_OBJ, DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { formatCurrency } from "@/utils/price";
import { track } from "@/utils/analytics";
import { getProductVariantUrl } from "@/utils/share";
import {
  getProductVariantName,
  getProductVariantPrice,
  isVariantOutOfStock,
  sortOutOfStockLast,
} from "@/utils/product";

const stripPunctuation = (s: string) => s.replace(/[^a-zA-Z0-9 ]/g, "");
const design = (v: ProductVariant) => DESIGNS_OBJ[v.designId];

const options: IFuseOptions<ProductVariant> = {
  threshold: 0.1,
  distance: 200, // 0.1 * 200 = 20 characters will be considered to find a match
  location: 0,
  keys: [
    // Strip punctuation so "Mr Krabby" finds "Mr. Krabby"
    { name: "name", getFn: v => stripPunctuation(getProductVariantName(v)) },
    { name: "tags", getFn: v => design(v).tags },
    // Colour names of the swatch, so "red" finds red shades
    { name: "swatch", getFn: v => design(v).swatch.map(c => DESIGN_COLOR_OBJ[c].name) },
    { name: "category", getFn: v => design(v).category },
    { name: "product", getFn: v => PRODUCTS_OBJ[v.productId].name },
  ],
};

const SUGGESTIONS = [...ACTIVE_PRODUCTS.map(p => p.name), ...DESIGN_CATEGORIES.map(c => c.name)];

const ResultRow = ({ variant, active, onHover }: { variant: ProductVariant; active: boolean; onHover: () => void }) => {
  const soldOut = isVariantOutOfStock(variant);
  const name = getProductVariantName(variant);
  return (
    <Link
      href={getProductVariantUrl(variant)}
      onMouseEnter={onHover}
      ref={el => {
        if (active) el?.scrollIntoView({ block: "nearest" });
      }}
      className={`flex items-center gap-3 rounded-xl p-2 pr-3 transition-colors ${active ? "bg-secondary" : ""}`}>
      <span className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-card">
        <Image
          fill
          src={variant.images.mockup[0]}
          alt={name}
          sizes="56px"
          className={`object-cover ${soldOut ? SOLD_OUT_IMAGE : ""}`}
        />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold truncate">{name}</span>
        <span className="block truncate text-[13px] text-muted-foreground">{PRODUCTS_OBJ[variant.productId].name}</span>
      </span>
      <span className="text-right text-sm font-semibold shrink-0">
        {soldOut ? (
          <span className="text-bandit-red uppercase text-xs tracking-wider">Sold out</span>
        ) : (
          formatCurrency(getProductVariantPrice(variant))
        )}
      </span>
      <CornerDownLeft className={`hidden md:block w-4 h-4 text-muted-foreground ${active ? "" : "invisible"}`} />
    </Link>
  );
};

function SearchDialogContent() {
  const router = useRouter();
  const { data: variants } = useVariants();
  const { value: query, setParam, removeParam } = useParamBasedFeatures<string>("q", { replaceRoute: true });
  const [text, setText] = useState(Array.isArray(query) ? query.join(",") : (query ?? ""));
  const [active, setActive] = useState(0);
  // Dialog stays mounted; forget the last term once it closes (incl. via a result link)
  if (query === null && text) setText("");

  const listed = useMemo(() => variants.filter(isListed), [variants]);
  const fuse = useMemo(() => new Fuse(listed, options), [listed]);

  const term = stripPunctuation(text).trim();
  const results = term ? sortOutOfStockLast(fuse.search(term).map(r => r.item)) : [];
  const mostWanted = listed.filter(v => v.isBestSeller && !isVariantOutOfStock(v)).slice(0, 5);
  const shown = term ? results : mostWanted;

  // Search runs on local state; the URL only keeps the term for sharing / reloads
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const trackRef = useRef<NodeJS.Timeout>(undefined);
  const search = (value: string) => {
    setText(value);
    setActive(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setParam(value), 300);
    // Only the term they settle on, not every keystroke
    if (trackRef.current) clearTimeout(trackRef.current);
    const settled = stripPunctuation(value).trim();
    if (settled.length >= 2)
      trackRef.current = setTimeout(
        () => track("products_searched", { query: settled, results: fuse.search(settled).length }),
        1500
      );
  };

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    removeParam();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shown.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => (i + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      router.push(getProductVariantUrl(shown[Math.min(active, shown.length - 1)]));
    }
  };

  const chips = (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => search(s)}
          className="px-3 h-8 rounded-full border border-border text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-bandit-orange">
          {s}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={query !== null} onOpenChange={open => !open && close()}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        className="top-0 sm:top-[10vh] translate-y-0 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4 flex flex-col h-dvh sm:h-auto max-w-full sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-none sm:rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Search products</DialogTitle>
        </VisuallyHidden>

        <div className="flex items-center gap-3 px-4 md:px-5 h-16 border-b border-border">
          <SearchIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={text}
            onChange={e => search(e.target.value)}
            placeholder="Search your mischief"
            aria-label="Search products"
            className="flex-1 min-w-0 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
          {text && (
            <button
              type="button"
              onClick={() => search("")}
              className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="grid place-items-center h-7 md:px-2 w-7 md:w-auto rounded-md md:border border-border text-xs text-muted-foreground hover:text-foreground">
            <span className="hidden md:inline">Esc</span>
            <XMarkIcon className="w-4 h-4 md:hidden" />
          </button>
        </div>

        <div className="flex-1 min-h-0 sm:max-h-[60vh] overflow-y-auto p-2 md:p-3">
          {!term && (
            <div className="px-2 pt-2 pb-4">
              <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3">Try</p>
              {chips}
            </div>
          )}

          {shown.length > 0 && (
            <>
              <p className="flex items-center gap-2 px-2 pt-2 pb-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">
                {term ? (
                  `${results.length} ${results.length === 1 ? "result" : "results"}`
                ) : (
                  <Sticker>Most wanted</Sticker>
                )}
              </p>
              <div className="flex flex-col">
                {shown.map((v, i) => (
                  <ResultRow key={v.id} variant={v} active={i === active} onHover={() => setActive(i)} />
                ))}
              </div>
            </>
          )}

          {term && !results.length && (
            <div className="px-2 py-10 text-center">
              <p className="font-calera uppercase text-3xl">No loot found</p>
              <p className="text-muted-foreground mt-2 mb-6">Nothing matches “{text}”. Try one of these:</p>
              <div className="flex justify-center">{chips}</div>
            </div>
          )}
        </div>

        <Link
          href="/shop"
          className="flex items-center justify-between px-4 md:px-5 h-12 border-t border-border text-sm text-muted-foreground hover:text-foreground">
          Browse the whole loot
          <ArrowRight className="w-4 h-4" />
        </Link>
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
