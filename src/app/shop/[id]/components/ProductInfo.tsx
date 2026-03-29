"use client";

// ── ProductInfo Component ─────────────────────────────────────
// Displays product metadata: name, pricing, variant selector,
// quantity picker, and the "About this item" summary.
// Delegates cart button to AddToCartButton for separation of concerns.

import React from "react";
import { motion } from "framer-motion";
import { Star, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, Variant } from "../types";
import AddToCartButton from "./AddToCartButton";

interface ProductInfoProps {
  product: Product;
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant | null) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  activePrice: number;
  displayRegularPrice: number;
  displaySalePrice?: number;
  displayImage: string;
  currencySymbol?: string;
}

export default function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
  quantity,
  onQuantityChange,
  activePrice,
  displayRegularPrice,
  displaySalePrice,
  displayImage,
  currencySymbol = "৳",
}: ProductInfoProps) {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-7 flex flex-col pt-2 md:pt-0"
    >
      {/* ── Header: category badge + rating + name + price ── */}
      <div className="mb-3 md:mb-4 lg:mb-6">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="px-3 py-1 bg-black text-white rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            <Star size={10} className="text-black fill-current" />
            <span className="text-[8px] md:text-[9px] font-bold text-black">
              {product.rating?.toFixed(1) ?? "4.9"} / 5.0
            </span>
          </div>
          {product.reviewCount && (
            <span className="text-[8px] text-gray-400 font-medium">
              ({product.reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Product name */}
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight uppercase leading-tight">
          {product.name}
        </h1>
        {product.brand && (
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-2">
            by {product.brand}
          </p>
        )}
      </div>


      {/* ── Purchase actions card ── */}
      <div className="space-y-3 md:space-y-4 p-3 md:p-5 bg-gray-50/50 rounded-[1.2rem] md:rounded-[1.5rem] border border-gray-100 mb-4 md:mb-6">
        
        {/* Variant selector */}
        {hasVariants && (
          <div className="space-y-2 pb-3 md:pb-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Variant</p>
              <span className="text-[8px] md:text-[9px] font-bold text-black bg-white px-2 py-1 rounded-md border border-gray-100">
                Selected: {selectedVariant ? selectedVariant.name : "Choose an option"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants!.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onVariantChange(v)}
                  className={cn(
                    "px-4 md:px-5 py-2 rounded-xl text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all",
                    selectedVariant?.id === v.id
                      ? "bg-black text-white shadow-sm scale-105"
                      : "bg-white text-gray-500 hover:text-black hover:border-black border border-gray-100"
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + subtotal */}
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <div>
            <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Quantity</p>
            <div className="flex items-center bg-white border border-gray-100 rounded-lg md:rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black rounded-md transition-all"
              >
                <Minus size={12} />
              </button>
              <span className="w-6 md:w-8 text-center font-black text-[10px] md:text-[11px]">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(quantity + 1, product.stock ?? 99))}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black rounded-md transition-all"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Subtotal</p>
            <p className="text-sm md:text-base font-black text-black">
              {currencySymbol}{(activePrice * quantity).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Cart + Buy Now buttons */}
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          activePrice={activePrice}
          displayImage={displayImage}
          selectedVariant={selectedVariant}
          hasVariants={hasVariants}
          quantity={quantity}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* ── About this item ── */}
      {product.aboutItem && (
        <div className="mb-6 md:mb-8">
          <div className="w-8 h-1 bg-gray-200 mb-4" />
          <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">
            About This Item
          </h3>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium max-w-xl whitespace-pre-line">
            {product.aboutItem}
          </p>
        </div>
      )}
    </motion.div>
  );
}
