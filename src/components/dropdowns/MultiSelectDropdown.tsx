"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Design } from "@/data/designs";
import { HeartIconSolid, PlusIcon } from "../misc/icons";
import Image from "next/image";
import { useFavorites } from "@/contexts/FavoritesContext";

export function MultiSelectDropdown(props: {
  designs: Design[];
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
        {props.designs.map(design => (
          <DropdownMenuCheckboxItem
            key={design.name}
            checked={props.selectedIds.includes(design.id)}
            onCheckedChange={checked => props.onChange(design.id, checked)}>
            <div className="flex items-center gap-2">
              <Image src={design.image} width={40} height={40} alt={design.name} className="object-cover rounded-md" />
              <span className="flex flex-row gap-2 items-center">
                {isFavorite(design.id) && <HeartIconSolid className="w-4 h-4 text-bandit-orange" />}
                {design.name}
              </span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
