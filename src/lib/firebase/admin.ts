import * as admin from "firebase-admin";

const apps = admin.apps;

if (!apps.length) {
  // Try to initialize using service account parameters if provided in env
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  // Format private key handling literal \n characters properly from env variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback to default credentials (e.g. locally with GOOGLE_APPLICATION_CREDENTIALS or Firebase Functions)
    admin.initializeApp();
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
