"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  light?: boolean;
}

const SIZES = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function PremiumSpinner({ size = "md", className, light = false }: PremiumSpinnerProps) {
  return (
    <div className={cn("relative flex items-center justify-center", SIZES[size], className)}>
      {/* Outer Glow/Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[1.5px] opacity-10",
        light ? "border-white" : "border-black"
      )} />
      
      {/* Spinning Arc */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className={cn(
          "absolute inset-0 rounded-full border-[1.5px] border-t-transparent border-l-transparent border-r-transparent",
          light ? "border-b-white" : "border-b-black shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
        )}
      />

      {/* Pulsing center point (optional, skip for sm) */}
      {size !== "sm" && (
        <motion.div
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            light ? "bg-white" : "bg-black"
          )}
        />
      )}
    </div>
  );
}

export default PremiumSpinner;
