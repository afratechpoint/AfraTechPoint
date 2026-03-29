"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUI } from "@/lib/ui";
import MobileNav from "@/components/MobileNav";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import NavigationObserver from "@/components/NavigationObserver";
import PremiumLoader from "@/components/PremiumLoader";
import PushNotificationManager from "@/components/PushNotificationManager";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUI();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = ['/login', '/register', '/reset-password', '/verify-email'].includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');
  const hideMobileNav = isAuthPage || isAdminPage;

  return (
    <>
      <Suspense fallback={null}>
        <NavigationObserver />
      </Suspense>
      <AnimatePresence>
        {isLoading && <PremiumLoader />}
      </AnimatePresence>
      {children}
      <Suspense fallback={null}>
        <PushNotificationManager />
      </Suspense>
      <Toaster position="top-center" toastOptions={{
        style: { background: 'black', color: 'white', border: 'none', borderRadius: '16px' }
      }} />
      {!hideMobileNav && <MobileNav />}
    </>
  );
}
