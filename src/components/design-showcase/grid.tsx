import { Design, DesignColors, designColorsObject, DesignPattern, designPatternsObject } from "@/data/designs";
import { DesignCard, DesignNameAndPriceBanner } from "./card";
import { Button } from "../ui/button";
import { FilterDialog, FilterState } from "./filterDialog";
import { useState } from "react";
import { FilterIcon, XIcon } from "lucide-react";
import { HeartIconOutline, SparklesIcon } from "../misc/icons";
import { isFavorite } from "@/utils/favorites";

interface DesignGridProps {
  designs: Design[];
  selectedDesignId: string | null;
  handleDesignClick: (design: Design) => void;
}

export const DesignGrid = ({ designs, selectedDesignId, handleDesignClick }: DesignGridProps) => {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isFavFilterSelected, setIsFavFilterSelected] = useState(false);
  const [isNewlyAddedFilterSelected, setIsNewlyAddedFilterSelected] = useState(false);

  const [filters, setFilters] = useState<FilterState>({ colors: [], patterns: [] });

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
      return isNewlyAddedFilterSelected ? design.isNewlyAdded : true;
    })
    .filter(design => {
      return isFavFilterSelected ? isFavorite(design.id) : true;
    })
    .filter(design => {
      return filters.patterns.length === 0 || filters.patterns.includes(design.pattern);
    })
    .filter(design => {
      return filters.colors.length === 0 || filters.colors.some(color => design.colors.includes(color));
    });

  const isColorPatternFilterSelected = filters.colors.length > 0 || filters.patterns.length > 0;

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-row gap-2 items-center p-4">
          <Button
            variant={isNewlyAddedFilterSelected ? "default" : "outline"}
            onClick={() => setIsNewlyAddedFilterSelected(f => !f)}
            className="flex flex-row gap-2 items-center">
            <SparklesIcon className="w-4 h-4" />
            Newly Added
          </Button>
          <Button
            variant={isFavFilterSelected ? "default" : "outline"}
            onClick={() => setIsFavFilterSelected(f => !f)}
            className="flex flex-row gap-2 items-center">
            <HeartIconOutline className="w-4 h-4" />
            Favorites
          </Button>
          <Button
            variant={isColorPatternFilterSelected ? "default" : "outline"}
            onClick={() => setIsFilterDialogOpen(true)}
            className="flex flex-row gap-2 items-center">
            <FilterIcon className="w-4 h-4" />
            Filter
          </Button>

          <div className="flex flex-wrap gap-2 items-center overflow-x-auto">
            {filters.patterns.length > 0 && (
              <div
                className={`flex items-center gap-2 ${
                  filters.colors.length > 0 ? "border-r pr-2 border-muted-foreground" : ""
                }`}>
                {filters.patterns.map(patternId => (
                  <PatternFilterChip key={patternId} patternId={patternId} removeFilter={removeFilter} />
                ))}
              </div>
            )}

            {filters.colors.length > 0 && (
              <div className="flex items-center gap-2">
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
  colorId: DesignColors;
  removeFilter: (type: keyof FilterState, value: DesignColors) => void;
}

const ColorFilterChip = ({ colorId, removeFilter }: ColorFilterChipProps) => {
  const { hex, name } = designColorsObject[colorId];

  return (
    <div
      key={`${colorId}`}
      className="flex items-center bg-muted gap-1 pl-3 pr-1 py-1 rounded-full"
      style={{ border: `1px solid ${hex}` }}>
      <span className="text-sm capitalize">{name}</span>
      <button onClick={() => removeFilter("colors", colorId)} className="hover:text-destructive rounded-full p-1">
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

interface PatternFilterChipProps {
  patternId: DesignPattern;
  removeFilter: (type: keyof FilterState, value: DesignPattern) => void;
}

const PatternFilterChip = ({ patternId, removeFilter }: PatternFilterChipProps) => {
  const { name } = designPatternsObject[patternId];

  return (
    <div key={`${patternId}`} className="flex items-center bg-muted gap-1 pl-3 pr-1 py-1 rounded-full">
      <span className="text-sm capitalize">{name}</span>
      <button onClick={() => removeFilter("patterns", patternId)} className="hover:text-destructive rounded-full p-1">
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};
