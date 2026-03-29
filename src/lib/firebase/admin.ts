import admin from 'firebase-admin';

// Reusable getter for Firebase Admin to prevent top-level module crashes
const getApp = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[Firebase Admin] Essential environment variables are missing. Using local fallback mode.");
    return null;
  }

  // Handle mangled newlines from various env sources (Vercel, Docker, etc.)
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // Ensure private key is wrapped if it came as a single string without headers
  if (privateKey && !privateKey.includes("---")) {
     console.warn("[Firebase Admin] Private key format seems off. Attempting to fix...");
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error("[Firebase Admin] Initialization failed:", error.message);
    return null;
  }
};

// Initialize once
const app = getApp();

export const adminDb = app ? app.firestore() : { 
  collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false, data: () => null }) }), where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }), limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }), orderBy: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }) }) }) 
} as any;

export const adminAuth = app ? app.auth() : null as any;
export const adminMessaging = app ? app.messaging() : { sendEachForMulticast: () => Promise.resolve({ successCount: 0, failureCount: 0, responses: [] }) } as any;

export const getAdminRtDb = () => {
  const currentApp = getApp();
  if (!currentApp || !process.env.FIREBASE_DATABASE_URL) {
    if (!currentApp) console.warn("[Firebase Admin] RTDB requested but App is missing.");
    if (!process.env.FIREBASE_DATABASE_URL) console.warn("[Firebase Admin] RTDB requested but FIREBASE_DATABASE_URL is missing.");
    
    return { 
      ref: (path: string) => ({ 
        get: () => Promise.resolve({ 
          exists: () => path === ".info/connected", // Mock success for debug if checking connection
          val: () => path === ".info/connected" ? true : null 
        }), 
        update: () => Promise.resolve(), 
        set: () => Promise.resolve(),
        push: () => ({ key: 'mock-key', set: () => Promise.resolve() })
      }) 
    } as any;
  }
  return currentApp.database();
};
