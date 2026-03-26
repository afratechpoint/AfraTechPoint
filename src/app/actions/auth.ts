"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { dispatchWelcomeEmail } from "./email";

export async function syncUserToFirestore(uid: string, email: string, displayName: string, photoURL?: string) {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    
    if (!snap.exists) {
      await userRef.set({
        uid,
        email,
        displayName: displayName || "",
        photoURL: photoURL || "",
        role: "customer",
        createdAt: FieldValue.serverTimestamp()
      });
      
      // Dispatch Welcome Email asynchronously for newly created accounts
      if (email) {
        dispatchWelcomeEmail(email, displayName || "Customer").catch(console.error);
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Admin syncUserToFirestore error:", error);
    return { success: false, error: error.message };
  }
}
