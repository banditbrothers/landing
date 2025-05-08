"use server";

// import { DESIGNS, PRODUCTS } from "@/data/products";
// import { firestore } from "@/lib/firebase-admin";
// import { ProductVariant } from "@/types/product";
// import { getSKU } from "@/utils/product";
// import { uploadWebpImageToS3 } from "@/utils/s3Upload";

// export const addVariants = async () => {
//   const variantRef = firestore().collection("variants");
//   const batch = firestore().batch();

//   PRODUCTS.forEach(product => {
//     DESIGNS.forEach(design => {
//       const id = getSKU(product.id, design.id);

//       const variant: ProductVariant = {
//         productId: product.id,
//         designId: design.id,
//         images: { mockup: [], detail: [], lifestyle: [], main: [], thumbnail: "" },
//         sku: id,
//       };

//       const variantDoc = variantRef.doc(id);
//       batch.set(variantDoc, variant, { merge: true });
//     });
//   });

//   await batch.commit();
//   console.log("Variants added");
// };

// export const uploadImage = async (imageName: string, s3Key: string, bucketName: string, designId: string) => {
//   const imageUrl = await uploadWebpImageToS3(imageName, s3Key, bucketName);

//   // toast.success("Image uploaded successfully");
//   console.log("Uploaded image URL:", imageUrl);

//   await updateVariantImages(designId, imageUrl);
//   console.log("Updated variant images");

//   return imageUrl;
// };

// export const updateVariantImages = async (designId: string, mockImageUrl: string) => {
//   const variantRef = firestore().collection("variants").doc(getSKU("bandana", designId));
//   await variantRef.update({
//     images: { mockup: [mockImageUrl] },
//   });
// };