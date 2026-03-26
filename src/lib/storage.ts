// lib/storage.ts
import { readData, writeData, settingsFile, productsFile, ordersFile } from "./db";

const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === "true";

// Server-side only Firestore adapter
const getAdapter = async () => {
  return await import("./firebase/server_firestore");
};

export const storage = {
  // ── Settings ──────────────────────────────────────────────────────────
  async getSettings() {
    if (USE_FIREBASE) {
      const { getSettingsFromFirestore } = await getAdapter();
      return await getSettingsFromFirestore();
    }
    return await readData(settingsFile);
  },
  async updateSettings(data: any) {
    if (USE_FIREBASE) {
      const { updateSettingsInFirestore } = await getAdapter();
      return await updateSettingsInFirestore(data);
    }
    return await writeData(settingsFile, data);
  },

  // ── Orders ────────────────────────────────────────────────────────────
  async getOrders(filters?: { userId?: string }) {
    if (USE_FIREBASE) {
      const adapter = await getAdapter();
      if (filters?.userId) {
        return await adapter.getOrdersByUser(filters.userId);
      }
      return await adapter.getAllOrders();
    }
    const orders = await readData(ordersFile);
    if (filters?.userId) {
      return orders.filter((o: any) => o.userId === filters.userId);
    }
    return orders;
  },

  async getOrderById(id: string) {
    if (USE_FIREBASE) {
      const { getOrderById } = await getAdapter();
      return await getOrderById(id);
    }
    const orders = await readData(ordersFile);
    return orders.find((o: any) => o.id === id) || null;
  },

  async createOrder(data: any) {
    if (USE_FIREBASE) {
      const { createOrderInFirestore } = await getAdapter();
      return await createOrderInFirestore(data);
    }
    const orders = await readData(ordersFile);
    const newOrder = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    orders.push(newOrder);
    await writeData(ordersFile, orders);
    return newOrder;
  },

  async updateOrder(id: string, fields: any) {
    if (USE_FIREBASE) {
      const { updateOrderInFirestore } = await getAdapter();
      return await updateOrderInFirestore(id, fields);
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
      const { deleteOrderFromFirestore } = await getAdapter();
      await deleteOrderFromFirestore(id);
      return;
    }
    const orders = await readData(ordersFile);
    const filtered = orders.filter((o: any) => o.id !== id);
    await writeData(ordersFile, filtered);
  },

  // ── Products ──────────────────────────────────────────────────────────
  async getProducts() {
    if (USE_FIREBASE) {
      const { getProductsFromFirestore } = await getAdapter();
      return await getProductsFromFirestore();
    }
    return await readData(productsFile);
  },

  async createProduct(data: any) {
    if (USE_FIREBASE) {
      const { createProductInFirestore } = await getAdapter();
      return await createProductInFirestore(data);
    }
    const products = await readData(productsFile);
    const newProduct = { id: crypto.randomUUID(), ...data };
    products.push(newProduct);
    await writeData(productsFile, products);
    return newProduct;
  },

  async updateProduct(id: string, data: any) {
    if (USE_FIREBASE) {
      const { updateProductInFirestore } = await getAdapter();
      return await updateProductInFirestore(id, data);
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
      const { deleteProductFromFirestore } = await getAdapter();
      return await deleteProductFromFirestore(id);
    }
    const products = await readData(productsFile);
    const filtered = products.filter((p: any) => p.id !== id);
    await writeData(productsFile, filtered);
  }
};
