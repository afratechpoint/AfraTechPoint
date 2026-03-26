"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ShoppingBag, ArrowUpRight, Github, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useUI } from "@/lib/ui";
import { useSettings } from "@/components/SettingsProvider";

export default function Home() {
  const { openCart } = useUI();
  const [searchQuery, setSearchQuery] = useState(""); 
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = useSettings();
  
  const rawBanners = settings.banners && settings.banners.length > 0 ? settings.banners : [];

  const slides = rawBanners.map((b: any, i: number) => ({
    title: b.title,
    description: b.description || b.subtitle || "", 
    image: b.imageUrl,
    linkUrl: b.linkUrl,
    color: ["bg-[#f8f9fa]", "bg-white", "bg-[#f0f2f5]"][i % 3],
    number: `0${i + 1}`
  }));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto-play slider
  React.useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);


  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        
        {/* Navigation Bar */}
        <Navbar 
          searchEnabled={true} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onOpenCart={openCart} 
        />

        {/* Hero Slider Section */}
        {slides.length > 0 && (
          <div className="relative mt-4">
            <div className="relative h-[450px] md:h-[500px] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={cn("absolute inset-0 p-8 md:p-20 flex flex-col justify-center", slides[currentSlide].color)}
                >
                  <div className="z-10 relative max-w-2xl">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.2] tracking-tight text-gray-900 mb-4 md:mb-6 uppercase"
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-start gap-4"
                    >
                       <div className="max-w-[480px]">
                          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">
                            {slides[currentSlide].description}
                          </p>
                       </div>
                    </motion.div>
                  </div>

                  <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                  <motion.div 
                     initial={{ opacity: 0, scale: 0.8, rotate: 10, y: 40 }}
                     animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                     className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-12 lg:pr-32 pointer-events-none opacity-20 md:opacity-100"
                  >
                    {slides[currentSlide].linkUrl ? (
                      <Link href={slides[currentSlide].linkUrl} className="pointer-events-auto block">
                        <img 
                          src={slides[currentSlide].image} 
                          alt="Hero Product" 
                          className="w-[240px] h-[240px] md:w-[380px] md:h-[380px] object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000 cursor-pointer"
                        />
                      </Link>
                    ) : (
                      <img 
                        src={slides[currentSlide].image} 
                        alt="Hero Product" 
                        className="w-[240px] h-[240px] md:w-[380px] md:h-[380px] object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000"
                      />
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex gap-2 md:gap-4">
                  <button 
                    onClick={prevSlide}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
                  >
                    <ArrowLeft size={18} className="md:hidden" />
                    <ArrowUpRight size={20} className="-rotate-[135deg] hidden md:block" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
                  >
                    <ArrowRight size={18} className="md:hidden" />
                    <ArrowUpRight size={20} className="rotate-45 hidden md:block" />
                  </button>
              </div>

              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20 flex gap-2 md:gap-3">
                 {slides.map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentSlide(i)}
                     className={cn(
                       "h-1 md:h-1.5 transition-all duration-500 rounded-full",
                       currentSlide === i ? "w-8 md:w-12 bg-black" : "w-4 md:w-6 bg-black/20"
                     )}
                   />
                 ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">


      </div>

      {/* Full Catalog Section */}
      <ProductGrid />

      {/* Footer */}
      <Footer />

    </div>
  );
}
