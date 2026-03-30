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
      <Toaster
        position="bottom-right"
        expand={false}
        richColors
        closeButton
        offset={{ bottom: hideMobileNav ? 24 : 88 }}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "16px",
            fontSize: "13px",
            fontWeight: "600",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
            padding: "14px 18px",
            gap: "10px",
          },
          classNames: {
            toast:    "items-start",
            title:    "font-bold text-[13px]",
            description: "text-[11px] opacity-80 mt-0.5",
          },
        }}
      />
      {!hideMobileNav && <MobileNav />}
    </>
  );
}
