// https://github.com/robisim74/firebase-functions-typescript-starter/blob/master/functions/src/index.ts

import dotenv from "dotenv";
dotenv.config();

import { onDocumentDeleted } from "firebase-functions/v2/firestore";

import { onDeleteReview as onDeleteReviewFunction } from "./onDeleteReview";

export const onDeleteReview = onDocumentDeleted("reviews/{reviewId}", onDeleteReviewFunction);
