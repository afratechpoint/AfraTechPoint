import { adminAuth } from "./firebase/admin";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

/**
 * Verifies a Firebase ID token from the Authorization header and checks if the user is an admin.
 * @returns The decoded token if valid and user is admin, otherwise null.
 */
export async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) return null;

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken || !decodedToken.email) return null;

    // Check if email is in the admin list
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .toLowerCase()
      .split(",")
      .map(e => e.trim());

    if (adminEmails.includes(decodedToken.email.toLowerCase())) {
      return decodedToken;
    }

    return null;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Generic user verification for non-admin protected routes.
 */
export async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) return null;

    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    return null;
  }
}

/**
 * Version for Server Actions. Reads from headers directly.
 */
export async function verifyAdminAction() {
  try {
    const h = await headers();
    const authHeader = h.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .toLowerCase().split(",").map(e => e.trim());

    if (decodedToken.email && adminEmails.includes(decodedToken.email.toLowerCase())) {
      return decodedToken;
    }
    return null;
  } catch {
    return null;
  }
}
