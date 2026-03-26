// lib/firebase/firestore.ts
// Client-side Firestore helpers for reading/writing orders.
// Uses the Firebase client SDK (safe to import in "use client" components).

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Order } from "@/types/order";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Create a new order ────────────────────────────────────────────────────
export async function createOrderInFirestore(
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Fetch a single order by ID ────────────────────────────────────────────
export async function getOrderById(orderId: string): Promise<Order | null> {
  const docRef  = doc(db, "orders", orderId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    // Convert Firestore Timestamps to JS Dates
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  } as Order;
}

// ── Fetch all orders for a specific user ──────────────────────────────────
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    } as Order;
  });
}

// ── Fetch ALL orders (admin) ──────────────────────────────────────────────
export async function getAllOrders(): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    } as Order;
  });
}

// ── Update order details (admin) ──────────────────────────────────────────
export async function updateOrderInFirestore(
  orderId: string,
  fields: Partial<Order>
): Promise<void> {
  const docRef = doc(db, "orders", orderId);
  await updateDoc(docRef, { ...fields, updatedAt: serverTimestamp() });
}

// ── Product Management ────────────────────────────────────────────────────
export async function getProductsFromFirestore() {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createProductInFirestore(data: any) {
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: docRef.id, ...data };
}

export async function updateProductInFirestore(id: string, data: any) {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProductFromFirestore(id: string) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "products", id));
}
