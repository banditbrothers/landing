// https://github.com/robisim74/firebase-functions-typescript-starter/blob/master/functions/src/index.ts

import dotenv from "dotenv";
dotenv.config();

import { onDocumentDeleted } from "firebase-functions/v2/firestore";

import { onReviewDeleted as onReviewDeletedFunction } from "./onReviewDeleted";

export const onReviewDeleted = onDocumentDeleted("reviews/{reviewId}", onReviewDeletedFunction);
