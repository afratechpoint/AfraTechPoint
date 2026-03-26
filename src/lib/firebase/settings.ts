// lib/firebase/settings.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firestore";

const SETTINGS_DOC_ID = "main";
const SETTINGS_COLLECTION = "config";

export async function getSettingsFromFirestore() {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function updateSettingsInFirestore(data: any) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, data, { merge: true });
}
