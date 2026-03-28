"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { dispatchWelcomeEmail } from "./email";
import { createNotificationInFirestore } from "@/lib/firebase/server_firestore";

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
      
      // Notify admin of new user (non-blocking)
      createNotificationInFirestore({
        type: "new_user",
        title: "New User Registered",
        message: `${displayName || "A new user"} (${email}) just created an account.`,
        recipient: "admin",
        link: `/admin/customers`,
      }).catch(console.error);

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
