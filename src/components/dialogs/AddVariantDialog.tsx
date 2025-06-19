"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductVariant } from "@/types/product";
import { createVariant } from "@/actions/products";
import { uploadToS3, generateImageKey } from "@/utils/s3Upload";
import { getSKU } from "@/utils/product";
import { DESIGNS, PRODUCTS } from "@/data/products";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Loader2, Plus } from "lucide-react";
import { compressImage } from "@/utils/image";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        sku,
        description: formData.description || undefined,
        price: formData.price || undefined,
        isAvailable: formData.isAvailable,
        isBestSeller: formData.isBestSeller,
        images: {
          mockup: formData.mockupImages,
          detail: [],
          lifestyle: [],
          main: [],
          thumbnail: "",
        },
      };

      const createdVariant = await createVariant(sku, newVariant);

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
    onClose();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !formData.designId || !formData.productId) {
      toast.error("Please select both product and design first");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);

      // Generate S3 key and upload
      const key = generateImageKey(formData.designId, formData.productId);
      const imageUrl = await uploadToS3(compressedFile, key);

      // Add new image to form data
      setFormData(prev => ({
        ...prev,
        mockupImages: [...prev.mockupImages, imageUrl],
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      mockupImages: prev.mockupImages.filter((_, index) => index !== indexToRemove),
    }));
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
              <Label htmlFor="productId">Product *</Label>
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
              <Label htmlFor="designId">Design *</Label>
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
            <Label>Mockup Images *</Label>
            <div className="space-y-4">
              {/* Current Images */}
              {formData.mockupImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.mockupImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted border">
                        <Image src={imageUrl} alt={`Mockup ${index + 1}`} fill className="object-cover" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        onClick={() => removeImage(index)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || !formData.designId || !formData.productId}
                className="w-full border-dashed border-2 h-12 bg-muted/50 hover:bg-muted/80 transition-colors">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Mockup Image
                  </>
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional variant description"
              rows={3}
            />
          </div>

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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
