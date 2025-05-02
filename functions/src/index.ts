// https://github.com/robisim74/firebase-functions-typescript-starter/blob/master/functions/src/index.ts

import dotenv from "dotenv";
dotenv.config();

import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { onReviewDeleted as onReviewDeletedFunction } from "./onReviewDeleted";
import { syncGoogleReviews as syncGoogleReviewsFunction } from "./syncGoogleReviews";

export const onReviewDeleted = onDocumentDeleted("reviews/{reviewId}", onReviewDeletedFunction);

export const syncGoogleReviews = onSchedule(
  {
    schedule: "0 0 */2 * *",
    timeZone: "Asia/Kolkata",
    // region: "asia-south1",
  },
  syncGoogleReviewsFunction
);
