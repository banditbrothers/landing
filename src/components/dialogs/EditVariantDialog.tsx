"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductVariant } from "@/types/product";
import { updateVariant, updateVariantMockupImage } from "@/actions/products";
import { uploadToS3, generateImageKey } from "@/utils/s3Upload";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { compressImage } from "@/utils/image";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        // description: variant.description || "",
        price: variant.price || 0,
        isAvailable: variant.isAvailable ?? true,
        isBestSeller: variant.isBestSeller ?? false,
        isDiscoverable: variant.isDiscoverable ?? true,
      });
    }
  }, [variant]);

  const handleSave = async () => {
    if (!variant) return;

    setIsLoading(true);
    try {
      // Filter out undefined values
      const updates = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          // @ts-expect-error - this is a hack to get the type to work
          acc[key] = value;
        }
        return acc;
      }, {} as Partial<ProductVariant>);

      if (updates.price === 0) delete updates.price;

      await updateVariant(variant.id, updates);

      // Create updated variant object to pass to parent
      const updatedVariant = { ...variant, ...updates };

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !variant) return;

    setIsUploadingImage(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);

      // Generate S3 key and upload
      const key = generateImageKey(variant.designId);
      const imageUrl = await uploadToS3(compressedFile, key);

      // Update variant with new image URL
      await updateVariantMockupImage(variant.id, imageUrl);

      // Create updated variant object with new image
      const updatedVariant = {
        ...variant,
        images: {
          ...variant.images,
          mockup: [imageUrl, ...variant.images.mockup],
        },
      };

      toast.success("Image uploaded successfully");
      onSave(updatedVariant);
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
          {/* Current Image */}
          <div className="space-y-2">
            <Label>Current Mockup Image</Label>
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
              <Image src={variant.images.mockup[0]} alt="Current mockup" fill className="object-cover" />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}>
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Image
                  </>
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
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

            {/* <div className="space-y-2">
              <Label htmlFor="stockLevel">Stock Level</Label>
              <Input
                id="stockLevel"
                type="number"
                value={formData.stockLevel || ""}
                onChange={e => setFormData(prev => ({ ...prev, stockLevel: parseInt(e.target.value) || 0 }))}
                placeholder="Available stock"
              />
            </div> */}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Variant description"
              rows={3}
            />
          </div> */}

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

            <div className="flex items-center justify-between">
              <Label htmlFor="isDiscoverable" className="text-sm font-medium">
                Is Discoverable
              </Label>
              <Switch
                id="isDiscoverable"
                checked={formData.isDiscoverable ?? true}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isDiscoverable: checked }))}
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
