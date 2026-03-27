"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ShoppingBag, ArrowUpRight, Github, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useUI } from "@/lib/ui";
import { useSettings } from "@/components/SettingsProvider";

export default function Home() {
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
    <div className="flex flex-col w-full">
      
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        
        {/* Navigation Bar */}
        <Navbar 
          searchEnabled={true} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {/* Hero Slider Section */}
        {/* Hero Slider Section */}
        {slides.length > 0 && (
          <div className="relative mt-2">
            <div className="relative h-[460px] md:h-[500px] w-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={cn("absolute inset-0 p-4 md:p-20 flex flex-col justify-center md:justify-center overflow-hidden", slides[currentSlide].color)}
                >
                  {/* Text protection overlay on mobile - improved density */}
                  <div className="absolute inset-0 bg-white/10 md:bg-transparent md:hidden pointer-events-none z-[1]" />
                   {/* Hero Image First on Mobile */}
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.8, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                     className="relative md:absolute md:inset-y-0 md:right-0 w-full md:w-1/2 flex items-center justify-center md:justify-end pr-0 md:pr-12 lg:pr-32 z-0 mt-2 md:mt-0"
                  >
                    {slides[currentSlide].linkUrl ? (
                      <Link href={slides[currentSlide].linkUrl} className="pointer-events-auto block">
                        <img 
                          src={slides[currentSlide].image} 
                          alt="Hero Product" 
                          className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[380px] md:h-[380px] object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000 cursor-pointer"
                        />
                      </Link>
                    ) : (
                      <img 
                        src={slides[currentSlide].image} 
                        alt="Hero Product" 
                        className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[380px] md:h-[380px] object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000"
                      />
                    )}
                  </motion.div>

                  {/* Text Content Below on Mobile */}
                  <div className="z-10 relative w-full md:max-w-2xl px-2 flex flex-col items-center md:items-start text-center md:text-left pb-8 md:pb-0">
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg md:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-gray-900 mb-2 md:mb-6 uppercase"
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col md:flex-row items-center md:items-start gap-4"
                    >
                       <div className="max-w-[480px]">
                          <p className="text-[10px] md:text-sm text-gray-400 leading-relaxed font-bold line-clamp-2 md:line-clamp-none">
                            {slides[currentSlide].description}
                          </p>
                       </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-20 flex gap-2 md:gap-4">
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
      <div className="mt-4 md:mt-16">
        <ProductGrid />
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}
