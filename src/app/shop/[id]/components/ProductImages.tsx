"use client";

// ── ProductImages Component ──────────────────────────────────────
// Renders the main hero image with hover-to-zoom and a clickable
// thumbnail strip. Accepts all gallery images as a prop so the
// parent decides which images to show (main + variants + gallery).

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle zoom-lens mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-5 space-y-3 md:space-y-4"
    >
      {/* ── Main image with hover zoom ── */}
      <div
        className="relative aspect-square w-full max-w-[280px] md:max-w-[360px] lg:max-w-[400px] mx-auto border-none bg-transparent overflow-hidden cursor-zoom-in group rounded-2xl md:rounded-3xl"
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
            "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 bg-white",
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
            "hidden md:flex absolute inset-0 items-center justify-center transition-opacity bg-black/5 pointer-events-none z-20 object-contain",
            isZoomed ? "opacity-0" : "opacity-100 group-hover:opacity-100"
          )}
        >
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
            Hover to zoom
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip (only when > 1 image) ── */}
      {images.length > 1 && (
        <div className="relative w-full max-w-[280px] md:max-w-[360px] lg:max-w-[400px] mx-auto pt-2 group">
          
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center z-10 text-black hover:scale-110 transition-transform active:scale-95 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x py-2 px-1"
          >
            {images.map((imgUrl, i) => (
              <div
                key={i}
                onClick={() => onImageChange(imgUrl)}
                className={cn(
                  "flex-shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] aspect-square rounded-xl md:rounded-[14px] bg-white border shadow-sm transition-all duration-300 cursor-pointer overflow-hidden p-2 hover:scale-105 snap-center",
                  activeImage === imgUrl
                    ? "border-black border-[2px]"
                    : "border-gray-100 opacity-60 hover:opacity-100"
                )}
              >
                <img src={imgUrl} className="w-full h-full object-contain" alt={`Thumbnail ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center z-10 text-black hover:scale-110 transition-transform active:scale-95 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>

        </div>
      )}
    </motion.div>
  );
}
