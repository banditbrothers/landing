import { FieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestoreEvent } from "firebase-functions/firestore";

import { firestore, storage } from "./firebase-admin";
import { getPathStorageFromUrl } from "./utils";

type Event = FirestoreEvent<QueryDocumentSnapshot | undefined, { reviewId: string }>;

export const onDeleteReview = async (event: Event) => {
  const reviewId = event.params.reviewId;

  if (event.data) {
    const data = event.data.data();
    const orderId = data.orderId;
    const images = data.images;
    const imagesPath = images.map((image: string) => getPathStorageFromUrl(image));

    console.log({ reviewId, orderId, images, imagesPath });

    // remove reviewId from order
    const removeOrderIdPromise = firestore()
      .collection("orders")
      .doc(orderId)
      .update({ reviewId: FieldValue.delete() });

    // delete images folder from storage
    const deleteImagesPromise = storage
      .bucket("gs://banditbrothers-5253.firebasestorage.app")
      .deleteFiles({ prefix: `reviews/${reviewId}` });

    const results = await Promise.allSettled([removeOrderIdPromise, deleteImagesPromise]);
    console.log({ results });
  }
};
