"use server";

// ── Server Actions for the product detail page ──
// These run entirely on the server — no client-side JS involved.

import { revalidatePath } from "next/cache";
import { CartItem } from "./types";

/**
 * addToCartAction
 * ------------------------------------------------------------------
 * In a real app this would write to a database or session store.
 * Here we log the intent and return a structured result so the client
 * can show a toast without knowing server internals.
 */
export async function addToCartAction(item: CartItem): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // TODO: persist to DB / session
    console.log("[Server Action] Add to cart:", item);

    // Revalidate the cart page so any SSR cart count updates
    revalidatePath("/cart");

    return {
      success: true,
      message: `${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ""} added to cart!`,
    };
  } catch (err) {
    console.error("[Server Action] addToCartAction error:", err);
    return { success: false, message: "Failed to add item to cart." };
  }
}

/**
 * fetchProductById
 * ------------------------------------------------------------------
 * Used by generateMetadata (server context) to obtain product data.
 * Client components fetch via the /api/products/[id] route directly.
 */
export async function fetchProductById(id: string) {
  try {
    // Absolute URL required for server-side fetch in Next.js
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      next: { revalidate: 60 }, // ISR: refresh product data every 60 s
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
