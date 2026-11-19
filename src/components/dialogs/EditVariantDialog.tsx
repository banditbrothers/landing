"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductVariant } from "@/types/product";
import { updateVariant } from "@/actions/products";
import { toast } from "sonner";
import { LoadingIcon } from "@/components/misc/Loading";
import { MockupImageGrid, MockupUploadButton } from "./MockupImageGrid";
import { PRODUCTS_OBJ } from "@/data/products";
import { parseStockInputs, StockInputs, StockInputValues, toStockInputs } from "./StockInputs";

interface EditVariantDialogProps {
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVariant: ProductVariant) => void;
}

export const EditVariantDialog = ({ variant, isOpen, onClose, onSave }: EditVariantDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProductVariant>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [stockInputs, setStockInputs] = useState<StockInputValues>({});
  const [mockupImages, setMockupImages] = useState<string[]>([]);

  // Initialize form data when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        description: variant.description || "",
        price: variant.price || 0,
        isAvailable: variant.isAvailable ?? true,
        isBestSeller: variant.isBestSeller ?? false,
      });
      setStockInputs(toStockInputs(variant.stock));
      setMockupImages(variant.images.mockup ?? []);
    }
  }, [variant, isOpen]);

  const handleSave = async () => {
    if (!variant) return;
    if (mockupImages.length === 0) {
      toast.error("Keep at least one mockup image");
      return;
    }

    setIsLoading(true);
    try {
      // Write only the sizes edited here: rewriting the whole map would undo stock that orders
      // deducted while this dialog was open. A size left empty becomes untracked (null deletes it).
      const newStock = parseStockInputs(stockInputs, PRODUCTS_OBJ[variant.productId]?.sizes ?? []);
      const stock = { ...variant.stock };
      const stockChanges: Record<`stock.${string}`, number | null> = {};
      for (const size of PRODUCTS_OBJ[variant.productId]?.sizes ?? []) {
        const qty = newStock[size] ?? null;
        if (qty === (variant.stock?.[size] ?? null)) continue;
        stockChanges[`stock.${size}`] = qty;
        if (qty === null) delete stock[size];
        else stock[size] = qty;
      }
      const imagesChanged = mockupImages.join() !== (variant.images.mockup ?? []).join();

      const isAvailable = formData.isAvailable ?? true;
      const isBestSeller = formData.isBestSeller ?? false;
      // Empty/0 clears the override so the product's base price applies
      const price = formData.price || null;
      // Empty clears it so the product's description applies
      const description = formData.description?.trim() || null;
      await updateVariant(variant.id, {
        isAvailable,
        isBestSeller,
        price,
        description,
        ...stockChanges,
        ...(imagesChanged && { "images.mockup": mockupImages }),
      });

      const updatedVariant: ProductVariant = {
        ...variant,
        isAvailable,
        isBestSeller,
        stock,
        images: { ...variant.images, mockup: mockupImages },
        price: price ?? undefined,
        description: description ?? undefined,
      };

      toast.success("Variant updated successfully");
      onSave(updatedVariant);
      onClose();
    } catch (error) {
      toast.error("Failed to update variant");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Variant: {variant.designId} - {variant.productId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mockup Images */}
          <div className="space-y-2">
            <Label>Mockup Images</Label>
            <p className="text-sm text-muted-foreground">
              Drag or use the arrows to reorder. The first image is the cover.
            </p>
            <MockupImageGrid images={mockupImages} onChange={setMockupImages} />
            <MockupUploadButton
              productId={variant.productId}
              designId={variant.designId}
              onUploaded={url => setMockupImages(prev => [...prev, url])}
              onUploadingChange={setIsUploadingImage}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Custom variant name"
              />
            </div> */}

            {/* <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ""}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Stock keeping unit"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Custom price"
              />
            </div>
          </div>

          <StockInputs
            sizes={PRODUCTS_OBJ[variant.productId]?.sizes ?? []}
            value={stockInputs}
            onChange={setStockInputs}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description (shown on the product page and in Google)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="1–3 sentences unique to this design. Leave empty to show only the product's description."
              rows={3}
            />
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isAvailable" className="text-sm font-medium">
                Is Available
              </Label>
              <Switch
                id="isAvailable"
                checked={formData.isAvailable ?? true}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isAvailable: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isBestSeller" className="text-sm font-medium">
                Is Best Seller
              </Label>
              <Switch
                id="isBestSeller"
                checked={formData.isBestSeller ?? false}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isBestSeller: checked }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isLoading || isUploadingImage}>
              {isLoading ? (
                <>
                  <LoadingIcon className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
