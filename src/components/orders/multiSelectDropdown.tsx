"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Design } from "@/data/products";
import { PlusIcon } from "../icons";
import Image from "next/image";

export function DropdownMenuCheckboxes(props: {
  designs: Design[];
  selectedIds: string[];
  onChange: (id: string, checked: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {props.designs.map(design => (
          <DropdownMenuCheckboxItem
            key={design.name}
            checked={props.selectedIds.includes(design.id)}
            onCheckedChange={checked => props.onChange(design.id, checked)}>
            <div className="flex items-center gap-2">
              <Image src={design.image} width={40} height={40} alt={design.name} className="object-cover rounded-md" />
              <span>{design.name}</span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
