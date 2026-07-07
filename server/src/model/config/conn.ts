import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const initFirebase = () => {
  if (getApps().length > 0) return;

  // ADC reads credentials from:
  //   1. GOOGLE_APPLICATION_CREDENTIALS env var  OR
  //   2. gcloud auth application-default login
  initializeApp({ credential: applicationDefault() });

  console.log("Firebase Admin initialized via ADC");
};

export const db = () => getFirestore();
export const auth = () => getAuth();
export const storage = () => getStorage();

export default initFirebase;
