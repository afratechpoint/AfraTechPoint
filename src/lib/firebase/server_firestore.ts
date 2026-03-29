// lib/firebase/server_firestore.ts
import { adminDb, adminMessaging, getAdminRtDb, adminAuth } from "./admin";
import admin from "firebase-admin";

export { adminDb, adminMessaging, getAdminRtDb, adminAuth };

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

  // Create admin notification (non-blocking — never crash order creation)
  try {
    await createNotificationInFirestore({
      type: "new_order",
      title: "New Order Placed",
      message: `New order #${docRef.id.slice(0, 8).toUpperCase()} - BDT ${orderData.totalAmount || orderData.total || "N/A"} received.`,
      recipient: "admin",
      link: `/admin/orders/${docRef.id}`,
    });
  } catch (notifErr: any) {
    console.error("[Notification] Failed to create order notification:", notifErr.message);
  }

  // Return the full object so calling code can access .id, .createdAt, etc.
  return {
    id: docRef.id,
    ...orderData,
    createdAt: new Date().toISOString(),
  };
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
  // We fetch without orderBy to avoid mandatory composite index requirement
  const q = adminDb.collection("orders")
    .where("userId", "==", userId);
    
  const snap = await q.get();
  const orders = snap.docs.map((d: any) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  });

  // Sort in-memory to bypass index blocker
  return orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllOrders() {
  const q = adminDb.collection("orders").orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map((d: any) => {
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

  // If status updated, notify the user (non-blocking)
  if (fields.orderStatus || fields.status) {
    const newStatus = fields.orderStatus || fields.status;
    console.log(`[Notification] Order ${orderId} status changed to ${newStatus}. Triggering notification...`);
    
    try {
      const snap = await docRef.get();
      const order = snap.data();
      if (order?.userId) {
        console.log(`[Notification] Recipient UID: ${order.userId}`);
        const result = await createNotificationInFirestore({
          type: "order_status_update",
          title: "Order Update",
          message: `Your order #${orderId.slice(0, 8).toUpperCase()} status is now: ${newStatus}.`,
          recipient: order.userId,
          link: `/account/orders/${orderId}`,
        });
        console.log(`[Notification] Result:`, result);
      } else {
        console.warn(`[Notification] Order ${orderId} has no userId. Cannot send push.`);
      }
    } catch (notifErr: any) {
      console.error("[Notification] Failed to create status notification:", notifErr.message);
    }
  }
}

export async function getPendingOrdersCount() {
  const q = adminDb.collection("orders").where("orderStatus", "==", "pending");
  const snap = await q.get();
  return snap.size;
}

// --- Products ---
export async function getProductsFromFirestore() {
  const q = adminDb.collection("products").orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function createProductInFirestore(data: any) {
  const docRef = await adminDb.collection("products").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { 
    id: docRef.id, 
    ...data,
    createdAt: new Date().toISOString()
  };
}

export async function updateProductInFirestore(id: string, data: any) {
  const docRef = adminDb.collection("products").doc(id);
  await docRef.update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
}

export async function deleteProductFromFirestore(id: string) {
  await adminDb.collection("products").doc(id).delete();
}

// ── TRAFFIC STATS ──
export async function incrementTrafficCount() {
  const docRef = adminDb.collection("stats").doc("global");
  const doc = await docRef.get();
  
  if (!doc.exists) {
    await docRef.set({ trafficCount: 1 });
  } else {
    await docRef.update({
      trafficCount: admin.firestore.FieldValue.increment(1)
    });
  }
}

export async function getTrafficCount(): Promise<number> {
  const doc = await adminDb.collection("stats").doc("global").get();
  return doc.exists ? (doc.data()?.trafficCount || 0) : 0;
}

export async function deleteOrderFromFirestore(id: string) {
  await adminDb.collection("orders").doc(id).delete();
}

// --- Notifications ---
export async function createNotificationInFirestore(notif: any) {
  const ref = adminDb.collection("notifications");
  await ref.add({
    ...notif,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Also send real Web Push via FCM (non-blocking)
  sendPushToUser(notif.recipient, notif.title, notif.message, notif.link).catch(console.error);
}

export async function getNotifications(recipient: string = "admin", limit: number = 20) {
  try {
    const q = adminDb.collection("notifications")
      .where("recipient", "==", recipient)
      .orderBy("createdAt", "desc")
      .limit(limit);
      
    const snap = await q.get();
    return snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
  } catch (err: any) {
    // If composite index not yet created, fall back to unordered query
    console.warn("getNotifications: index may be missing, retrying without orderBy:", err.message);
    const q = adminDb.collection("notifications").where("recipient", "==", recipient).limit(limit);
    const snap = await q.get();
    return snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
  }
}

export async function markNotificationAsRead(id: string) {
  const docRef = adminDb.collection("notifications").doc(id);
  await docRef.update({ isRead: true });
}

export async function markAllNotificationsAsRead(recipient: string = "admin") {
  const q = adminDb.collection("notifications")
    .where("recipient", "==", recipient)
    .where("isRead", "==", false);
    
  const snap = await q.get();
  const batch = adminDb.batch();
  snap.docs.forEach((d: any) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

// --- Web Push Tokens ---
export async function savePushTokenInFirestore(uid: string, token: string) {
  console.log(`[Push] Attempting to save token for UID: ${uid}`);
  const ref = adminDb.collection("push_tokens").doc(token);
  await ref.set({
    uid,
    token,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`[Push] Token saved successfully for UID: ${uid}`);
}

export async function sendPushToUser(uid: string, title: string, body: string, link?: string) {
  console.log(`[FCM] Triggered push for UID: ${uid}`);
  // Find all tokens for this user
  const q = adminDb.collection("push_tokens").where("uid", "==", uid);
  const snap = await q.get();
  const tokens = snap.docs.map((d: any) => d.id);
  
  console.log(`[FCM] Found ${tokens.length} tokens for UID: ${uid}`);
  if (tokens.length > 0) {
    console.log(`[FCM] Token sample: ${tokens[0].slice(0, 10)}...`);
  }
  
  if (tokens.length === 0) {
    console.log(`[FCM] No tokens found for recipient: ${uid}`);
    return { success: true, tokensFound: 0 };
  }

  const message = {
    notification: { title, body },
    data: { url: link || "/" },
    tokens: tokens,
  };

  try {
    const response = await adminMessaging.sendEachForMulticast(message);
    console.log(`[FCM] Sent to ${response.successCount} devices, ${response.failureCount} failed.`);
    
    // Cleanup failed tokens (invalid/unsubscribed)
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success && resp.error?.code?.includes("registration-token-not-registered")) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        const batch = adminDb.batch();
        failedTokens.forEach(t => batch.delete(adminDb.collection("push_tokens").doc(t)));
        await batch.commit();
      }
    }
    return { 
      success: true, 
      tokensFound: tokens.length, 
      sentCount: response.successCount, 
      failCount: response.failureCount 
    };
  } catch (error: any) {
    console.error("[FCM] Error sending multicast:", error);
    return { success: false, error: error.message };
  }
}

// --- User Profiles ---
export async function getUserProfileFromFirestore(uid: string) {
  const docRef = adminDb.collection("users").doc(uid);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return docSnap.data();
  }
  return null;
}

export async function updateUserProfileInFirestore(uid: string, data: any) {
  const docRef = adminDb.collection("users").doc(uid);
  await docRef.set({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// --- Realtime Database (RTDB) Fallback ---
export async function updateUserProfileInRTDB(uid: string, data: any) {
  try {
    const adminRtDb = getAdminRtDb();
    const ref = adminRtDb.ref(`profiles/${uid}`);
    await ref.update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log(`[RTDB] Profile sync success for ${uid}`);
  } catch (err: any) {
    console.error(`[RTDB] Sync failed: ${err.message}`);
  }
}

export async function getUserProfileFromRTDB(uid: string) {
  try {
    const adminRtDb = getAdminRtDb();
    const ref = adminRtDb.ref(`profiles/${uid}`);
    const snap = await ref.get();
    return snap.exists() ? snap.val() : null;
  } catch (err: any) {
    console.error(`[RTDB] Fetch failed: ${err.message}`);
    return null;
  }
}



