// lib/firebase/client.ts
// Initializes the Firebase client SDK using env vars.
// Import `auth` from here anywhere you need Firebase auth on the client.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Avoid re-initializing on hot-reload (Next.js dev mode)
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Messaging is only available in the browser and if supported
export const getPushMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (error) {
    console.error("Firebase Messaging could not be initialized:", error);
  }
  return null;
};

export default app;
