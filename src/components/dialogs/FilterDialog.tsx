import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ColorBadge } from "../badges/DesignBadges";
import { DesignCategory, DesignColor } from "@/types/product";
import { DESIGN_CATEGORIES, DESIGN_CATEGORIES_OBJ, DESIGN_COLORS } from "@/data/products";

export interface FilterState {
  colors: DesignColor[];
  categories: DesignCategory[];
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
  defaultFilters: FilterState;
}

const COLORS = DESIGN_COLORS.map(color => color.id);
const CATEGORIES = DESIGN_CATEGORIES.map(category => category.id);

export const FilterDialog = ({ open, onOpenChange, onApplyFilters, defaultFilters }: FilterDialogProps) => {
  const [selectedColors, setSelectedColors] = useState<DesignColor[]>(defaultFilters.colors);
  const [selectedCategories, setSelectedCategories] = useState<DesignCategory[]>(defaultFilters.categories);

  useEffect(() => {
    setSelectedColors(defaultFilters.colors);
    setSelectedCategories(defaultFilters.categories);
  }, [defaultFilters]);

  const handleToggleColor = (colorId: DesignColor) => {
    setSelectedColors(prev => (prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]));
  };

  const handleToggleCategory = (categoryId: DesignCategory) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleApply = () => {
    onApplyFilters({ colors: selectedColors, categories: selectedCategories });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedColors([]);
    setSelectedCategories([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Designs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Categories</h4>
            {selectedCategories.length > 0 && <Badge variant="secondary">{selectedCategories.length} selected</Badge>}
          </div>
          <ScrollArea className="max-h-32">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button key={category} onClick={() => handleToggleCategory(category)}>
                  <Badge variant={selectedCategories.includes(category) ? "default" : "outline"}>
                    {DESIGN_CATEGORIES_OBJ[category].name}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Colors</h4>
              {selectedColors.length > 0 && <Badge variant="secondary">{selectedColors.length} selected</Badge>}
            </div>
            <ScrollArea className="max-h-32">
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button key={color} onClick={() => handleToggleColor(color)}>
                    <ColorBadge color={color} variant={selectedColors.includes(color) ? "default" : "outline"} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!selectedColors.length && !selectedCategories.length}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
