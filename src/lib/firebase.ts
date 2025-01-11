"use server";

import * as admin from "firebase-admin";
import serviceAccount from "../../firebase-service-account-admin.json";

// Check if Firebase admin is already initialized to prevent multiple instances
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const firestore = admin.firestore;
