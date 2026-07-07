import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const initFirebase = () => {
  if (getApps().length > 0) return;

  const credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });

  initializeApp({ credential });

  console.log("Firebase Admin initialized via environment variables");
};

export const db = () => getFirestore();
export const auth = () => getAuth();
export const storage = () => getStorage();

export default initFirebase;
