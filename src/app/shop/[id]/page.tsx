"use client";

// ── Product Detail Page (/shop/[id]) ──────────────────────────
// This is the lean orchestrator component. It:
//   - Fetches product data via the API route
//   - Computes shared derived state (prices, gallery images)
//   - Renders sub-components, passing only the props they need
//   - Coordinates state that spans multiple children (variant → image sync)
//
// generateMetadata is defined below (server-only) for SEO.

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUI } from "@/lib/ui";
import { useSettings } from "@/components/SettingsProvider";

// Co-located components
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import RelatedProducts from "./components/RelatedProducts";

// Shared types
import { Product, Variant } from "./types";

export default function ProductDetailPage() {
  const params = useParams();
  const { isCartOpen, closeCart } = useUI();
  const settings = useSettings();

  // ── Data state ────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ── UI state shared across children ──────────────────────────
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "shipping" | "reviews">("description");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // ── Derived: all unique images (main + gallery + variants) ────
  const allImages = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    const add = (url?: string) => { if (url) seen.add(url); };

    add(product.image);
    product.variants?.forEach(v => add(v.image));
    product.gallery?.forEach(add);

    return Array.from(seen);
  }, [product]);

  // ── Derived: price logic ──────────────────────────────────────
  const displayRegularPrice =
    selectedVariant?.regularPrice ?? product?.regularPrice ?? product?.price ?? 0;
  const displaySalePrice =
    selectedVariant?.salePrice !== undefined ? selectedVariant.salePrice : product?.salePrice;
  const activePrice = displaySalePrice ?? displayRegularPrice;

  // ── Active display image ──────────────────────────────────────
  // Priority: user-clicked thumbnail > variant image > main product image
  const displayImage = activeImage ?? selectedVariant?.image ?? product?.image ?? "";

  // Reset manual image selection when variant changes
  useEffect(() => { setActiveImage(null); }, [selectedVariant]);

  // ── Fetch product ─────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/products/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // ── 404 state ─────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8 text-sm">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="h-12 md:h-14 px-6 md:px-8 bg-black text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
        >
          <ArrowLeft size={18} /> Back to Shop
        </Link>
      </div>
    );
  }

  const currencySymbol = settings?.currencySymbol ?? "৳";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        <Navbar searchEnabled={false} />

        <main className="py-2 md:py-6 lg:py-4">
          {/* Mobile back link */}
          <div className="flex items-center justify-between lg:justify-end mb-4 md:mb-6">
            <Link
              href="/shop"
              className="flex lg:hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all"
            >
              <ArrowLeft size={14} /> Back to Shop
            </Link>
          </div>

          {/* Desktop: 2-column grid | Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start mt-2 md:mt-4">
            {/* Left: product images */}
            <ProductImages
              images={allImages}
              activeImage={displayImage}
              onImageChange={setActiveImage}
              productName={product.name}
            />

            {/* Right: product info, variants, cart */}
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              activePrice={activePrice}
              displayRegularPrice={displayRegularPrice}
              displaySalePrice={displaySalePrice}
              displayImage={displayImage}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* ── Detailed Info Tabs ──────────────────────────────── */}
          <section className="mt-16 md:mt-32">
            {/* Tab nav */}
            <div className="flex items-center gap-8 md:gap-16 border-b border-gray-100 mb-10 md:mb-16 overflow-x-auto pb-4 md:pb-6">
              {(["description", "specifications", "shipping", "reviews"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                    activeTab === tab ? "text-black" : "text-gray-300 hover:text-black"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-4 md:-bottom-6 left-0 right-0 h-[2px] md:h-[3px] bg-black rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[150px] md:min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl"
                >
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      {product.description ? (
                        <p className="text-gray-500 text-sm leading-relaxed font-medium whitespace-pre-line">
                          {product.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No detailed description provided.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "specifications" && (
                    <div className="space-y-4">
                      {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 md:gap-y-6">
                          {product.specifications.map((spec, i) => (
                            <div key={i} className="flex items-center justify-between py-3 md:py-4 border-b border-gray-50">
                              <span className="text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                {spec.label}
                              </span>
                              <span className="text-sm md:font-bold text-black italic">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No specifications added yet.</p>
                      )}
                    </div>
                  )}

                  {(activeTab === "shipping" || activeTab === "reviews") && (
                    <p className="text-gray-500 italic text-sm">Coming soon…</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ── Related Products ────────────────────────────────── */}
          <RelatedProducts
            currentProductId={product.id}
            category={product.category}
            currencySymbol={currencySymbol}
          />
        </main>
      </div>

      <Footer />
      
    </div>
  );
}
