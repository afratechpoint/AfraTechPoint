"use client";

// contexts/AuthContext.tsx
// Global auth state for the entire app.
// Wrap your root layout with <AuthProvider> to make useAuth available everywhere.

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logOut,
  sendPasswordReset,
} from "@/lib/firebase/auth";
import { syncUserToFirestore } from "@/app/actions/auth";

// ── Types ─────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  isShopManager: boolean;
  isOrderManager: boolean;
  displayName: string | null;
  photoURL: string | null;
  signIn:  (email: string, password: string) => Promise<void>;
  signUp:  (name: string, email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout:  () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").toLowerCase().split(",");
  const isAdminByEmail = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  const isAdmin = role === "admin" || isAdminByEmail;
  const isShopManager = role === "shop_manager";
  const isOrderManager = role === "order_manager";

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // ── Sync and Fetch from Server (bypasses permission rules) ──
          const result = await syncUserToFirestore(
            firebaseUser.uid,
            firebaseUser.email || "",
            firebaseUser.displayName || "",
            firebaseUser.photoURL || ""
          );

          if (result.success && result.userData) {
            setDisplayName(result.userData.displayName || firebaseUser.displayName || null);
            setPhotoURL(result.userData.photoURL || firebaseUser.photoURL || null);
            setRole(result.userData.role || "customer");
          } else {
            console.warn("Sync returned failure, falling back to auth only", result.error);
            setDisplayName(firebaseUser.displayName);
            setPhotoURL(firebaseUser.photoURL);
            setRole("customer");
          }

          // ── Force-refresh token if needed ──
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claimRole = tokenResult.claims.role as string | undefined;
          if (claimRole !== (result.userData?.role || "customer")) {
            firebaseUser.getIdToken(true).catch(() => {});
          }
        } catch (e) {
          console.error("AuthContext fetch error:", e);
          setRole("customer");
          setDisplayName(firebaseUser.displayName);
          setPhotoURL(firebaseUser.photoURL);
        }
      } else {
        setRole(null);
        setDisplayName(null);
        setPhotoURL(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Auth actions ──────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const cred = await signUpWithEmail(name, email, password);
    // Sync to Firestore via Server Action (non-blocking)
    if (cred.user) {
      syncUserToFirestore(
        cred.user.uid,
        cred.user.email || "",
        name,
        cred.user.photoURL || ""
      ).catch(console.error);
    }
  };

  const googleSignIn = async () => {
    const cred = await signInWithGoogle();
    // Sync to Firestore via Server Action (non-blocking)
    if (cred.user) {
      syncUserToFirestore(
        cred.user.uid,
        cred.user.email || "",
        cred.user.displayName || "",
        cred.user.photoURL || ""
      ).catch(console.error);
    }
  };

  const logout = async () => {
    await logOut();
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, loading, role, isAdmin, isShopManager, isOrderManager, 
        displayName, photoURL,
        signIn, signUp, googleSignIn, logout, resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
