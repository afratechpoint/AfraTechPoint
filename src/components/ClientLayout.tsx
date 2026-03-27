"use client";

import React, { Suspense } from "react";
import { useUI } from "@/lib/ui";
import MobileNav from "@/components/MobileNav";
import CartSidebar from "@/components/CartSidebar";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import NavigationObserver from "@/components/NavigationObserver";
import PremiumLoader from "@/components/PremiumLoader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart, openCart, isLoading } = useUI();

  return (
    <>
      <Suspense fallback={null}>
        <NavigationObserver />
      </Suspense>
      <AnimatePresence>
        {isLoading && <PremiumLoader />}
      </AnimatePresence>
      {children}
      <Toaster position="top-center" toastOptions={{
        style: { background: 'black', color: 'white', border: 'none', borderRadius: '16px' }
      }} />
      <MobileNav onOpenCart={openCart} />
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
