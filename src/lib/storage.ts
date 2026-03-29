// lib/storage.ts
import { readData, writeData, settingsFile, productsFile, ordersFile, profilesFile } from "./db";

const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === "true";

// Server-side only Firestore adapter
const getAdapter = async () => {
  return await import("./firebase/server_firestore");
};

export const storage = {
  // ── Settings ──────────────────────────────────────────────────────────
  async getSettings() {
    if (USE_FIREBASE) {
      try {
        const { getSettingsFromFirestore } = await getAdapter();
        const data = await getSettingsFromFirestore();
        if (data) return data;
      } catch (err) {
        console.warn("Firestore settings fetch failed. Using local fallback.", err);
      }
    }
    return await readData(settingsFile);
  },
  async updateSettings(data: any) {
    if (USE_FIREBASE) {
      try {
        const { updateSettingsInFirestore } = await getAdapter();
        return await updateSettingsInFirestore(data);
      } catch (err) {
        console.warn("Firestore settings update failed. Using local fallback.", err);
      }
    }
    return await writeData(settingsFile, data);
  },

  // ── Orders ────────────────────────────────────────────────────────────
  async getOrders(filters?: { userId?: string }) {
    if (USE_FIREBASE) {
      try {
        const adapter = await getAdapter();
        let orders;
        if (filters?.userId) {
          orders = await adapter.getOrdersByUser(filters.userId);
        } else {
          orders = await adapter.getAllOrders();
        }
        if (orders) return orders;
      } catch (err) {
        console.warn("Firestore orders fetch failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    if (filters?.userId) {
      return orders.filter((o: any) => o.userId === filters.userId);
    }
    return orders;
  },

  async getOrderById(id: string) {
    if (USE_FIREBASE) {
      try {
        const { getOrderById } = await getAdapter();
        const order = await getOrderById(id);
        if (order) return order;
      } catch (err) {
        console.warn("Firestore getOrderById failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    return orders.find((o: any) => o.id === id) || null;
  },

  async createOrder(data: any) {
    if (USE_FIREBASE) {
      try {
        const { createOrderInFirestore } = await getAdapter();
        return await createOrderInFirestore(data);
      } catch (err) {
        console.warn("Firestore createOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    const newOrder = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    orders.push(newOrder);
    await writeData(ordersFile, orders);
    return newOrder;
  },

  async updateOrder(id: string, fields: any) {
    if (USE_FIREBASE) {
      try {
        const { updateOrderInFirestore } = await getAdapter();
        return await updateOrderInFirestore(id, fields);
      } catch (err) {
        console.warn("Firestore updateOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...fields, updatedAt: new Date().toISOString() };
      await writeData(ordersFile, orders);
    }
  },

  async deleteOrder(id: string) {
    if (USE_FIREBASE) {
      try {
        const { deleteOrderFromFirestore } = await getAdapter();
        await deleteOrderFromFirestore(id);
        return;
      } catch (err) {
        console.warn("Firestore deleteOrder failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    const filtered = orders.filter((o: any) => o.id !== id);
    await writeData(ordersFile, filtered);
  },

  async getPendingOrdersCount() {
    if (USE_FIREBASE) {
      try {
        const { getPendingOrdersCount } = await getAdapter();
        return await getPendingOrdersCount();
      } catch (err) {
        console.warn("Firestore getPendingOrdersCount failed. Using local fallback.", err);
      }
    }
    const orders = await readData(ordersFile);
    return orders.filter((o: any) => o.orderStatus === "pending").length;
  },

  // ── Products ──────────────────────────────────────────────────────────
  async getProducts() {
    if (USE_FIREBASE) {
      try {
        const { getProductsFromFirestore } = await getAdapter();
        const products = await getProductsFromFirestore();
        if (products) return products;
      } catch (err) {
        console.warn("Firestore products fetch failed. Using local fallback.", err);
      }
    }
    return await readData(productsFile);
  },

  async createProduct(data: any) {
    if (USE_FIREBASE) {
      try {
        const { createProductInFirestore } = await getAdapter();
        return await createProductInFirestore(data);
      } catch (err) {
        console.warn("Firestore createProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile);
    const newProduct = { id: crypto.randomUUID(), ...data };
    products.push(newProduct);
    await writeData(productsFile, products);
    return newProduct;
  },

  async updateProduct(id: string, data: any) {
    if (USE_FIREBASE) {
      try {
        const { updateProductInFirestore } = await getAdapter();
        return await updateProductInFirestore(id, data);
      } catch (err) {
        console.warn("Firestore updateProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile);
    const idx = products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
      await writeData(productsFile, products);
    }
  },

  async deleteProduct(id: string) {
    if (USE_FIREBASE) {
      try {
        const { deleteProductFromFirestore } = await getAdapter();
        return await deleteProductFromFirestore(id);
      } catch (err) {
        console.warn("Firestore deleteProduct failed. Using local fallback.", err);
      }
    }
    const products = await readData(productsFile);
    const filtered = products.filter((p: any) => p.id !== id);
    await writeData(productsFile, filtered);
  },

  // ── Notifications ─────────────────────────────────────────────────────
  async getNotifications(recipient: string = "admin", limit: number = 20) {
    if (USE_FIREBASE) {
      try {
        const { getNotifications } = await getAdapter();
        return await getNotifications(recipient, limit);
      } catch (err) {
        console.warn("Firestore notifications fetch failed.", err);
      }
    }
    return [];
  },

  async markNotificationAsRead(id: string) {
    if (USE_FIREBASE) {
      try {
        const { markNotificationAsRead } = await getAdapter();
        return await markNotificationAsRead(id);
      } catch (err) {
        console.warn("Firestore markNotificationAsRead failed.", err);
      }
    }
  },

  async markAllNotificationsAsRead(recipient: string = "admin") {
    if (USE_FIREBASE) {
      try {
        const { markAllNotificationsAsRead } = await getAdapter();
        return await markAllNotificationsAsRead(recipient);
      } catch (err) {
        console.warn("Firestore markAllNotificationsAsRead failed.", err);
      }
    }
  },

  async savePushToken(uid: string, token: string) {
    if (USE_FIREBASE) {
      try {
        const { savePushTokenInFirestore } = await getAdapter();
        return await savePushTokenInFirestore(uid, token);
      } catch (err) {
        console.warn("Firestore savePushToken failed.", err);
      }
    }
  },

  // ── User Profiles ─────────────────────────────────────────────────────
  async getUserProfile(uid: string) {
    if (USE_FIREBASE) {
      try {
        const { getUserProfileFromFirestore } = await getAdapter();
        const profile = await getUserProfileFromFirestore(uid);
        if (profile) return profile;
      } catch (err) {
        console.warn("Firestore profile fetch failed. Using local fallback.", err);
      }
    }
    const profiles = await readData(profilesFile).catch(() => ({}));
    return (profiles as any)[uid] || null;
  },

  async updateUserProfile(uid: string, data: any) {
    if (USE_FIREBASE) {
      try {
        const { updateUserProfileInFirestore } = await getAdapter();
        return await updateUserProfileInFirestore(uid, data);
      } catch (err) {
        console.warn("Firestore profile update failed. Using local fallback.", err);
      }
    }
    const profiles = await readData(profilesFile).catch(() => ({}));
    (profiles as any)[uid] = { ...(profiles as any)[uid], ...data, updatedAt: new Date().toISOString() };
    await writeData(profilesFile, profiles);
  },

  // ── TRAFFIC STATS ──
  async incrementTraffic() {
    if (USE_FIREBASE) {
      try {
        const { incrementTrafficCount } = await getAdapter();
        await incrementTrafficCount();
      } catch (err) {
        console.warn("Firestore traffic increment failed.", err);
      }
    }
  },

  async getTraffic() {
    if (USE_FIREBASE) {
      try {
        const { getTrafficCount } = await getAdapter();
        return await getTrafficCount();
      } catch (err) {
        console.warn("Firestore traffic count failed.", err);
      }
    }
    return 0;
  }
};
