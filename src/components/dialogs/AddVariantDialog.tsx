"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductVariant } from "@/types/product";
import { createVariant } from "@/actions/products";
import { getSKU } from "@/utils/product";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { DESIGNS } from "@/data/designs";
import { parseStockInputs, StockInputs, StockInputValues } from "./StockInputs";
import { toast } from "sonner";
import { MockupImageGrid, MockupUploadButton } from "./MockupImageGrid";
import { Plus } from "lucide-react";
import { LoadingIcon } from "@/components/misc/Loading";
import { getTimestamp } from "@/utils/timestamp";

interface AddVariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newVariant: ProductVariant) => void;
  existingVariants: ProductVariant[];
}

interface FormData {
  productId: string;
  designId: string;
  name?: string;
  description?: string;
  price?: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  mockupImages: string[];
}

export const AddVariantDialog = ({ isOpen, onClose, onSave, existingVariants }: AddVariantDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    productId: "",
    designId: "",
    name: "",
    description: "",
    price: undefined,
    isAvailable: true,
    isBestSeller: false,
    mockupImages: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [stockInputs, setStockInputs] = useState<StockInputValues>({});

  const checkVariantExists = (productId: string, designId: string): boolean => {
    return existingVariants.some(variant => variant.productId === productId && variant.designId === designId);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.designId) {
      toast.error("Please select both product and design");
      return;
    }

    if (checkVariantExists(formData.productId, formData.designId)) {
      toast.error("A variant with this product and design combination already exists");
      return;
    }

    if (formData.mockupImages.length === 0) {
      toast.error("Please upload at least one mockup image");
      return;
    }

    setIsLoading(true);
    try {
      const sku = getSKU(formData.productId, formData.designId);

      const newVariant: Omit<ProductVariant, "id"> = {
        productId: formData.productId,
        designId: formData.designId,
        createdAt: getTimestamp(),
        sku,
        // description: formData.description || undefined,
        price: formData.price || undefined,
        isAvailable: formData.isAvailable,
        isBestSeller: formData.isBestSeller,
        stock: parseStockInputs(stockInputs, PRODUCTS_OBJ[formData.productId]?.sizes ?? []),
        images: {
          mockup: formData.mockupImages,
          detail: [],
          lifestyle: [],
          main: [],
          thumbnail: "",
        },
      };

      const createdVariant = await createVariant(sku, newVariant);
      if ("error" in createdVariant) {
        toast.error(createdVariant.error);
        return;
      }

      toast.success("Variant created successfully!");
      onSave(createdVariant);
      handleClose();
    } catch (error) {
      toast.error("Failed to create variant");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: "",
      designId: "",
      name: "",
      description: "",
      price: undefined,
      isAvailable: true,
      isBestSeller: false,
      mockupImages: [],
    });
    setStockInputs({});
    onClose();
  };

  const currentVariantExists =
    formData.productId && formData.designId ? checkVariantExists(formData.productId, formData.designId) : false;

  const generatedSKU = formData.productId && formData.designId ? getSKU(formData.productId, formData.designId) : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Plus className="w-5 h-5 text-primary" />
            Add New Variant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product and Design Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId" className="flex items-center gap-1">
                Product
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.productId}
                onValueChange={value => setFormData(prev => ({ ...prev, productId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designId" className="flex items-center gap-1">
                Design
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.designId}
                onValueChange={value => setFormData(prev => ({ ...prev, designId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a design" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNS.map(design => (
                    <SelectItem key={design.id} value={design.id}>
                      {design.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SKU Display and Validation */}
          {generatedSKU && (
            <div className="space-y-2">
              <Label>Generated SKU</Label>
              <div
                className={`p-3 rounded-lg border ${
                  currentVariantExists
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800"
                }`}>
                <div className="font-mono text-sm font-medium">{generatedSKU}</div>
                {currentVariantExists && (
                  <div className="text-destructive text-sm mt-1 font-medium">
                    ⚠️ A variant with this combination already exists
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Mockup Images
              <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-4">
              <MockupImageGrid
                images={formData.mockupImages}
                onChange={mockupImages => setFormData(prev => ({ ...prev, mockupImages }))}
              />

              <MockupUploadButton
                productId={formData.productId}
                designId={formData.designId}
                onUploaded={url => setFormData(prev => ({ ...prev, mockupImages: [...prev.mockupImages, url] }))}
                onUploadingChange={setIsUploadingImage}
                className="w-full border-dashed border-2 h-12 bg-muted/50 hover:bg-muted/80 transition-colors"
              />
              {(!formData.designId || !formData.productId) && (
                <p className="text-sm text-muted-foreground/80">
                  Select both product and design first to upload images
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Custom Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Leave empty to use design name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Custom Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                placeholder="Leave empty to use base price"
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional variant description"
              rows={3}
            />
          </div> */}

          {formData.productId && (
            <StockInputs
              sizes={PRODUCTS_OBJ[formData.productId]?.sizes ?? []}
              value={stockInputs}
              onChange={setStockInputs}
            />
          )}

          {/* Switches */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label htmlFor="isAvailable" className="text-sm font-medium text-foreground">
                Is Available
              </Label>
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isAvailable: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isBestSeller" className="text-sm font-medium text-foreground">
                Is Best Seller
              </Label>
              <Switch
                id="isBestSeller"
                checked={formData.isBestSeller}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isBestSeller: checked }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} className="min-w-[80px]">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                isLoading ||
                isUploadingImage ||
                currentVariantExists ||
                !formData.productId ||
                !formData.designId ||
                formData.mockupImages.length === 0
              }
              className="min-w-[120px]">
              {isLoading ? (
                <>
                  <LoadingIcon className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Variant"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
