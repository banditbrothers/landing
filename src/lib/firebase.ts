import { initializeApp, getApp, getApps } from "firebase/app";

import { getAuth, signInAnonymously as signInAnonymouslyFirebase } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "643825030957",
  appId: "1:643825030957:web:b3dfc9609e0321e128e5a4",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const storage = getStorage(app);

export const signInAnonymously = async () => {
  signInAnonymouslyFirebase(auth).catch(error => {
    console.error("error", error);
  });
};

export const getCollectionDocumentId = (collectionName: string) => {
  const db = getFirestore(app);
  const collectionRef = collection(db, collectionName);
  const newDocRef = doc(collectionRef);
  return newDocRef.id;
};
