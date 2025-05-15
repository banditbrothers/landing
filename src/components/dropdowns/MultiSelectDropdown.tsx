"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartIconSolid, PlusIcon } from "../../Icons/icons";
import Image from "next/image";
import { useFavorites } from "@/components/stores/favorites";
import { ProductVariant } from "@/types/product";
import { getProductVariantName } from "@/utils/product";

export function MultiSelectDropdown(props: {
  variants: ProductVariant[];
  selectedIds: string[];
  onChange: (id: string, checked: boolean) => void;
}) {
  const { isFavorite } = useFavorites();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[50vh] overflow-y-auto">
        {props.variants.map(variant => {
          const name = getProductVariantName(variant, { includeProductName: true });

          return (
            <DropdownMenuCheckboxItem
              key={variant.id}
              checked={props.selectedIds.includes(variant.id)}
              onCheckedChange={checked => props.onChange(variant.id, checked)}>
              <div className="flex items-center gap-2">
                <Image
                  src={variant.images.mockup[0]}
                  width={40}
                  height={40}
                  quality={40}
                  alt={name + " image"}
                  className="object-cover rounded-md"
                />
                <span className="flex flex-row gap-2 items-center">
                  {isFavorite(variant.id) && <HeartIconSolid className="w-4 h-4 text-bandit-orange" />}
                  {name}
                </span>
              </div>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
