import { Design, DesignColor, DESIGN_COLOR_OBJ, DesignCategory, DESIGN_CATEGORIES_OBJ } from "@/data/designs";
import { DesignCard, DesignNameAndPriceBanner } from "../cards/DesignCard";
import { Button } from "../ui/button";
import { FilterDialog, FilterState } from "../dialogs/FilterDialog";
import { useState } from "react";
import { FilterIcon, XIcon } from "lucide-react";
import { CheckBadgeIcon, HeartIconOutline } from "../misc/icons";
import { isFavorite } from "@/utils/favorites";
import useIsMobile from "@/hooks/useIsMobile";
import { invertColor } from "@/utils/misc";

interface DesignGridProps {
  designs: Design[];
  selectedDesignId: string | null;
  handleDesignClick: (design: Design) => void;
}

export const ProductGridLayout = ({ designs, selectedDesignId, handleDesignClick }: DesignGridProps) => {
  const isMobile = useIsMobile();

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isFavFilterSelected, setIsFavFilterSelected] = useState(false);
  const [isBestSellerFilterSelected, setIsBestSellerFilterSelected] = useState(false);

  const [filters, setFilters] = useState<FilterState>({ colors: [], categories: [] });

  const handleApplyFilters = (filters: FilterState) => {
    setFilters(filters);
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value),
    }));
  };

  const filteredDesigns = designs
    .filter(design => {
      return isBestSellerFilterSelected ? design.isBestSeller : true;
    })
    .filter(design => {
      return isFavFilterSelected ? isFavorite(design.id) : true;
    })
    .filter(design => {
      return filters.categories.length === 0 || filters.categories.includes(design.category);
    })
    .filter(design => {
      return filters.colors.length === 0 || filters.colors.some(color => design.colors.includes(color));
    });

  const isColorOrCategoryFilterSelected = filters.colors.length > 0 || filters.categories.length > 0;

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <div className={`flex ${isMobile ? "flex-col" : "flex-col"} gap-2 items-start p-4`}>
          <div className="flex flex-row gap-2 items-center">
            <Button
              variant={isBestSellerFilterSelected ? "default" : "outline"}
              onClick={() => setIsBestSellerFilterSelected(f => !f)}
              className="flex flex-row gap-2 items-center">
              <CheckBadgeIcon className="w-4 h-4" />
              Best Sellers
            </Button>
            <Button
              variant={isFavFilterSelected ? "default" : "outline"}
              onClick={() => setIsFavFilterSelected(f => !f)}
              className="flex flex-row gap-2 items-center">
              <HeartIconOutline className="w-4 h-4" />
              Favorites
            </Button>
            <Button
              variant={isColorOrCategoryFilterSelected ? "default" : "outline"}
              onClick={() => setIsFilterDialogOpen(true)}
              className="flex flex-row gap-2 items-center">
              <FilterIcon className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-start overflow-x-auto max-w-full">
            {filters.categories.length > 0 && (
              <div className={`flex flex-wrap items-center gap-2`}>
                {filters.categories.map(categoryId => (
                  <CategoryFilterChip key={categoryId} categoryId={categoryId} removeFilter={removeFilter} />
                ))}
              </div>
            )}

            {filters.colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {filters.colors.map(colorId => (
                  <ColorFilterChip key={colorId} colorId={colorId} removeFilter={removeFilter} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {filteredDesigns.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No Designs Found</p>
            </div>
          )}
          {filteredDesigns.map(design => (
            <div key={design.id} className="w-full h-full hover:scale-105 transition-transform duration-300">
              <DesignCard
                design={design}
                showRingAroundSelectedCard
                optimizeImageQualityOnMobile={false}
                onClick={() => handleDesignClick(design)}
                selected={selectedDesignId === design.id}>
                <DesignNameAndPriceBanner design={design} />
              </DesignCard>
            </div>
          ))}
        </div>
      </div>

      <FilterDialog
        defaultFilters={filters}
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

interface ColorFilterChipProps {
  colorId: DesignColor;
  removeFilter: (type: keyof FilterState, value: DesignColor) => void;
}

const ColorFilterChip = ({ colorId, removeFilter }: ColorFilterChipProps) => {
  const { hex, name } = DESIGN_COLOR_OBJ[colorId];

  return (
    <div
      key={`${colorId}`}
      className="flex items-center bg-muted gap-1 pl-3 pr-1 py-1 rounded-full"
      style={{ backgroundColor: hex, color: invertColor(hex) }}>
      <span className="text-sm font-medium capitalize">{name}</span>
      <button onClick={() => removeFilter("colors", colorId)} className="rounded-full p-1">
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

interface CategoryFilterChipProps {
  categoryId: DesignCategory;
  removeFilter: (type: keyof FilterState, value: DesignCategory) => void;
}

const CategoryFilterChip = ({ categoryId, removeFilter }: CategoryFilterChipProps) => {
  const { name } = DESIGN_CATEGORIES_OBJ[categoryId];

  return (
    <div key={`${categoryId}`} className="flex items-center bg-muted gap-1 pl-3 pr-1 py-1 rounded-full">
      <span className="text-sm font-medium capitalize">{name}</span>
      <button onClick={() => removeFilter("categories", categoryId)} className="rounded-full p-1">
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};
