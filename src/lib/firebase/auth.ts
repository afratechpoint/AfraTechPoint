// lib/firebase/auth.ts
// Clean helper functions for common Firebase auth operations.
// Components should call these instead of importing Firebase directly.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  type UserCredential,
  type User,
} from "firebase/auth";
import { auth } from "./client";

const googleProvider = new GoogleAuthProvider();

// ── Sign In ───────────────────────────────────────────────────────
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// ── Register ─────────────────────────────────────────────────────
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Attach the display name to the Firebase profile
  await updateProfile(cred.user, { displayName: name });
  return cred;
}

// ── Google Sign-In ────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<UserCredential> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred;
}

// ── Sign Out ──────────────────────────────────────────────────────
export async function logOut(): Promise<void> {
  return signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function confirmNewPassword(code: string, newPassword: string): Promise<void> {
  return firebaseConfirmPasswordReset(auth, code, newPassword);
}

export async function verifyResetCode(code: string): Promise<string> {
  return firebaseVerifyPasswordResetCode(auth, code);
}

// ── Human-readable Firebase error messages ────────────────────────
export function getFirebaseErrorMessage(code: string | undefined): string {
  if (!code) return "An unexpected error occurred. Please try again.";
  
  const messages: Record<string, string> = {
    "auth/user-not-found":           "No account found with this email.",
    "auth/wrong-password":           "Incorrect password. Please try again.",
    "auth/invalid-credential":       "Invalid email or password. If you signed up with Google, please use 'Continue with Google'.",
    "auth/invalid-login-credentials":"Invalid email or password. If you signed up with Google, please use 'Continue with Google'.",
    "auth/email-already-in-use":     "An account with this email already exists.",
    "auth/weak-password":            "Password must be at least 6 characters.",
    "auth/invalid-email":            "Please enter a valid email address.",
    "auth/too-many-requests":        "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user":     "Google sign-in was cancelled.",
    "auth/cancelled-popup-request":  "Google sign-in was cancelled.",
    "auth/popup-blocked":            "Popup was blocked by the browser. Please allow popups.",
    "auth/network-request-failed":   "Network error. Please check your connection.",
    "auth/user-disabled":            "This account has been disabled.",
    "auth/operation-not-allowed":    "This sign-in method is not enabled.",
    "auth/account-exists-with-different-credential": "An account already exists with this email via Google. Please sign in with Google or reset your password to add a manual login.",
  };
  
  if (messages[code]) return messages[code];

  // Specific fallback heuristics
  if (code.includes("popup")) return "Google sign-in was cancelled.";
  if (code.includes("network")) return "Network error. Please check your connection.";
  
  return `Authentication failed: ${code}`;
}
