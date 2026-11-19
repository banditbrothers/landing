"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVariant } from "@/types/product";
import { getVariantsAdmin, deleteVariant } from "@/actions/products";
import { EditVariantDialog } from "@/components/dialogs/EditVariantDialog";
import { AddVariantDialog } from "@/components/dialogs/AddVariantDialog";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { getProductVariantName, getProductVariantPrice, getSizeLabel, LOW_STOCK_THRESHOLD } from "@/utils/product";
import { formatCurrency } from "@/utils/price";
import Image from "next/image";
import { Edit, Eye, Package, Trash2, Plus } from "lucide-react";
import { LoadingIcon } from "@/components/misc/Loading";
import { useAdminLoad } from "./adminHooks";
import { routes } from "@/utils/routes";

export const ProductManagement = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [productFilter, setProductFilter] = useState("all");

  const isLoading = useAdminLoad(getVariantsAdmin, setVariants, "products");

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedVariant(null);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleSaveVariant = (updatedVariant: ProductVariant) => {
    // Update only the specific variant in local state
    setVariants(prevVariants =>
      prevVariants.map(variant => (variant.id === updatedVariant.id ? updatedVariant : variant))
    );
  };

  const handleAddVariant = (newVariant: ProductVariant) => {
    // Add the new variant to local state
    setVariants(prevVariants => [newVariant, ...prevVariants]);
  };

  const handleDeleteVariant = async (variant: ProductVariant) => {
    if (
      !confirm(
        `Permanently delete "${getProductVariantName(variant)}"? This cannot be undone.\n\n` +
          `Past orders and reviews of this variant will lose its name and image. To just hide it from the shop, ` +
          `cancel and switch off "Is Available" in Edit instead.`
      )
    ) {
      return;
    }

    try {
      await deleteVariant(variant.id);
      // Remove the variant from local state
      setVariants(prevVariants => prevVariants.filter(v => v.id !== variant.id));
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert("Failed to delete variant. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingIcon />
      </div>
    );
  }

  const filteredVariants = productFilter === "all" ? variants : variants.filter(v => v.productId === productFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Variants Management</h2>
          <p className="text-muted-foreground">Manage all product variants and their properties</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            {variants.length} Variants
          </Badge>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Variant
          </Button>
        </div>
      </div>

      <Tabs value={productFilter} onValueChange={setProductFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({variants.length})</TabsTrigger>
          {PRODUCTS.map(p => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.name} ({variants.filter(v => v.productId === p.id).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariants.map(variant => {
              const variantName = getProductVariantName(variant);
              const variantPrice = getProductVariantPrice(variant);
              const product = PRODUCTS_OBJ[variant.productId];

              return (
                <TableRow key={variant.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {variant.images.mockup[0] && (
                        <Image
                          src={variant.images.mockup[0]}
                          alt={variantName}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{variantName}</div>
                      {variant.sku && <div className="text-sm text-muted-foreground">SKU: {variant.sku}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product?.name || variant.productId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(variantPrice)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {(product?.sizes ?? []).map(size => {
                        const qty = variant.stock?.[size];
                        const color =
                          qty === undefined
                            ? "text-muted-foreground"
                            : qty === 0
                              ? "text-red-500 font-medium"
                              : qty <= LOW_STOCK_THRESHOLD
                                ? "text-amber-500 font-medium"
                                : "";
                        return (
                          <span key={size} className={color}>
                            {getSizeLabel(size)}: {qty ?? "–"}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-row gap-1">
                      <Badge variant={variant.isAvailable ? "default" : "secondary"}>
                        {variant.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                      {variant.isBestSeller && (
                        <Badge variant="destructive" className="text-xs">
                          Best Seller
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVariant(variant)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(routes.variant(variant), "_blank")}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditVariantDialog
        variant={selectedVariant}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveVariant}
      />

      <AddVariantDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onSave={handleAddVariant}
        existingVariants={variants}
      />
    </div>
  );
};
