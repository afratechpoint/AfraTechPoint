"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
}

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = banners.map((b, i) => ({
    title: b.title,
    description: b.description || b.subtitle || "",
    image: b.imageUrl,
    linkUrl: b.linkUrl,
    color: ["bg-[#f8f9fa]", "bg-white", "bg-[#f0f2f5]"][i % 3],
  }));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div className="relative mt-2">
      <div className="relative h-[460px] md:h-[500px] w-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 p-4 md:p-20 flex flex-col justify-center overflow-hidden",
              slide.color
            )}
          >
            {/* Overlay for mobile readability */}
            <div className="absolute inset-0 bg-white/10 md:bg-transparent md:hidden pointer-events-none z-[1]" />

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="relative md:absolute md:inset-y-0 md:right-0 w-full md:w-1/2 flex items-center justify-center md:justify-end pr-0 md:pr-12 lg:pr-32 z-0 mt-2 md:mt-0"
            >
              {slide.linkUrl ? (
                <Link
                  href={slide.linkUrl}
                  className="pointer-events-auto block relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[380px] md:h-[380px]"
                >
                  <Image
                    src={`${slide.image}${slide.image.includes('?') ? '&' : '?'}tr=w-800,f-auto,q-80`}
                    alt={`${slide.title} - Hero Image`}
                    fill
                    unoptimized={true}
                    priority={currentSlide === 0}
                    // @ts-ignore
                    fetchpriority={currentSlide === 0 ? "high" : "low"}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000 cursor-pointer"
                  />
                </Link>
              ) : (
                <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[380px] md:h-[380px]">
                  <Image
                    src={`${slide.image}${slide.image.includes('?') ? '&' : '?'}tr=w-800,f-auto,q-80`}
                    alt={`${slide.title} - Hero Image`}
                    fill
                    unoptimized={true}
                    priority={currentSlide === 0}
                    // @ts-ignore
                    fetchpriority={currentSlide === 0 ? "high" : "low"}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] md:hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              )}
            </motion.div>

            {/* Text Content */}
            <div className="z-10 relative w-full md:max-w-2xl px-2 flex flex-col items-center md:items-start text-center md:text-left pb-8 md:pb-0">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-gray-900 mb-2 md:mb-6 uppercase"
              >
                {slide.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col md:flex-row items-center md:items-start gap-4"
              >
                <div className="max-w-[480px]">
                  <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-bold line-clamp-2 md:line-clamp-none">
                    {slide.description}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-20 flex gap-2 md:gap-4">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
          >
            <ArrowLeft size={18} className="md:hidden" aria-hidden="true" />
            <ArrowUpRight
              size={20}
              className="-rotate-[135deg] hidden md:block"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
          >
            <ArrowRight size={18} className="md:hidden" aria-hidden="true" />
            <ArrowUpRight
              size={20}
              className="rotate-45 hidden md:block"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20 flex gap-2 md:gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={currentSlide === i ? "true" : "false"}
              className={cn(
                "h-1 md:h-1.5 transition-all duration-500 rounded-full",
                currentSlide === i
                  ? "w-8 md:w-12 bg-black"
                  : "w-4 md:w-6 bg-black/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
