"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const move = (arr: string[], from: number, to: number) => {
  const next = [...arr];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

// Drag a thumbnail onto another to reorder (native DnD; admin is desktop only). First image = cover.
export const MockupImageGrid = ({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((url, index) => (
        <div
          key={url}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => setDragIndex(null)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (dragIndex !== null && dragIndex !== index) onChange(move(images, dragIndex, index));
            setDragIndex(null);
          }}
          className={`relative group cursor-grab active:cursor-grabbing ${dragIndex === index ? "opacity-40" : ""}`}>
          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted border">
            <Image src={url} alt={`Mockup ${index + 1}`} fill className="object-cover pointer-events-none" />
          </div>
          {index === 0 && (
            <span className="absolute top-2 left-2 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              Cover
            </span>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            onClick={() => onChange(images.filter((_, i) => i !== index))}
            aria-label="Remove image">
            ×
          </Button>
          <div className="absolute bottom-2 inset-x-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={index === 0}
              onClick={() => onChange(move(images, index, index - 1))}
              aria-label="Move left">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={index === images.length - 1}
              onClick={() => onChange(move(images, index, index + 1))}
              aria-label="Move right">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
