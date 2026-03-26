"use client";

import React, { useEffect } from "react";
import { LayoutDashboard, ShoppingCart, Package, Users, ArrowLeft, Settings, Store, Image, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading, isAdmin, isShopManager, isOrderManager } = useAuth();
  
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
    <div className="flex w-full h-screen bg-gray-50/30 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col p-5 shadow-sm z-10 relative">
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
      <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full">
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
  );
}
