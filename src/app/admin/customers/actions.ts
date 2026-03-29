"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

/**
 * Helper to verify caller's admin privileges.
 */
async function verifyAdmin(token: string) {
  if (!token) throw new Error("No token provided");
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  // First check if the token claim itself is admin
  if (decodedToken.role === "admin") {
    return decodedToken.uid;
  }
  
  // Fallback to Firestore check
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  const data = userDoc.data();
  
  if (data?.role === "admin") {
    return decodedToken.uid;
  }

  // ── BOOTSTRAPPING LOGIC ──────────────────────────────────────────
  // If there are NO admins in the system at all, the first person 
  // to hit this becomes an admin. Or if their email matches ADMIN_EMAIL.
  const adminEmail = process.env.ADMIN_EMAIL;
  const isFirstOrConfiguredAdmin = 
    (adminEmail && decodedToken.email === adminEmail);

  if (isFirstOrConfiguredAdmin) {
    console.log(`Bootstrapping admin privileges for: ${decodedToken.email}`);
    // Set Custom Claims
    await adminAuth.setCustomUserClaims(decodedToken.uid, { role: "admin" });
    // Update Firestore
    await adminDb.collection("users").doc(decodedToken.uid).set({ role: "admin" }, { merge: true });
    return decodedToken.uid;
  }

  // Check if ANY admin exists in Firestore
  const adminQuery = await adminDb.collection("users").where("role", "==", "admin").limit(1).get();
  if (adminQuery.empty) {
    console.log(`No admins found in system. Auto-elevating: ${decodedToken.email}`);
    // Set Custom Claims
    await adminAuth.setCustomUserClaims(decodedToken.uid, { role: "admin" });
    // Update Firestore
    await adminDb.collection("users").doc(decodedToken.uid).set({ role: "admin" }, { merge: true });
    return decodedToken.uid;
  }
  
  throw new Error(`Unauthorized: ${decodedToken.email} is not an admin.`);
}

export async function getUsers(token: string) {
  await verifyAdmin(token);
  
  // 1. List ALL users from Firebase Auth (source of truth)
  const listResult = await adminAuth.listUsers(1000);

  // 2. Fetch all Firestore docs in one go for role/profile data
  const snapshot = await adminDb.collection("users").get();
  const firestoreMap: Record<string, any> = {};
  snapshot.forEach((doc: any) => { firestoreMap[doc.id] = doc.data(); });

  // 3. Merge: Auth user + Firestore enrichment
  return listResult.users.map((authUser: any) => {
    const fs = firestoreMap[authUser.uid] || {};
    return {
      uid:         authUser.uid,
      email:       authUser.email || fs.email || "",
      displayName: authUser.displayName || fs.displayName || "",
      role:        fs.role || "customer",
      createdAt:   authUser.metadata.creationTime || new Date().toISOString(),
    };
  }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Expose super-admin email to the client so the UI can enforce restrictions. */
export async function getSuperAdminEmail(token: string): Promise<string> {
  await verifyAdmin(token);
  return process.env.ADMIN_EMAIL || "";
}

export async function updateUserRole(targetUid: string, newRole: string, token: string) {
  const callerDecoded = await adminAuth.verifyIdToken(token);
  const callerEmail = callerDecoded.email || "";
  const superAdminEmail = process.env.ADMIN_EMAIL || "";

  // Only the ADMIN_EMAIL holder (super-admin) can change roles
  if (callerEmail !== superAdminEmail) {
    throw new Error("Only the permanent super-admin can change user roles.");
  }

  // Super-admin cannot change their own role
  if (callerDecoded.uid === targetUid) {
    throw new Error("You cannot change your own role.");
  }

  // Nobody can demote/change the permanent super-admin's role
  const targetUser = await adminAuth.getUser(targetUid);
  if (targetUser.email === superAdminEmail) {
    throw new Error("The permanent super-admin's role cannot be changed.");
  }

  // Apply the role change
  await adminAuth.setCustomUserClaims(targetUid, { role: newRole });
  await adminDb.collection("users").doc(targetUid).set({ role: newRole }, { merge: true });
  
  return { success: true };
}

export async function deleteUserAccount(targetUid: string, token: string) {
  const callerUid = await verifyAdmin(token);
  if (callerUid === targetUid) {
    throw new Error("You cannot delete your own account from the admin panel.");
  }

  // Delete from Firebase Auth
  await adminAuth.deleteUser(targetUid);
  
  // Delete from Firestore
  await adminDb.collection("users").doc(targetUid).delete();
  
  return { success: true };
}
