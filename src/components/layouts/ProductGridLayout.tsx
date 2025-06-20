import { ProductVariantCard, VariantNameAndPriceBanner } from "../cards/VariantCard";
import { Button } from "../ui/button";
import { FilterDialog, FilterState } from "../dialogs/FilterDialog";
import { Suspense, useState } from "react";
import { FilterIcon, XIcon } from "lucide-react";
import { CheckBadgeIcon, HeartIconOutline } from "../../Icons/icons";
import useIsMobile from "@/hooks/useIsMobile";
import { invertColor } from "@/utils/misc";
import { handleMultipleParams, useParamBasedFeatures } from "@/hooks/useParamBasedFeature";
import { useFavorites } from "../stores/favorites";
import { LoadingIcon } from "../misc/Loading";
import { DesignCategory, DesignColor, ProductVariant } from "@/types/product";
import { DESIGN_CATEGORIES_OBJ, DESIGN_COLOR_OBJ, DESIGNS_OBJ } from "@/data/products";

interface ProductVariantGridProps {
  productVariants: ProductVariant[];
}

const isValidColor = (value: string) => DESIGN_COLOR_OBJ[value as DesignColor] !== undefined;
const isValidCategory = (value: string) => DESIGN_CATEGORIES_OBJ[value as DesignCategory] !== undefined;

const ProductGridLayoutContent = ({ productVariants }: ProductVariantGridProps) => {
  const isMobile = useIsMobile();
  const { isFavorite } = useFavorites();

  const {
    value: colorsParam,
    removeParam: removeColorParam,
    setParam: setColors,
  } = useParamBasedFeatures("colors", { replaceRoute: true });

  const {
    value: categoryParams,
    removeParam: removeCategoryParam,
    setParam: setCategories,
  } = useParamBasedFeatures("categories", { replaceRoute: true });

  const {
    value: isBestSellerFilterSelectedParam,
    removeParam: removeBestSeller,
    setParam: setBestSellers,
  } = useParamBasedFeatures("best-sellers", { replaceRoute: true });

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isFavFilterSelected, setIsFavFilterSelected] = useState(false);

  const isBestSellerFilterSelected = !!isBestSellerFilterSelectedParam;

  let selectedColors = [] as DesignColor[];
  if (colorsParam !== null) {
    if (Array.isArray(colorsParam)) selectedColors = colorsParam.filter(isValidColor) as DesignColor[];
    else selectedColors = [colorsParam as DesignColor].filter(isValidColor);
  }

  let selectedCategories = [] as DesignCategory[];
  if (categoryParams !== null) {
    if (Array.isArray(categoryParams)) selectedCategories = categoryParams.filter(isValidCategory) as DesignCategory[];
    else selectedCategories = [categoryParams as DesignCategory].filter(isValidCategory);
  }

  const handleApplyFilters = (filters: FilterState) => {
    handleMultipleParams({
      params: { colors: filters.colors, categories: filters.categories },
      config: { replaceRoute: true },
    });
  };

  const handleToggleBestSellerFilter = () => {
    if (isBestSellerFilterSelected) removeBestSeller();
    else setBestSellers("true");
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    if (type === "categories") {
      const newCategories = selectedCategories.filter(c => c !== value);
      if (newCategories.length === 0) removeCategoryParam();
      else setCategories(newCategories);
    }

    if (type === "colors") {
      const newColors = selectedColors.filter(c => c !== value);
      if (newColors.length === 0) removeColorParam();
      else setColors(newColors);
    }
  };

  const filteredDesigns = productVariants
    .filter(productVariant => {
      return productVariant.isDiscoverable !== false;
    })
    .filter(productVariant => {
      return isBestSellerFilterSelected ? productVariant.isBestSeller : true;
    })
    .filter(productVariant => {
      return isFavFilterSelected ? isFavorite(productVariant.designId) : true;
    })
    .filter(productVariant => {
      return (
        selectedCategories.length === 0 || selectedCategories.includes(DESIGNS_OBJ[productVariant.designId].category)
      );
    })
    .filter(productVariant => {
      return (
        selectedColors.length === 0 ||
        selectedColors.some(color => DESIGNS_OBJ[productVariant.designId].colors.includes(color))
      );
    })
    .filter(productVariant => {
      return productVariant.images.mockup.length > 0;
    });

  const isColorOrCategoryFilterSelected = selectedColors.length > 0 || selectedCategories.length > 0;

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <div className={`flex ${isMobile ? "flex-col" : "flex-col"} gap-2 items-start p-4`}>
          <div className="flex flex-row gap-2 items-center">
            <Button
              variant={isBestSellerFilterSelected ? "default" : "outline"}
              onClick={handleToggleBestSellerFilter}
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
            {selectedCategories.length > 0 && (
              <div className={`flex flex-wrap items-center gap-2`}>
                {selectedCategories.map(categoryId => (
                  <CategoryFilterChip key={categoryId} categoryId={categoryId} removeFilter={removeFilter} />
                ))}
              </div>
            )}

            {selectedColors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedColors.map(colorId => (
                  <ColorFilterChip key={colorId} colorId={colorId} removeFilter={removeFilter} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {filteredDesigns.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No Products Found</p>
            </div>
          )}
          {filteredDesigns.map(productVariant => (
            <div key={productVariant.id} className="w-full h-full hover:scale-105 transition-transform duration-300">
              <ProductVariantCard productVariant={productVariant} optimizeImageQualityOnMobile={false}>
                <VariantNameAndPriceBanner productVariant={productVariant} />
              </ProductVariantCard>
            </div>
          ))}
        </div>
      </div>

      <FilterDialog
        defaultFilters={{ colors: selectedColors, categories: selectedCategories }}
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

export const ProductGridLayout = ({ productVariants }: ProductVariantGridProps) => {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <ProductGridLayoutContent productVariants={productVariants} />
    </Suspense>
  );
};
