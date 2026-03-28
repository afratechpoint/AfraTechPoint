"use server";

// ── Admin Server Actions ──────────────────────────────────────────
// All CRUD operations for products run as Next.js Server Actions.
// They talk directly to the /api/products route handler (which
// persists data to a JSON file via @/lib/db).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// ── READ ─────────────────────────────────────────────────────────

/** Fetch every product (for the product list page). */
export async function getProducts() {
  const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

/** Fetch a single product by ID (for the edit form). */
export async function getProductById(id: string) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

// ── CREATE ───────────────────────────────────────────────────────

/**
 * createProduct — called by the Add-product form.
 * FormData is parsed on the server to avoid shipping data over the wire twice.
 */
export async function createProduct(formData: FormData) {
  const body = buildProductBody(formData);

  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return { success: false, message: "Failed to create product." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

// ── UPDATE ───────────────────────────────────────────────────────

/**
 * updateProduct — called by the Edit-product form.
 */
export async function updateProduct(id: string, formData: FormData) {
  const body = buildProductBody(formData);

  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return { success: false, message: "Failed to update product." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${id}`);
  redirect("/admin/products");
}

/**
 * deleteProduct — called from the product table after confirmation.
 * Refactored to call storage directly for better reliability and performance.
 */
export async function deleteProduct(id: string) {
  try {
    const { storage } = await import("@/lib/storage");
    await storage.deleteProduct(id);

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error(`[AdminAction] deleteProduct failed for ID: ${id}`, error.message);
    return { success: false, message: "Failed to delete product." };
  }
}

// ── Helper ───────────────────────────────────────────────────────

/** Parse the flat FormData from ProductForm into a structured object. */
function buildProductBody(formData: FormData) {
  // Parse JSON blobs sent by the form (variants, specs, gallery)
  const parseJSON = (key: string, fallback: unknown = []) => {
    try { return JSON.parse(formData.get(key) as string); }
    catch { return fallback; }
  };

  return {
    name:          formData.get("name") as string,
    category:      formData.get("category") as string,
    regularPrice:  parseFloat(formData.get("regularPrice") as string) || 0,
    salePrice:     formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : undefined,
    image:         formData.get("image") as string,
    gallery:       parseJSON("gallery"),
    aboutItem:     formData.get("aboutItem") as string || undefined,
    description:   formData.get("description") as string,
    specifications: parseJSON("specifications"),
    variants:      parseJSON("variants"),
    stock:         formData.get("stock") ? parseInt(formData.get("stock") as string) : undefined,
  };
}
