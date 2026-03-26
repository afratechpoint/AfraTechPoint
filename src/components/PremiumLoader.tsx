"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PremiumLoader() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
    >
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      
      <div className="relative flex flex-col items-center">
        {/* Pulsing Logo Container */}
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1, 0.95]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <img 
            src="/logo.png" 
            alt="Afra Tech Point" 
            className="h-12 w-auto object-contain grayscale" 
          />
        </motion.div>

        {/* Sleek Progress Bar / Spinner */}
        <div className="w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Subtle Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]"
        >
          Loading Afra Tech Point
        </motion.p>
      </div>

      {/* Modern Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-50 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-50 rounded-full blur-[120px] opacity-50 pointer-events-none" />
    </motion.div>
  );
}

export default PremiumLoader;
