"use client";

// ── ProductImages Component ──────────────────────────────────────
// Renders the main hero image with hover-to-zoom and a clickable
// thumbnail strip. Accepts all gallery images as a prop so the
// parent decides which images to show (main + variants + gallery).

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductImagesProps {
  /** All unique image URLs to display (main + gallery + variants) */
  images: string[];
  /** Currently active image driven by variant selection in the parent */
  activeImage: string;
  /** Notify parent when user clicks a thumbnail */
  onImageChange: (url: string) => void;
  productName: string;
}

export default function ProductImages({
  images,
  activeImage,
  onImageChange,
  productName,
}: ProductImagesProps) {
  const [backgroundPosition, setBackgroundPosition] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle zoom-lens mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-5 space-y-2 md:space-y-3"
    >
      {/* ── Main image with hover zoom ── */}
      <div
        className="relative aspect-square w-full max-w-[280px] md:max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] mx-auto border-none bg-transparent overflow-hidden cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false);
          setBackgroundPosition("50% 50%");
        }}
      >
        {/* Base image — fades out when zoomed */}
        <motion.img
          src={activeImage}
          alt={productName}
          key={activeImage}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={cn(
            "absolute inset-0 w-full h-full object-contain transition-opacity duration-200",
            isZoomed ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Zoom lens — CSS background-image trick */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200",
            isZoomed ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: `url(${activeImage})`,
            backgroundPosition,
            backgroundSize: "250%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Hover hint — desktop only */}
        <div
          className={cn(
            "hidden md:flex absolute inset-0 items-center justify-center transition-opacity bg-black/5 pointer-events-none z-20",
            isZoomed ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
            Hover to zoom
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip (only when > 1 image) ── */}
      {images.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full max-w-[280px] md:max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] mx-auto pt-1">
          {images.map((imgUrl, i) => (
            <div
              key={i}
              onClick={() => onImageChange(imgUrl)}
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 aspect-square rounded-xl md:rounded-2xl bg-white border shadow-sm transition-all duration-300 cursor-pointer overflow-hidden p-1.5 md:p-2 hover:scale-105",
                activeImage === imgUrl
                  ? "border-black border-2"
                  : "border-gray-100 opacity-50 hover:opacity-100"
              )}
            >
              <img src={imgUrl} className="w-full h-full object-contain" alt={`View ${i + 1}`} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
