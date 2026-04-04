"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { dispatchWelcomeEmail } from "./email";
import { createNotificationInFirestore } from "@/lib/firebase/server_firestore";

export async function syncUserToFirestore(uid: string, email: string, displayName: string, photoURL?: string) {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    
    const baseData = {
      email,
      lastLogin: FieldValue.serverTimestamp()
    };

    // Construct update data, only taking photo and name if they are defined
    const updateData: any = { ...baseData };
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    if (!snap.exists) {
      await userRef.set({
        ...updateData,
        uid,
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

      // Dispatch Welcome Email
      if (email) {
        dispatchWelcomeEmail(email, displayName || "Customer").catch(console.error);
      }
    } else {
      // Always update display name and photo from Google if available
      await userRef.update(updateData);
    }
    
    // Fetch the final data to return to the client
    const finalSnap = await userRef.get();
    const finalData = finalSnap.data();

    return { 
      success: true, 
      userData: {
        displayName: finalData?.displayName || "",
        photoURL: finalData?.photoURL || "",
        role: finalData?.role || "customer"
      }
    };
  } catch (error: any) {
    console.error("Admin syncUserToFirestore error:", error);
    return { success: false, error: error.message };
  }
}
