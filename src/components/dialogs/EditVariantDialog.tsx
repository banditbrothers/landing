"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProductVariant } from "@/types/product";
import { updateVariant, updateVariantMockupImage, deleteVariantMockupImage } from "@/actions/products";
import { uploadToS3, generateImageKey } from "@/utils/s3Upload";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Loader2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { processImage } from "@/utils/image";

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
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
  const [mockupImages, setMockupImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data and images when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        // description: variant.description || "",
        price: variant.price || 0,
        isAvailable: variant.isAvailable ?? true,
        isBestSeller: variant.isBestSeller ?? false,
        isDiscoverable: variant.isDiscoverable ?? true,
      });
      setMockupImages(variant.images.mockup || []);
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
      // Check if the image is a webp and if not, convert it to webp, then compress
      const processedFile = await processImage(file);

      // Generate S3 key and upload
      const key = generateImageKey(variant.designId, variant.productId);
      const imageUrl = await uploadToS3(processedFile, key);

      // Update variant with new image URL
      await updateVariantMockupImage(variant.id, imageUrl);

      // Update local state immediately
      const updatedImages = [imageUrl, ...mockupImages];
      setMockupImages(updatedImages);

      // Create updated variant object with new image
      const updatedVariant = {
        ...variant,
        images: {
          ...variant.images,
          mockup: updatedImages,
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

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    if (!variant) return;

    // Prevent deleting if it's the last image
    if (mockupImages.length <= 1) {
      toast.error("Cannot delete the last image. At least one image is required.");
      return;
    }

    setDeletingImageIndex(index);

    // Optimistically update UI immediately
    const updatedImages = mockupImages.filter(url => url !== imageUrl);
    setMockupImages(updatedImages);

    try {
      await deleteVariantMockupImage(variant.id, imageUrl);

      // Create updated variant object without the deleted image
      const updatedVariant = {
        ...variant,
        images: {
          ...variant.images,
          mockup: updatedImages,
        },
      };

      toast.success("Image deleted successfully");
      onSave(updatedVariant);
    } catch (error) {
      // Revert on error
      setMockupImages(variant.images.mockup || []);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete image";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const handleReorderImage = async (index: number, direction: "up" | "down") => {
    if (!variant) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= mockupImages.length) return;

    // Create new array with swapped images
    const updatedImages = [...mockupImages];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];

    // Update UI immediately
    setMockupImages(updatedImages);

    try {
      // Update variant with new order
      await updateVariant(variant.id, {
        images: {
          ...variant.images,
          mockup: updatedImages,
        },
      });

      // Create updated variant object
      const updatedVariant = {
        ...variant,
        images: {
          ...variant.images,
          mockup: updatedImages,
        },
      };

      toast.success("Image order updated");
      onSave(updatedVariant);
    } catch (error) {
      // Revert on error
      setMockupImages(variant.images.mockup || []);
      toast.error("Failed to reorder images");
      console.error(error);
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
            <Label>Mockup Images ({mockupImages.length})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mockupImages.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="relative group">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-border">
                    <Image src={imageUrl} alt={`Mockup ${index + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                  {/* Reorder buttons */}
                  <div className="absolute left-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white"
                      onClick={() => handleReorderImage(index, "up")}
                      disabled={index === 0}
                      title="Move up">
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white"
                      onClick={() => handleReorderImage(index, "down")}
                      disabled={index === mockupImages.length - 1}
                      title="Move down">
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
                    onClick={() => handleDeleteImage(imageUrl, index)}
                    disabled={deletingImageIndex === index || mockupImages.length <= 1}
                    title={mockupImages.length <= 1 ? "At least one image is required" : "Delete image"}>
                    {deletingImageIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                  {mockupImages.length <= 1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white text-xs font-medium px-2 py-1 bg-destructive rounded">Required</span>
                    </div>
                  )}
                </div>
              ))}
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
