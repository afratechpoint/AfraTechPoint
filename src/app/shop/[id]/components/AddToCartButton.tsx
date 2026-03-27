"use client";

// ── AddToCartButton Component ──────────────────────────────────
// Handles all cart-related click logic. Uses the custom useCart
// hook for client-side cart state AND calls the Server Action for
// any server-side persistence / analytics.

import React, { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { addToCartAction } from "../actions";
import { Variant } from "../types";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  activePrice: number;
  displayImage: string;
  selectedVariant: Variant | null;
  hasVariants: boolean;
  quantity: number;
  currencySymbol?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  activePrice,
  displayImage,
  selectedVariant,
  hasVariants,
  quantity,
  currencySymbol = "৳",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    // Guard: require variant selection when variants exist
    if (hasVariants && !selectedVariant) {
      toast.error("Please select a variant first!");
      return;
    }

    setIsLoading(true);

    const cartItem = {
      id: productId,
      name: productName,
      price: activePrice,
      image: displayImage,
      variantName: selectedVariant?.name,
      quantity,
    };

    // 1. Optimistic update — instant client-side cart
    addItem(cartItem);

    // 2. Server Action — persistence / logging
    const result = await addToCartAction(cartItem);

    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.push("/cart");
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error("Please select a variant first!");
      return;
    }
    // Add to cart first then redirect
    await handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-text)",
          boxShadow: "0 10px 15px -3px var(--primary-accent)",
        }}
        className="h-9 md:h-11 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all group overflow-hidden relative disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        {isLoading ? (
          <Loader2 size={12} className="animate-spin relative z-10" />
        ) : (
          <ShoppingBag size={12} className="relative z-10" />
        )}
        <span className="relative z-10">{isLoading ? "Adding…" : "Add to Cart"}</span>
      </button>

      {/* Buy Now */}
      <button
        onClick={handleBuyNow}
        disabled={isLoading}
        className="h-9 md:h-11 bg-white text-black border md:border-2 border-black rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Buy Now
      </button>
    </div>
  );
}
