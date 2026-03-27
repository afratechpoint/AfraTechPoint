"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Package, Users, ArrowLeft, Settings, Store, Image, ShieldAlert, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading, isAdmin, isShopManager, isOrderManager } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Manual PWA registration for Admin
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/admin/" })
        .then((reg) => {
           console.log("Admin PWA registered with scope: /admin/");
        })
        .catch((err) => console.error("Admin PWA failed: ", err));
    }
  }, []);

  // Still keep some theme-sync for when staying on client
  useEffect(() => {
    // Override theme-color for admin
    let themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    if (themeColor) themeColor.content = "#000000";

    return () => {
      if (themeColor) themeColor.content = "#111111";
    };
  }, []);
  
  const hasAccess = isAdmin || isShopManager || isOrderManager;
  const currentRole = isAdmin ? "admin" : isShopManager ? "shop_manager" : isOrderManager ? "order_manager" : "customer";

  // Enforce access control and route-level protection
  useEffect(() => {
    if (loading) return;
    
    if (!user || !hasAccess) {
      const timer = setTimeout(() => router.push("/"), 3000);
      return () => clearTimeout(timer);
    }

    // Protect specific sub-routes
    if (!isAdmin) {
      if (pathname.startsWith("/admin/customers") || 
          pathname.startsWith("/admin/shop") || 
          pathname.startsWith("/admin/settings") ||
          pathname.startsWith("/admin/media")) {
        router.push("/admin");
      }
    }
    
    if (!isAdmin && !isShopManager) {
      if (pathname.startsWith("/admin/products")) {
        router.push("/admin");
      }
    }
    
  }, [user, loading, hasAccess, isAdmin, isShopManager, isOrderManager, pathname, router]);

  // Show spinner while auth state resolves
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // Show 403 screen for non-admins
  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 text-center p-8">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldAlert size={36} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Access Denied</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          You don&apos;t have permission to access the admin panel. Redirecting you home…
        </p>
      </div>
    );
  }

  const allNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "shop_manager", "order_manager"] },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart, roles: ["admin", "shop_manager", "order_manager"] },
    { label: "Products", href: "/admin/products", icon: Package, roles: ["admin", "shop_manager"] },
    { label: "Customers", href: "/admin/customers", icon: Users, roles: ["admin"] },
    { label: "Media Library", href: "/admin/media", icon: Image, roles: ["admin"] },
    { label: "Shop Config", href: "/admin/shop", icon: Store, roles: ["admin"] },
    { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-gray-50/30 overflow-hidden relative">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-5 h-16 bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">A</div>
          <span className="font-bold text-base tracking-tighter">Admin.</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 bg-gray-50 text-black rounded-xl border border-gray-100 active:scale-95 transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col p-5 shadow-2xl z-[50] transition-transform duration-500 ease-in-out md:shadow-sm md:relative md:w-56 md:translate-x-0 md:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shadow-black/20">A</div>
            <div>
              <span className="font-bold text-lg tracking-tighter block leading-none">Admin.</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 block">Nitec Ecosystem</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                    isActive 
                      ? "bg-black text-white shadow-md shadow-black/10 scale-[1.02]" 
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
                  )}
                >
                  <item.icon size={16} className={cn(isActive ? "text-[#ccff00]" : "text-gray-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link href="/" className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-black transition-all text-xs font-bold mt-auto border-t border-gray-50">
            <ArrowLeft size={16} />
            Back to Site
          </Link>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overscroll-y-none p-4 md:p-8 w-full bg-white md:bg-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
