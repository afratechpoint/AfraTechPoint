// lib/firebase/server_firestore.ts
import { adminDb } from "./admin";
import admin from "firebase-admin";

const SETTINGS_DOC_ID = "main";
const SETTINGS_COLLECTION = "config";

// --- Settings ---
export async function getSettingsFromFirestore() {
  const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return docSnap.data();
  }
  return null;
}

export async function updateSettingsInFirestore(data: any) {
  const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);
  await docRef.set(data, { merge: true });
}

// --- Orders ---
export async function createOrderInFirestore(orderData: any) {
  const ordersRef = adminDb.collection("orders");
  const docRef = await ordersRef.add({
    ...orderData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrderById(orderId: string) {
  const docRef = adminDb.collection("orders").doc(orderId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data?.createdAt?.toDate() || new Date(),
    updatedAt: data?.updatedAt?.toDate() || new Date(),
  };
}

export async function getOrdersByUser(userId: string) {
  const q = adminDb.collection("orders")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  });
}

export async function getAllOrders() {
  const q = adminDb.collection("orders").orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  });
}

export async function updateOrderInFirestore(orderId: string, fields: any) {
  const docRef = adminDb.collection("orders").doc(orderId);
  await docRef.update({ ...fields, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
}

// --- Products ---
export async function getProductsFromFirestore() {
  const q = adminDb.collection("products").orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createProductInFirestore(data: any) {
  const docRef = await adminDb.collection("products").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { id: docRef.id, ...data };
}

export async function updateProductInFirestore(id: string, data: any) {
  const docRef = adminDb.collection("products").doc(id);
  await docRef.update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
}

export async function deleteProductFromFirestore(id: string) {
  await adminDb.collection("products").doc(id).delete();
}

export async function deleteOrderFromFirestore(id: string) {
  await adminDb.collection("orders").doc(id).delete();
}


